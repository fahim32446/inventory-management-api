import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { categories, healthLogs, products, suppliers, users, warehouses } from "./schema";

export const IHealthLog = createSelectSchema(healthLogs);
export type IHealthLogType = z.infer<typeof IHealthLog>;

export const IUserCreate = createInsertSchema(users, {
  name: (schema) => schema.name.min(1).max(50),
  email: (schema) => schema.email.email({ message: "Provide a valid email" }),
  password: (schema) => schema.password.min(6, { message: "Password too short" }),
})
  .extend({ agency_name: z.string().optional() })
  .required({
    name: true,
    email: true,
    password: true,
    agency_name: true,
  })

  .omit({
    createdAt: true,
    type: true,
    userId: true,
    orgId: true,
    roleId: true,
  });
export type IUserCreateType = z.infer<typeof IUserCreate>;

export const ZSupplier = createInsertSchema(suppliers, {
  name: (schema) => schema.name.min(1).max(50),
  email: (schema) => schema.email.email({ message: "Provide a valid email" }),
}).omit({
  createdAt: true,
  supId: true,
  orgId: true,
});

export const ZWarehouse = createInsertSchema(warehouses, {
  name: (schema) => schema.name.min(1).max(50),
}).omit({
  createdAt: true,
  whId: true,
  orgId: true,
});

export const ZCategory = createInsertSchema(categories, {
  name: (schema) => schema.name.min(1).max(50),
}).omit({
  createdAt: true,
  catId: true,
  orgId: true,
});

export const ZProduct = createInsertSchema(products, {
  name: (schema) => schema.name.min(1).max(50),
}).omit({
  createdAt: true,
  productId: true,
  orgId: true,
});
