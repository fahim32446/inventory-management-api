import bcrypt from "bcryptjs";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import nodemailer from "nodemailer";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { AuthModel } from "./auth.model";
import type {
  ILogin2FA,
  ILogout,
  IMatchOptVerification,
  IRefreshToken,
  IResetPassword,
  ISendEmailVerification,
  ISignIn,
  ISignUp,
} from "./auth.schema";

import { eq } from "drizzle-orm";

import { AppRouteHandler } from "../../config/types";
import { db } from "../../db/db";
import { sessions } from "../../db/schema";
import env from "../../env";

const getAuditInfo = async (c: any) => {
  const userAgent = c.req.header("User-Agent") || "";

  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")?.[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "127.0.0.1";

  // const { browser, os, device } = parseUA(userAgent);

  // Use CloudFront headers for location if available
  // const city = c.req.header("cloudfront-viewer-city");
  // const country = c.req.header("cloudfront-viewer-country-name");
  // const location = city && country ? `${city}, ${country}` : "Unknown";

  return {
    ipAddress: ip,
    userAgent: userAgent,
    location: "Unknown",
    browser: "Unknown",
    device: "Unknown",
    os: "Unknown",
  };
};

export class AuthService {
  private db_conn = new AuthModel();

  signUp: AppRouteHandler<ISignUp> = async (c) => {
    const body = c.req.valid("json");
    const { agency_name, email, name, password } = body;

    return await db.transaction(async (tx) => {
      const existingUser = await this.db_conn.checkExistingUser(email);

      if (existingUser?.users?.email) {
        return c.json({ message: "Email already in use" }, HttpStatusCodes.CONFLICT);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const org = await this.db_conn.createOrganization(agency_name, tx);

      const defaultRole = await this.db_conn.getDefaultAdminRole(tx);

      if (!defaultRole) {
        throw new Error("Default admin role configuration missing");
      }

      const user = await this.db_conn.createAdminUser(
        { name, email, password: hashedPassword, agency_name: agency_name },
        org.orgId,
        defaultRole.roleId,
        tx,
      );

      const auditInfo = await getAuditInfo(c);

      await this.db_conn.logAudit(
        {
          userId: user.userId,
          orgId: org.orgId,
          action: "USER_SIGNUP",
          details: "User registered successfully",
          ...auditInfo,
        },
        tx,
      );

      return c.json({ id: user.userId, email: user.email, name: user.name }, HttpStatusCodes.OK);
    });
  };

  signIn: AppRouteHandler<ISignIn> = async (c) => {
    const body = c.req.valid("json");
    const { user_or_email, password: user_password } = body;

    const ip = c.get("clientIp");

    return await db.transaction(async (trx) => {
      // Assuming user_or_email is email as per schema
      const db_user = await this.db_conn.checkExistingUser(user_or_email, trx);

      const user = db_user?.users;
      const org = db_user?.organization;
      const role = db_user?.roles;

      if (!user) {
        return c.json({ message: "No user found" }, HttpStatusCodes.NOT_FOUND);
      }

      const isMatch = await bcrypt.compare(user_password, user.password);

      if (!isMatch) {
        return c.json({ message: "Wrong credential" }, HttpStatusCodes.UNAUTHORIZED);
      }

      if (user.twoFa) {
        // Generate and send OTP for 2FA
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.db_conn.createOTP(user.userId, otp, "LOGIN_2FA", expiresAt, trx);

        // Send Email (Simplistic inline or helper)
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: env.EMAIL_USER,
          to: user.email,
          subject: "Login OTP",
          html: `<p>Your Login OTP is: <strong>${otp}</strong>. Expires in 5 mins.</p>`,
        });

        return c.json(
          {
            success: true,
            message: "2FA required, OTP sent to email",
            accessToken: "two_fa_required",
            data: {
              id: user.userId,
              name: user.name,
              company_name: org?.name!,
              email: user.email,
              type: user.type ?? "N/A",

              two_fa: true,
              role: role ?? undefined,
              photo: "",
            },
          },
          HttpStatusCodes.OK,
        );
      }

      const accessPayload = {
        userId: user.userId,
        orgId: org?.orgId!,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 1 day
      };

      const accessToken = await sign(accessPayload, env.JWT_SECRET);

      const refreshToken = crypto.randomUUID();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const auditInfo = await getAuditInfo(c);
      await this.db_conn.insertSession(user.userId, refreshToken, refreshExpiresAt, auditInfo, trx);

      setCookie(c, env.COOKIES_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      await this.db_conn.logAudit(
        {
          userId: user.userId,
          orgId: org?.orgId,
          action: "USER_LOGIN",
          details: "User logged in successfully",
          ...auditInfo,
        },
        trx,
      );

      return c.json(
        {
          success: true,
          message: "User logged in successfully",
          accessToken: accessToken,
          data: {
            id: user.userId,
            name: user.name,
            company_name: org?.name!,
            email: user.email,
            type: user.type ?? "N/A",

            two_fa: false,
            role: role ?? undefined,
            photo: "",
          },
        },
        HttpStatusCodes.OK,
      );
    });
  };

