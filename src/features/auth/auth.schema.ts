import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IUserCreate } from "../../db/schema.type";

export class AuthSchema {
  public readonly signUp = createRoute({
    path: "/signup",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(IUserCreate, "signup users"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        }),

        "User created response"
      ),
      [HttpStatusCodes.CONFLICT]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Email already exists"
      ),
    },
  });

  public readonly signIn = createRoute({
    path: "/login",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          email: z.string().nonempty().default("fahim@gmail.com"),
          password: z.string().nonempty().default("12345678"),
        }),
        "login user"
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          id: z.number(),
          name: z.string(),
          company_name: z.string(),
          email: z.string(),
          type: z.string(),
          accessToken: z.string(),
        }),

        "User login response"
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Wrong credential"
      ),

      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "No user found"
      ),
    },
  });

  public readonly refreshToken = createRoute({
    path: "/refresh-token",
    method: "get",
    tags: ["auth"],
    request: {},
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          accessToken: z.string(),
        }),

        "New refresh token generated"
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid or expired refresh token"
      ),
    },
  });

  public readonly logout = createRoute({
    path: "/logout",
    method: "get",
    tags: ["auth"],
    request: {},
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),

        "Logged out"
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid or expired refresh token"
      ),
    },
  });

  public readonly forgotPassword = createRoute({
    path: "/forgot-password",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          email: z.string().email(),
        }),
        "Forgot password request"
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "OTP sent successfully"
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "User not found"
      ),
    },
  });

  public readonly resetPassword = createRoute({
    path: "/reset-password",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          email: z.string().email(),
          code: z.string().length(6),
          newPassword: z.string().min(6),
        }),
        "Reset password request"
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Password reset successfully"
      ),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid or expired OTP"
      ),
    },
  });
}

const instance = new AuthSchema();
export type ISignUp = typeof instance.signUp;
export type ISignIn = typeof instance.signIn;
export type IRefreshToken = typeof instance.refreshToken;
export type ILogout = typeof instance.logout;
export type IForgotPassword = typeof instance.forgotPassword;
export type IResetPassword = typeof instance.resetPassword;
