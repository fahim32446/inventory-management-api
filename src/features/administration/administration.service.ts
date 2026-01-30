import bcrypt from "bcryptjs";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { administrationModel } from "./administration.model";
import type {
  IRCreateRole,
  IRCreateUser,
  IRDeleteUserRoute,
  IRGetPermission,
  IRGetRolesRoute,
  IRGetUsersRoute,
  IRUpdateRoleRoute,
  IRUpdateUserRoute,
  IRgetRoleDetails,
} from "./administration.schema";
import { AuthModel } from "../auth/auth.model";
import { AppRouteHandler } from "../../config/types";

export class administrationService {
  private db_conn = new administrationModel();
  private auth_conn = new AuthModel();

  getPermission: AppRouteHandler<IRGetPermission> = async (c) => {
    const res = await this.db_conn.getPermission();
    return c.json({ count: res.length, result: res }, HttpStatusCodes.OK);
  };

  createRole: AppRouteHandler<IRCreateRole> = async (c) => {
    const org = c.get("jwtPayload");
    const body = c.req.valid("json");

    const res = await this.db_conn.createRole({
      ...body,
      orgId: org.orgId,
      isAdmin: false,
    });
    return c.json({ roleName: res.roleName }, HttpStatusCodes.CREATED);
  };

  updateRole: AppRouteHandler<IRUpdateRoleRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const body = c.req.valid("json");
    const { id } = c.req.valid("param");

    const data = await this.db_conn.roleIsAdmin(id);
    if (data.isAdmin) {
      return c.json({ message: "You can't update admin role" }, HttpStatusCodes.BAD_REQUEST);
    }

    const res = await this.db_conn.updateRole(
      {
        ...body,
        orgId: org.orgId,
        isAdmin: false,
      },
      id,
    );
    return c.json(
      { roleName: res.roleName, message: "Role updated successfully" },
      HttpStatusCodes.OK,
    );
  };

  getRoleDetails: AppRouteHandler<IRgetRoleDetails> = async (c) => {
    const { id } = c.req.valid("param");
    const res = await this.db_conn.getRoleDetails(id);
    return c.json(
      {
        result: {
          name: res?.name!,
          roleId: res?.roleId!,
          permissions: res?.permissions!,
        },
      },
      HttpStatusCodes.OK,
    );
  };

  getRoles: AppRouteHandler<IRGetRolesRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const res = await this.db_conn.getRoles(org.orgId);

    return c.json({ count: res.length, result: res }, HttpStatusCodes.OK);
  };

  createUser: AppRouteHandler<IRCreateUser> = async (c) => {
    const org = c.get("jwtPayload");
    const body = c.req.valid("json");

    const { password, ...others } = body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.auth_conn.checkExistingUser(others.email);
    if (user) {
      return c.json({ message: "User already exists" }, HttpStatusCodes.BAD_REQUEST);
    }

    const { userId, type, ...rest } = await this.db_conn.createUser(
      { ...others, password: hashedPassword },
      org.orgId,
    );
    return c.json({ id: userId, ...rest }, HttpStatusCodes.CREATED);
  };

  getUsers: AppRouteHandler<IRGetUsersRoute> = async (c) => {
    const org = c.get("jwtPayload");

    const res = await this.db_conn.getUsers(org.orgId);
    return c.json({ count: res.length, result: res }, HttpStatusCodes.OK);
  };

  updateUser: AppRouteHandler<IRUpdateUserRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const body = c.req.valid("json");
    const { id } = c.req.valid("param");

    const { password, ...others } = body;

    const user = await this.auth_conn.checkExistingUser(others?.email!);

    if (user) {
      return c.json({ message: "User already exists" }, HttpStatusCodes.BAD_REQUEST);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const res = await this.db_conn.updateUser(
        { ...others, password: hashedPassword },
        org.orgId,
        id,
      );
      const { userId, ...rest } = res;
      return c.json({ id: userId, ...rest } as any, HttpStatusCodes.OK);
    }
    const res = await this.db_conn.updateUser(others, org.orgId, id);
    const { userId, ...rest } = res;
    return c.json({ id: userId, ...rest } as any, HttpStatusCodes.OK);
  };

  deleteUser: AppRouteHandler<IRDeleteUserRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const { id } = c.req.valid("param");

    await this.db_conn.deleteUser(org.orgId, id);

    return c.json({ message: "User deleted" }, HttpStatusCodes.OK);
  };
}