  login2FA: AppRouteHandler<ILogin2FA> = async (c) => {
    const body = c.req.valid("json");
    const { user_or_email, otp } = body;

    return await db.transaction(async (trx) => {
      const db_user = await this.db_conn.checkExistingUser(user_or_email, trx);
      const user = db_user?.users;
      const org = db_user?.organization;
      const role = db_user?.roles;

      if (!user) {
        return c.json({ message: "No user found" }, HttpStatusCodes.NOT_FOUND);
      }

      // Verify OTP
      const otpRecord = await this.db_conn.findOTP(user.userId, otp, "LOGIN_2FA", trx);
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return c.json({ message: "Invalid or expired OTP" }, HttpStatusCodes.UNAUTHORIZED);
      }

      // Cleanup OTP
      await this.db_conn.deleteOTP(otpRecord.id, trx);

      const accessPayload = {
        userId: user.userId,
        orgId: org?.orgId!,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };

      const accessToken = await sign(accessPayload, env.JWT_SECRET);

      const refreshToken = crypto.randomUUID();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const auditInfo = await getAuditInfo(c);
      await this.db_conn.insertSession(user.userId, refreshToken, refreshExpiresAt, auditInfo, trx);

      setCookie(c, env.COOKIES_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      await this.db_conn.logAudit(
        {
          userId: user.userId,
          orgId: org?.orgId,
          action: "USER_LOGIN_2FA",
          details: "User logged in with 2FA",
          ...auditInfo,
        },
        trx,
      );

      return c.json(
        {
          success: true,
          message: "User logged in successfully",
          accessToken: accessToken,
          data: {
            id: user.userId,
            name: user.name,
            company_name: org?.name!,
            email: user.email,
            type: user.type ?? "N/A",
            two_fa: false,
            role: role,
            photo: "",
          },
        },
        HttpStatusCodes.OK,
      );
    });
  };

  refreshToken: AppRouteHandler<IRefreshToken> = async (c) => {
    const refreshToken = getCookie(c, env.COOKIES_NAME!);

    if (!refreshToken) {
      return c.json({ message: "No refresh token" }, HttpStatusCodes.UNAUTHORIZED);
    }
    const session = await this.db_conn.checkSession(refreshToken);

    if (!session || session.expiresAt < new Date()) {
      return c.json({ message: "Invalid or expired refresh token" }, HttpStatusCodes.UNAUTHORIZED);
    }

    const { users, organization } = await this.db_conn.checkUserById(session.userId);

    const accessToken = await sign(
      {
        userId: users?.userId,
        orgId: organization?.orgId!,
        email: users?.email,
        exp: Math.floor(Date.now() / 1000) + 5,
      },
      env.JWT_SECRET!,
    );

    return c.json(
      {
        success: true,
        accessToken: accessToken,
        message: "Refresh token generated successfully",
        data: {
          id: users?.userId,
          name: users?.name,
          company_name: organization?.name!,
          email: users?.email,
          type: users?.type ?? "N/A",
        },
      },
      HttpStatusCodes.OK,
    );
  };

