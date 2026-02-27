import * as HttpStatusCodes from "stoker/http-status-codes";
import { SupplierModel } from "./supplier.model";
import type {
  IAddSupplierRoute,
  IDeleteSupplierRoute,
  IGetSupplierRoute,
  IUpdateSupplierRoute,
} from "./supplier.schema";
import { AppRouteHandler } from "../../config/types";

export class SupplierService {
  private db_conn = new SupplierModel();

  addSupplier: AppRouteHandler<IAddSupplierRoute> = async (c) => {
    const body = c.req.valid("json");
    const org = c.get("jwtPayload");

    const res = await this.db_conn.addSupplier({ ...body, orgId: org.orgId });

    return c.json({ ...res }, HttpStatusCodes.CREATED);
  };

  updateSupplier: AppRouteHandler<IUpdateSupplierRoute> = async (c) => {
    const body = c.req.valid("json");
    const { id } = c.req.valid("param");
    const org = c.get("jwtPayload");

    const res = await this.db_conn.updateSupplier({ ...body, orgId: org.orgId }, id);

    return c.json({ ...res }, HttpStatusCodes.OK);
  };

  deleteSupplier: AppRouteHandler<IDeleteSupplierRoute> = async (c) => {
    const { id } = c.req.valid("param");

    await this.db_conn.deleteSupplier(id);

    return c.json({ message: "Supplier deleted" }, HttpStatusCodes.OK);
  };

  getSupplier: AppRouteHandler<IGetSupplierRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const { limit, offset } = c.req.valid("query");

    const res = await this.db_conn.getSupplier(org.orgId, limit, offset);
    const count = await this.db_conn.getTotalSupplier();

    // if (res.length === 0) {
    //   return c.json({ message: "No supplier found" }, HttpStatusCodes.NOT_FOUND);
    // }

    return c.json({ count, result: res, message: "Supplier fetched" }, HttpStatusCodes.OK);
  };
}
