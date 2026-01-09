import type { AppRouteHandler } from "config/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { CategoryModel } from "./category.model";
import {
  type IRAddCategoryRoute,
  type IRDeleteCategoryRoute,
  type IRGetCategoryRoute,
  type IRUpdateCategoryRoute,
} from "./category.schema";

export class CategoryService {
  private db_conn = new CategoryModel();

  addCategory: AppRouteHandler<IRAddCategoryRoute> = async (c) => {
    const body = c.req.valid("json");
    const org = c.get("jwtPayload");

    const res = await this.db_conn.addCategory({ ...body, orgId: org.orgId });

    return c.json({ ...res }, HttpStatusCodes.CREATED);
  };

  updateCategory: AppRouteHandler<IRUpdateCategoryRoute> = async (c) => {
    const body = c.req.valid("json");
    const { id } = c.req.valid("param");
    const org = c.get("jwtPayload");

    const res = await this.db_conn.updateCategory({ ...body, orgId: org.orgId }, id);

    return c.json({ ...res }, HttpStatusCodes.OK);
  };

  deleteCategory: AppRouteHandler<IRDeleteCategoryRoute> = async (c) => {
    const { id } = c.req.valid("param");

    await this.db_conn.deleteCategory(id);

    return c.json({ message: "Category deleted" }, HttpStatusCodes.OK);
  };

  getCategory: AppRouteHandler<IRGetCategoryRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const { limit, offset } = c.req.valid("query");

    const res = await this.db_conn.getCategory(org.orgId, limit, offset);
    const count = await this.db_conn.getTotalCategory();

    if (res.length === 0) {
      return c.json({ message: "No category found" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ count, result: res }, HttpStatusCodes.OK);
  };
}
