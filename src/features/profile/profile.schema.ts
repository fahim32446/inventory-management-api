import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { ApiResponse } from "../../config/types";

export class ProfileSchema {
  public readonly getProfile = createRoute({
    path: "/",
    method: "get",
    tags: ["profile"],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        ApiResponse(
          z.object({
            id: z.number(),
            name: z.string(),
            company_name: z.string(),
            email: z.string(),
            type: z.string(),
            two_fa: z.boolean(),
            role: z.any().optional(),
            photo: z.string().optional(),
            permission: z.array(z.string()).optional(),
          }),
        ),
        "Profile data",
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "User not found",
      ),
    },
  });

  public readonly updateProfile = createRoute({
    path: "/",
    method: "patch",
    tags: ["profile"],
    request: {
      body: jsonContentRequired(
        z.object({
          username: z.string().optional(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone_number: z.string().optional(),
          two_fa: z.boolean().optional(),
        }),
        "Update profile or toggle 2FA",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "Profile updated"),
    },
  });

  public readonly changePassword = createRoute({
    path: "/change-password",
    method: "post",
    tags: ["profile"],
    request: {
      body: jsonContentRequired(
        z.object({
          old_password: z.string(),
          new_password: z.string().min(6),
        }),
        "Change password body",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "Password changed"),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({ message: z.string() }),
        "Invalid password",
      ),
    },
  });

  public readonly getSessions = createRoute({
    path: "/sessions",
    method: "get",
    tags: ["profile"],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        ApiResponse(
          z.array(
            z.object({
              id: z.string(),
              user_id: z.number(),
              user_agent: z.string().nullable(),
              ip_address: z.string().nullable(),
              location: z.string().nullable(),
              device: z.string().nullable(),
              is_revoked: z.boolean(),
              expires_at: z.string(),
              created_at: z.string(),
              user_type: z.string(),
            }),
          ),
        ),
        "Active sessions",
      ),
    },
  });

  public readonly revokeSession = createRoute({
    path: "/sessions/{sessionId}",
    method: "delete",
    tags: ["profile"],
    request: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "Session revoked"),
    },
  });

  public readonly revokeAllSessions = createRoute({
    path: "/sessions",
    method: "delete",
    tags: ["profile"],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), "All sessions revoked"),
    },
  });
}

const instance = new ProfileSchema();
export type IGetProfile = typeof instance.getProfile;
export type IUpdateProfile = typeof instance.updateProfile;
export type IChangePassword = typeof instance.changePassword;
export type IGetSessions = typeof instance.getSessions;
export type IRevokeSession = typeof instance.revokeSession;
export type IRevokeAllSessions = typeof instance.revokeAllSessions;
