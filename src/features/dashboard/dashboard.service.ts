import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppRouteHandler } from "../../config/types";
import { DashboardModel } from "./dashboard.model";
import { IRGetAnalyticsRoute } from "./dashboard.schema";

export class DashboardService {
  private model = new DashboardModel();

  getAnalytics: AppRouteHandler<IRGetAnalyticsRoute> = async (c) => {
    const org = c.get("jwtPayload");
    const orgId = org.orgId;

    const revenue = await this.model.getRevenue(orgId);
    const expenses = await this.model.getExpenses(orgId);
    const profit = revenue - expenses;
    const { inflows, outflows } = await this.model.getMonthlyCashFlow(orgId);
    const revenueByCat = await this.model.getRevenueByCategories(orgId);
    const recentTx = await this.model.getRecentTransactions(orgId);

    // Format Stats
    const stats = [
      {
        title: "Total Revenue",
        value: `${revenue.toLocaleString()}`,
        trend: "+0%", // Placeholder as historical data comparison requires more complexity
        isUp: true,
        color: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        title: "Total Expenses",
        value: `${expenses.toLocaleString()}`,
        trend: "+0%",
        isUp: false,
        color: "bg-rose-50 dark:bg-rose-900/20",
      },
      {
        title: "Net Profit",
        value: `${profit.toLocaleString()}`,
        trend: "+0%",
        isUp: profit >= 0,
        color: "bg-emerald-50 dark:bg-emerald-900/20",
      },
      {
        title: "Pending Invoices",
        value: "0",
        trend: "-0%",
        isUp: true,
        color: "bg-amber-50 dark:bg-amber-900/20",
      },
    ];

    // Format Cash Flow
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const cashFlow = monthNames
      .map((month) => {
        const inflow = inflows.find((i) => i.month === month)?.amount || 0;
        const outflow = outflows.find((o) => o.month === month)?.amount || 0;
        return { month, inflow, outflow };
      })
      .filter((cf) => cf.inflow > 0 || cf.outflow > 0);

    // If empty, provide some default labels for the chart at least
    if (cashFlow.length === 0) {
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6Months.push({ month: monthNames[d.getMonth()], inflow: 0, outflow: 0 });
      }
      cashFlow.push(...last6Months);
    }

    // Format Revenue Distribution
    const totalRev = revenueByCat.reduce((acc, curr) => acc + Number(curr.value), 0);
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];
    const revenueDistribution = revenueByCat.map((item, idx) => ({
      name: item.name,
      value: totalRev > 0 ? Math.round((Number(item.value) / totalRev) * 100) : 0,
      color: colors[idx % colors.length],
    }));

    // Format Recent Transactions
    const recentTransactions = recentTx.map((tx, idx) => ({
      key: String(idx + 1),
      id: tx.id || `TXN-${Math.floor(Math.random() * 10000)}`,
      date: tx.date,
      customer: tx.customer || "Walking Customer",
      amount: Number(tx.amount),
      status: tx.status,
      type: tx.type as any,
      category: tx.type === "Inbound" ? "Sales" : "Purchase",
    }));

    return c.json(
      {
        stats,
        cashFlow,
        revenueDistribution,
        recentTransactions,
      },
      HttpStatusCodes.OK,
    );
  };
}