  logout: AppRouteHandler<ILogout> = async (c) => {
    const refreshToken = getCookie(c, env.COOKIES_NAME!);

    if (refreshToken) {
      const deletedSession = await db
        .delete(sessions)
        .where(eq(sessions.refreshToken, refreshToken))
        .returning();

      if (deletedSession.length > 0) {
        const auditInfo = await getAuditInfo(c);
        await this.db_conn.logAudit({
          userId: deletedSession[0].userId,
          action: "USER_LOGOUT",
          details: "User logged out",
          ...auditInfo,
        });
      }
      deleteCookie(c, env.COOKIES_NAME!);
    }

    return c.json({ message: "Logged out" }, HttpStatusCodes.OK);
  };

  sendEmailVerification: AppRouteHandler<ISendEmailVerification> = async (c) => {
    const { email, type } = c.req.valid("json");
    // Check if user exists? Usually yes.
    const user = await this.db_conn.checkExistingUser(email);
    if (!user || !user.users) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND); // Or 200 to mimic success
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.db_conn.createOTP(user.users.userId, otp, type, expiresAt);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: email,
      subject: "Verification OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    return c.json({ success: true, message: "OTP sent", data: { email } }, HttpStatusCodes.OK);
  };

  matchOptVerification: AppRouteHandler<IMatchOptVerification> = async (c) => {
    const { email, otp, type } = c.req.valid("json");

    return await db.transaction(async (tx) => {
      const user = await this.db_conn.checkExistingUser(email, tx);
      if (!user || !user.users) {
        return c.json({ message: "Invalid request" }, HttpStatusCodes.BAD_REQUEST);
      }

      const otpRecord = await this.db_conn.findOTP(user.users.userId, otp, type, tx);

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return c.json({ message: "Invalid or expired OTP" }, HttpStatusCodes.BAD_REQUEST);
      }

      // Generate a temporary token for the next step (e.g. reset password)
      const token = await sign(
        { email, purpose: type, exp: Math.floor(Date.now() / 1000) + 15 * 60 }, // 15 mins
        env.JWT_SECRET,
      );

      await this.db_conn.deleteOTP(otpRecord.id, tx);

      return c.json({ success: true, message: "OTP matched", token }, HttpStatusCodes.OK);
    });
  };

  resetPassword: AppRouteHandler<IResetPassword> = async (c) => {
    const { token, password } = c.req.valid("json");

    return await db.transaction(async (tx) => {
      let payload;
      try {
        payload = await verify(token, env.JWT_SECRET, "HS256");
      } catch (e) {
        return c.json({ message: "Invalid or expired token" }, HttpStatusCodes.BAD_REQUEST);
      }

      const email = (payload as any).email;
      if (!email) return c.json({ message: "Invalid token payload" }, HttpStatusCodes.BAD_REQUEST);

      const existingUser = await this.db_conn.checkExistingUser(email, tx);
      if (!existingUser || !existingUser.users) {
        return c.json({ message: "User not found" }, HttpStatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await this.db_conn.updatePassword(existingUser.users.userId, hashedPassword, tx);

      const auditInfo = await getAuditInfo(c);
      await this.db_conn.logAudit(
        {
          userId: existingUser.users.userId,
          orgId: existingUser.organization?.orgId,
          action: "PASSWORD_RESET",
          details: "Password reset successfully via token",
          ...auditInfo,
        },
        tx,
      );

      return c.json({ message: "Password reset successfully" }, HttpStatusCodes.OK);
    });
  };
}
