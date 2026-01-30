import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ENUM
export const userTypeE = pgEnum("user_type", ["ADMIN", "EMPLOYEE"]);

// ORGANIZATION
export const organization = pgTable("organization", {
  orgId: serial("org_id").primaryKey(),
  name: text("name").notNull(),
  createdAt: date("created_at").defaultNow(),
});

// USERS
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: date("created_at").defaultNow(),
  orgId: integer("org_id").references(() => organization.orgId, {
    onDelete: "cascade",
  }),
  roleId: integer("role_id").references(() => roles.roleId),
  type: userTypeE("type"),
  twoFa: boolean("two_fa").default(false),
});

export const roles = pgTable("roles", {
  roleId: serial("role_id").primaryKey(),
  name: text("name").notNull(),
  orgId: integer("org_id").references(() => organization.orgId, { onDelete: "cascade" }),

  isAdmin: boolean("is_admin").default(false),
});

export const permissions = pgTable("permissions", {
  permissionId: serial("permission_id").primaryKey(),
  key: text("key").notNull().unique(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id").references(() => roles.roleId, { onDelete: "cascade" }),

    permissionId: integer("permission_id").references(() => permissions.permissionId, {
      onDelete: "cascade",
    }),
  },
  (t) => ({
    pk: primaryKey(t.roleId, t.permissionId),
  }),
);

// SESSIONS
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  refreshToken: varchar("refresh_token", { length: 500 }).notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  location: text("location"),
  device: text("device"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// AUDIT LOG
export const auditLog = pgTable("audit_log", {
  auditId: serial("audit_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId),
  orgId: integer("org_id").references(() => organization.orgId),
  action: text("action"),
  details: text("details"),
  ip: text("ip"),
  location: text("location"),
  browser: text("browser"),
  device: text("device"),
  os: text("os"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// CATEGORIES
export const categories = pgTable("categories", {
  catId: serial("cat_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  orgId: integer("org_id").references(() => organization.orgId, {
    onDelete: "cascade",
  }),
  createdAt: date("created_at").defaultNow(),
});

// PRODUCTS
export const products = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  orgId: integer("org_id").references(() => organization.orgId, {
    onDelete: "cascade",
  }),
  catId: integer("cat_id").references(() => categories.catId),
  name: text("name").notNull(),
  sku: text("sku"),
  description: text("description"),
  createdAt: date("created_at").defaultNow(),
});

// SUPPLIERS
export const suppliers = pgTable("suppliers", {
  supId: serial("sup_id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: date("created_at").defaultNow(),
  orgId: integer("org_id").references(() => organization.orgId, {
    onDelete: "cascade",
  }),
});

// HEALTH LOGS
export const healthLogs = pgTable("health_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// WAREHOUSES
export const warehouses = pgTable("warehouses", {
  whId: serial("wh_id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  createdAt: date("created_at").defaultNow().notNull(),
  orgId: integer("org_id").references(() => organization.orgId, {
    onDelete: "cascade",
  }),
});

export const sales = pgTable("sales", {
  saleId: serial("sale_id").primaryKey(),
  orgId: integer("org_id")
    .references(() => organization.orgId, { onDelete: "cascade" })
    .notNull(),
  customerName: text("customer_name"),
  saleDate: date("sale_date").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.userId),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .references(() => sales.saleId, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => purchaseItems.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  subtotal: integer("subtotal").notNull(),
});

export const purchases = pgTable("purchases", {
  purchaseId: serial("purchase_id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.supId, {
    onDelete: "set null",
  }),
  orgId: integer("org_id")
    .references(() => organization.orgId, { onDelete: "cascade" })
    .notNull(),
  invoiceNo: text("invoice_no"),
  purchaseDate: date("purchase_date").defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
});

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id")
    .references(() => purchases.purchaseId, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.productId, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: integer("unit_cost").notNull(),
  subtotal: integer("subtotal").notNull(),
});

// OTP CODES
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: text("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
