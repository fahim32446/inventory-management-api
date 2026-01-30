import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IUserCreate } from "../../db/schema.type";
import { ApiResponse } from "../../config/types";

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

        "User created response",
      ),
      [HttpStatusCodes.CONFLICT]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Email already exists",
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
          user_or_email: z.string().nonempty(),
          password: z.string().nonempty(),
        }),
        "login user",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          success: z.boolean(),
          message: z.string().optional(),
          accessToken: z.string(),
          data: z
            .object({
              id: z.number(),
              name: z.string(),
              company_name: z.string(),
              email: z.string(),
              type: z.string(),
              two_fa: z.boolean().optional(),
              role: z
                .object({
                  id: z.number(),
                  role_name: z.string(),
                  status: z.boolean(),
                  is_main_role: z.boolean(),
                  create_date: z.string(),
                  created_by: z.string(),
                  created_by_name: z.string(),
                })
                .optional(),
              photo: z.string().optional(),
            })
            .nullable(),
        }),

        "User login response",
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Wrong credential",
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "No user found",
      ),
    },
  });

  public readonly login2FA = createRoute({
    path: "/login/2fa",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          user_or_email: z.string().nonempty(),
          otp: z.string().nonempty(),
        }),
        "login user 2fa",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          success: z.boolean(),
          message: z.string().optional(),
          accessToken: z.string(),
          data: z
            .object({
              id: z.number(),
              name: z.string(),
              company_name: z.string(),
              email: z.string(),
              type: z.string(),
              two_fa: z.boolean().optional(),
              role: z.any().optional(),
              photo: z.string().optional(),
            })
            .nullable(),
        }),

        "User login response",
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Wrong credential or OTP",
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "User not found",
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
          success: z.boolean(),
          message: z.string().optional(),
          accessToken: z.string(),
          data: z
            .object({
              id: z.number(),
              name: z.string(),
              company_name: z.string(),
              email: z.string(),
              type: z.string(),
              two_fa: z.boolean().optional(),
              role: z
                .object({
                  id: z.number(),
                  role_name: z.string(),
                  status: z.boolean(),
                  is_main_role: z.boolean(),
                  create_date: z.string(),
                  created_by: z.string(),
                  created_by_name: z.string(),
                })
                .optional(),
              photo: z.string().optional(),
            })
            .nullable(),
        }),

        "New refresh token generated",
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid or expired refresh token",
      ),
    },
  });

  public readonly logout = createRoute({
    path: "/logout",
    method: "post",
    tags: ["auth"],
    request: {},
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),

        "Logged out",
      ),
      [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid or expired refresh token",
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
        "Forgot password request",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "OTP sent successfully",
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "User not found",
      ),
    },
  });

  public readonly sendEmailVerification = createRoute({
    path: "/email-otp/send",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          email: z.string().email(),
          type: z.enum(["reset_admin", "reset_employee"]),
        }),
        "Send email verification",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        ApiResponse(z.object({ email: z.string() })),
        "OTP sent successfully",
      ),
      [HttpStatusCodes.NOT_FOUND]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "User not found",
      ),
    },
  });

  public readonly matchOptVerification = createRoute({
    path: "/email-otp/match",
    method: "post",
    tags: ["auth"],
    request: {
      body: jsonContentRequired(
        z.object({
          email: z.string().email(),
          otp: z.string(),
          type: z.enum(["reset_admin", "reset_employee"]),
        }),
        "Match OTP verification",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          success: z.boolean(),
          message: z.string(),
          token: z.string(),
        }),
        "OTP matched",
      ),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid OTP or Request",
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
          token: z.string(),
          password: z.string().min(6),
        }),
        "Reset password request",
      ),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Password reset successfully",
      ),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({
          message: z.string(),
        }),
        "Invalid token or request",
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
export type ILogin2FA = typeof instance.login2FA;
export type ISendEmailVerification = typeof instance.sendEmailVerification;
export type IMatchOptVerification = typeof instance.matchOptVerification;
export type IResetPassword = typeof instance.resetPassword;
