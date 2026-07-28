import { type NavSection } from "@/types";

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Sales", href: "/sales", icon: "ShoppingCart" },
      { label: "Cheques", href: "/cheques", icon: "CreditCard" },
      { label: "Payments", href: "/payments", icon: "ArrowDownRight" },
      { label: "Expenses", href: "/expenses", icon: "Receipt" },
      { label: "Customers", href: "/customers", icon: "UserCheck" },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { label: "Reports", href: "/reports", icon: "FileText", children: [
        { label: "Profit & Loss", href: "/reports/pnl", icon: "TrendingUp" },
        { label: "Dues Aging", href: "/reports/dues-aging", icon: "Clock" },
        { label: "Sales Report", href: "/reports/sales", icon: "ShoppingCart" },
        { label: "Customer Statement", href: "/reports/customer-statement", icon: "UserCheck" },
        { label: "Cheque Report", href: "/reports/cheque-report", icon: "CreditCard" },
        { label: "Payment Report", href: "/reports/payment-report", icon: "ArrowDownRight" },
        { label: "Expense Summary", href: "/reports/expense-summary", icon: "Receipt" },
        { label: "Monthly Summary", href: "/reports/monthly-summary", icon: "TrendingUp" },
      ]},
    ],
  },
  {
    title: "GENERAL",
    items: [
      { label: "Banks", href: "/banks", icon: "Building2" },
      { label: "Users", href: "/users", icon: "Users" },
      { label: "Roles", href: "/roles", icon: "Shield" },
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
