import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

// ---- Zod Schemas ----
export const ZRole = z.object({
  id: z.number().optional(),
  name: z.string(),
  permissionId: z.array(z.number()),
});
export type IZRole = z.infer<typeof ZRole>;

export const ZPermission = z.object({
  id: z.number().optional(),
  key: z.string(),
});

export const ZAssignPermissions = z.object({
  permissions: z.array(z.string()), // permission keys
});

// ---- Zod Schemas ----
export const ZUser = z.object({
  id: z.number().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  roleId: z.number().nullable(),
});

export type IZUser = z.infer<typeof ZUser>;

export const ZUpdateUser = ZUser.partial().extend({
  password: z.string().optional(), // password can be optional
});
export type IZUpdateUser = z.infer<typeof ZUpdateUser>;

export const ZAssignRole = z.object({
  roleId: z.number(),
});

export class administrationSchema {
  readonly getPermission = createRoute({
    path: "/permissions",
    method: "get",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({ count: z.number(), result: z.array(ZPermission) }),
        "Permissions fetched successfully"
      ),
    },
  });

  // Create a Role
  readonly createRole = createRoute({
    path: "/role",
    method: "post",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: { body: jsonContentRequired(ZRole, "Create a new role") },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(
        z.object({
          roleName: z.string(),
        }),
        "Role created successfully"
      ),
    },
  });

  readonly getRoleDetails = createRoute({
    path: "/role/details/:id",
    method: "get",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          result: z.object({
            roleId: z.number(),
            name: z.string(),
            permissions: z.array(z.object({ permissionId: z.number(), key: z.string() })),
          }),
        }),
        "Role fetched successfully"
      ),
    },
  });
  // Get all Roles
  readonly getRoles = createRoute({
    path: "/role",
    method: "get",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(
            z.object({
              roleId: z.number(),
              name: z.string(),
              isAdmin: z.boolean().nullable(),
            })
          ),
        }),
        "Roles fetched successfully"
      ),
    },
  });

  // Update a Role
  readonly updateRole = createRoute({
    path: "/role/:id",
    method: "put",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContentRequired(ZRole, "Update role details"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({ roleName: z.string(), message: z.string() }),
        "Role updated successfully"
      ),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({ message: z.string() }),
        "You can't update admin role"
      ),
    },
  });

  readonly createUser = createRoute({
    path: "/user",
    method: "post",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: { body: jsonContentRequired(ZUser, "Create a new user") },
    responses: {
      [HttpStatusCodes.CREATED]: jsonContent(ZUser, "User created successfully"),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({ message: z.string() }),
        "User already exists"
      ),
    },
  });

  // Get all Users
  readonly getUsers = createRoute({
    path: "/user/list",
    method: "get",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({
          count: z.number(),
          result: z.array(
            z.object({
              userId: z.number(),
              name: z.string(),
              email: z.string(),
              type: z.string().nullable(),
              roleId: z.number().nullable(),
              roleName: z.string().nullable(),
            })
          ),
        }),
        "Users fetched successfully"
      ),
    },
  });

  // Update User
  readonly updateUser = createRoute({
    path: "/user/:id",
    method: "put",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string() }),
      body: jsonContentRequired(ZUpdateUser, "Update user details"),
    },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(ZUser, "User updated successfully"),
      [HttpStatusCodes.BAD_REQUEST]: jsonContent(
        z.object({ message: z.string() }),
        "User not found"
      ),
    },
  });

  // Delete User
  readonly deleteUser = createRoute({
    path: "/user/:id",
    method: "delete",
    tags: ["administration"],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string() }) },
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        z.object({ message: z.string() }),
        "User deleted successfully"
      ),
    },
  });
}

const instance = new administrationSchema();

export type IRGetPermission = typeof instance.getPermission;

export type IRCreateRole = typeof instance.createRole;
export type IRgetRoleDetails = typeof instance.getRoleDetails;

export type IRGetRolesRoute = typeof instance.getRoles;
export type IRUpdateRoleRoute = typeof instance.updateRole;

export type IRCreateUser = typeof instance.createUser;
export type IRGetUsersRoute = typeof instance.getUsers;
export type IRUpdateUserRoute = typeof instance.updateUser;
export type IRDeleteUserRoute = typeof instance.deleteUser;
