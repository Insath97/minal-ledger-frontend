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
        { label: "Financial Dashboard", href: "/reports/financial-dashboard", icon: "BarChart3" },
        { label: "Profit & Loss", href: "/reports/pnl", icon: "TrendingUp" },
        { label: "Income Breakdown", href: "/reports/income-breakdown", icon: "ArrowDownRight" },
        { label: "Expense Breakdown", href: "/reports/expense-breakdown", icon: "TrendingDown" },
        { label: "Dues Aging", href: "/reports/dues-aging", icon: "Clock" },
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
  USD: "$",
  EUR: "€",
  BDT: "৳",
  GBP: "£",
};

export const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  BDT: "🇧🇩",
  GBP: "🇬🇧",
};

export const APP_NAME = "Minal Ledger";
export const APP_DESCRIPTION = "Monitor and control what happens with your money today for financial health.";
