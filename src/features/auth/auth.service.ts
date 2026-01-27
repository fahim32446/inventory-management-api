import bcrypt from "bcryptjs";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import nodemailer from "nodemailer";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { AuthModel } from "./auth.model";
import type {
  IForgotPassword,
  ILogout,
  IRefreshToken,
  IResetPassword,
  ISignIn,
  ISignUp,
} from "./auth.schema";

import { eq } from "drizzle-orm";
// import { UAParser } from "ua-parser-js";
// import geoip from "geoip-lite";

import { AppRouteHandler } from "../../config/types";
import { db } from "../../db/db";
import { sessions } from "../../db/schema";
import env from "../../env";

const getAuditInfo = (c: any) => {
  const userAgent = c.req.header("User-Agent") || "";
  const ip = c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || "127.0.0.1";

  // const parser = new UAParser(userAgent);
  // const result = parser.getResult();
  // const geo = geoip.lookup(ip);

  return {
    ip,
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

      const auditInfo = getAuditInfo(c);
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
    const { email, password: user_password } = body;

    return await db.transaction(async (trx) => {
      const db_user = await this.db_conn.checkExistingUser(email, trx);

      const user = db_user?.users;
      const org = db_user?.organization;

      if (!user) {
        return c.json({ message: "No user found" }, HttpStatusCodes.NOT_FOUND);
      }

      const isMatch = await bcrypt.compare(user_password, user.password);

      if (!isMatch) {
        return c.json({ message: "Wrong credential" }, HttpStatusCodes.UNAUTHORIZED);
      }

      const accessPayload = {
        userId: user.userId,
        orgId: org?.orgId!,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 5, // 1 minute
      };

      const accessToken = await sign(accessPayload, env.JWT_SECRET);

      const refreshToken = crypto.randomUUID();
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await this.db_conn.deleteSession(user.userId, trx);

      await this.db_conn.insertSession(user.userId, refreshToken, refreshExpiresAt, trx);

      setCookie(c, env.COOKIES_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      const auditInfo = getAuditInfo(c);
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
          data: {
            id: user.userId,
            name: user.name,
            company_name: org?.name!,
            email: user.email,
            type: user.type ?? "N/A",
            accessToken: accessToken,
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
        message: "Refresh token generated successfully",
        data: {
          id: users?.userId,
          name: users?.name,
          company_name: organization?.name!,
          email: users?.email,
          type: users?.type ?? "N/A",
          accessToken: accessToken,
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
        const auditInfo = getAuditInfo(c);
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

  forgotPassword: AppRouteHandler<IForgotPassword> = async (c) => {
    const { email } = c.req.valid("json");

    const existingUser = await this.db_conn.checkExistingUser(email);
    if (!existingUser || !existingUser.users) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.db_conn.createOTP(existingUser.users.userId, otp, "FORGOT_PASSWORD", expiresAt);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    const auditInfo = getAuditInfo(c);
    await this.db_conn.logAudit({
      userId: existingUser.users.userId,
      orgId: existingUser.organization?.orgId,
      action: "FORGOT_PASSWORD_REQUEST",
      details: "OTP sent to email",
      ...auditInfo,
    });

    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    return c.json({ message: "OTP sent successfully" }, HttpStatusCodes.OK);
  };

  resetPassword: AppRouteHandler<IResetPassword> = async (c) => {
    const { email, code, newPassword } = c.req.valid("json");

    return await db.transaction(async (tx) => {
      const existingUser = await this.db_conn.checkExistingUser(email, tx);
      if (!existingUser || !existingUser.users) {
        return c.json({ message: "Invalid or expired OTP" }, HttpStatusCodes.BAD_REQUEST);
      }

      const otpRecord = await this.db_conn.findOTP(
        existingUser.users.userId,
        code,
        "FORGOT_PASSWORD",
        tx,
      );

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return c.json({ message: "Invalid or expired OTP" }, HttpStatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.db_conn.updatePassword(existingUser.users.userId, hashedPassword, tx);
      await this.db_conn.deleteOTP(otpRecord.id, tx);

      const auditInfo = getAuditInfo(c);
      await this.db_conn.logAudit(
        {
          userId: existingUser.users.userId,
          orgId: existingUser.organization?.orgId,
          action: "PASSWORD_RESET",
          details: "Password reset successfully using OTP",
          ...auditInfo,
        },
        tx,
      );

      return c.json({ message: "Password reset successfully" }, HttpStatusCodes.OK);
    });
  };
}
