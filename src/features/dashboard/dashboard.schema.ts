import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const ZStats = z.object({
  title: z.string(),
  value: z.string(),
  trend: z.string(),
  isUp: z.boolean(),
  color: z.string(),
});

const ZCashFlow = z.object({
  month: z.string(),
  inflow: z.number(),
  outflow: z.number(),
});

const ZRevenueDistribution = z.object({
  name: z.string(),
  value: z.number(),
  color: z.string(),
});

const ZRecentTransaction = z.object({
  key: z.string(),
  id: z.string(),
  date: z.string(),
  customer: z.string(),
  amount: z.number(),
  status: z.string(),
  type: z.enum(["Inbound", "Outbound"]),
  category: z.string(),
});

const ZDashboardAnalyticsResponse = z.object({
  stats: z.array(ZStats),
  cashFlow: z.array(ZCashFlow),
  revenueDistribution: z.array(ZRevenueDistribution),
  recentTransactions: z.array(ZRecentTransaction),
});

export class DashboardSchema {
  readonly getAnalytics = createRoute({
    path: "/analytics",
    method: "get",
    tags: ["dashboard"],
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(ZDashboardAnalyticsResponse, "Dashboard analytics data"),
    },
  });
}

const instance = new DashboardSchema();
export type IRGetAnalyticsRoute = typeof instance.getAnalytics;
