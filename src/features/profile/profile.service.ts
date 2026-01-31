import bcrypt from "bcryptjs";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppRouteHandler } from "../../config/types";
import { ProfileModel } from "./profile.model";
import type {
  IChangePassword,
  IGetProfile,
  IGetSessions,
  IRevokeAllSessions,
  IRevokeSession,
  IUpdateProfile,
} from "./profile.schema";
import { AuthModel } from "../auth/auth.model";

export class ProfileService {
  private db_conn = new ProfileModel();

  getProfile: AppRouteHandler<IGetProfile> = async (c) => {
    const payload = c.get("jwtPayload");
    const user = await this.db_conn.getUserProfile(payload.userId);

    const db_conn = new AuthModel();
    const permission = await db_conn.getPermissions(payload.userId);

    if (!user) {
      return c.json({ message: "User not found" }, HttpStatusCodes.NOT_FOUND);
    }

    // Transform to match schema
    // Schema: id, name, company_name, email, type, two_fa, role, photo
    const responseData = {
      id: user.users.userId,
      name: user.users.name,
      company_name: user.organization?.name || "",
      email: user.users.email,
      type: user.users.type || "N/A",
      two_fa: user.users.twoFa || false,
      role: user.roles ?? undefined,
      photo: "",
      permission,
    };

    return c.json(
      { success: true, message: "Profile data", data: responseData },
      HttpStatusCodes.OK,
    );
  };

  updateProfile: AppRouteHandler<IUpdateProfile> = async (c) => {
    const payload = c.get("jwtPayload");
    const body = c.req.valid("json");

    await this.db_conn.updateUser(payload.userId, {
      name: body.name,
      email: body.email,
      twoFa: body.two_fa,
    });

    return c.json({ message: "Profile updated" }, HttpStatusCodes.OK);
  };

  changePassword: AppRouteHandler<IChangePassword> = async (c) => {
    const payload = c.get("jwtPayload");
    const { old_password, new_password } = c.req.valid("json");

    const currentPassword = await this.db_conn.getUserPassword(payload.userId);
    if (!currentPassword) {
      return c.json({ message: "User not found" }, HttpStatusCodes.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(old_password, currentPassword);
    if (!isMatch) {
      return c.json({ message: "Invalid password" }, HttpStatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await this.db_conn.updatePassword(payload.userId, hashedPassword);

    return c.json({ message: "Password changed" }, HttpStatusCodes.OK);
  };

  getSessions: AppRouteHandler<IGetSessions> = async (c) => {
    const payload = c.get("jwtPayload");
    const sessions = await this.db_conn.getSessions(payload.userId);

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      user_id: s.userId,
      user_agent: s.userAgent,
      ip_address: s.ipAddress,
      location: s.location,
      device: s.device,
      is_revoked: false,
      expires_at: s.expiresAt.toISOString(),
      created_at: s.createdAt?.toISOString() || "",
      user_type: "N/A",
    }));

    return c.json(
      { success: true, message: "Active sessions", data: formattedSessions },
      HttpStatusCodes.OK,
    );
  };

  revokeSession: AppRouteHandler<IRevokeSession> = async (c) => {
    const payload = c.get("jwtPayload");
    const { sessionId } = c.req.valid("param");

    await this.db_conn.revokeSession(sessionId, payload.userId);

    return c.json({ message: "Session revoked" }, HttpStatusCodes.OK);
  };

  revokeAllSessions: AppRouteHandler<IRevokeAllSessions> = async (c) => {
    const payload = c.get("jwtPayload");
    await this.db_conn.revokeAllSessions(payload.userId);

    return c.json({ message: "All sessions revoked" }, HttpStatusCodes.OK);
  };
}
