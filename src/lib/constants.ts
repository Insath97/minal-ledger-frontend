import { type NavSection } from "@/types";

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", permission: ["Dashboard Index"] },
      { label: "Sales", href: "/sales", icon: "ShoppingCart", permission: ["Sale Index", "Sale Create", "Sale Update", "Sale Delete"] },
      { label: "Cheques", href: "/cheques", icon: "CreditCard", permission: ["Cheque Index", "Cheque Create", "Cheque Update Status", "Cheque Delete"] },
      { label: "Payments", href: "/payments", icon: "ArrowDownRight", permission: ["Payment Index", "Payment Create", "Payment Delete"] },
      { label: "Expenses", href: "/expenses", icon: "Receipt", permission: ["Expense Index", "Expense Create", "Expense Update", "Expense Delete"] },
      { label: "Customers", href: "/customers", icon: "UserCheck", permission: ["Customer Index", "Customer Create", "Customer Update", "Customer Delete"] },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        label: "Reports", href: "/reports", icon: "FileText", permission: ["Reports", "Report Sales", "Report Customer Statement", "Report Cheques", "Report Payments", "Report Expense Summary", "Report Monthly Summary", "Report Dues Aging", "Report PnL"], children: [
          { label: "Profit & Loss", href: "/reports/pnl", icon: "TrendingUp", permission: ["Reports", "Report PnL"] },
          { label: "Dues Aging", href: "/reports/dues-aging", icon: "Clock", permission: ["Reports", "Report Dues Aging"] },
          { label: "Sales Report", href: "/reports/sales", icon: "ShoppingCart", permission: ["Reports", "Report Sales"] },
          { label: "Customer Statement", href: "/reports/customer-statement", icon: "UserCheck", permission: ["Reports", "Report Customer Statement"] },
          { label: "Cheque Report", href: "/reports/cheque-report", icon: "CreditCard", permission: ["Reports", "Report Cheques"] },
          { label: "Payment Report", href: "/reports/payment-report", icon: "ArrowDownRight", permission: ["Reports", "Report Payments"] },
          { label: "Expense Summary", href: "/reports/expense-summary", icon: "Receipt", permission: ["Reports", "Report Expense Summary"] },
          { label: "Monthly Summary", href: "/reports/monthly-summary", icon: "TrendingUp", permission: ["Reports", "Report Monthly Summary"] },
        ]
      },
    ],
  },
  {
    title: "GENERAL",
    items: [
      { label: "Banks", href: "/banks", icon: "Building2", permission: ["Bank Index", "Bank Create", "Bank Update", "Bank Delete"] },
      { label: "Users", href: "/users", icon: "Users", permission: ["User Index", "User Create", "User Update", "User Delete"] },
      { label: "Roles", href: "/roles", icon: "Shield", permission: ["Role Index", "Role Create", "Role Update", "Role Delete"] },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
  },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  LKR: "Rs.",
};

export const CURRENCY_FLAGS: Record<string, string> = {
  LKR: "🇱🇰",
};

export const APP_NAME = "Minal Ledger";
export const APP_DESCRIPTION = "Monitor and control what happens with your money today for financial health.";
