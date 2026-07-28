import type { User, Wallet, Transaction, SavingsGoal, ChartDataPoint, StatCardData, Permission, Role } from "@/types";

export const currentUser: User = {
  id: "1",
  name: "Sajibur Rahman",
  email: "sajib@minaledger.com",
  avatar: "",
  phone: "+1 (555) 123-4567",
  bio: "Financial enthusiast focused on building wealth through smart investments.",
  role: "Admin",
  joinedAt: "2024-01-15",
};

export const wallets: Wallet[] = [
  { id: "1", currency: "LKR", balance: 22678.0, isActive: true },
];

export const recentTransactions: Transaction[] = [
  {
    id: "1",
    activity: "Mobile App Purchase",
    icon: "Smartphone",
    iconColor: "#10b981",
    date: "Wed, 12 Jun 2026",
    price: 806.5,
    status: "success",
  },
  {
    id: "2",
    activity: "Software License",
    icon: "Layers",
    iconColor: "#ef4444",
    date: "Tue, 11 Jun 2026",
    price: 102.99,
    status: "success",
  },
  {
    id: "3",
    activity: "Grocery Purchase",
    icon: "ShoppingCart",
    iconColor: "#f59e0b",
    date: "Sun, 09 Jun 2026",
    price: 2500.0,
    status: "success",
  },
];

export const savingsGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "Investment Goal",
    target: 25000,
    current: 15600,
    icon: "TrendingUp",
  },
  {
    id: "2",
    name: "Emergency Fund",
    target: 10000,
    current: 7200,
    icon: "Shield",
  },
];

export const overviewData: ChartDataPoint[] = [
  { month: "Jan", earnings: 12000 },
  { month: "Feb", earnings: 18000 },
  { month: "Mar", earnings: 15000 },
  { month: "Apr", earnings: 22000 },
  { month: "May", earnings: 19000 },
  { month: "Jun", earnings: 25000 },
  { month: "Jul", earnings: 20000 },
  { month: "Aug", earnings: 84849.93 },
  { month: "Sep", earnings: 28000 },
  { month: "Oct", earnings: 30000 },
  { month: "Nov", earnings: 24000 },
  { month: "Dec", earnings: 32000 },
];

export const dashboardStats: StatCardData[] = [
  {
    title: "Account Balance",
    value: 35340.89,
    prefix: "$",
    change: 3.2,
    changeLabel: "from last month",
    icon: "Wallet",
  },
  {
    title: "Total Expenses",
    value: 9845.2,
    prefix: "$",
    change: -2.1,
    changeLabel: "from last month",
    icon: "TrendingDown",
  },
  {
    title: "Total Savings",
    value: 18420.75,
    prefix: "$",
    change: 4.5,
    changeLabel: "from last month",
    icon: "PiggyBank",
  },
];

export const totalEarnings = 84849.93;

export const mockPermissions: Permission[] = [
  { id: 1, name: "View Dashboard", group_name: "Dashboard", guard_name: "api", created_at: "2024-01-15T00:00:00.000000Z", updated_at: "2024-01-15T00:00:00.000000Z" },
  { id: 2, name: "Manage Users", group_name: "Users", guard_name: "api", created_at: "2024-01-16T00:00:00.000000Z", updated_at: "2024-01-16T00:00:00.000000Z" },
  { id: 3, name: "View Transactions", group_name: "Transactions", guard_name: "api", created_at: "2024-01-17T00:00:00.000000Z", updated_at: "2024-01-17T00:00:00.000000Z" },
  { id: 4, name: "Create Transactions", group_name: "Transactions", guard_name: "api", created_at: "2024-01-18T00:00:00.000000Z", updated_at: "2024-01-18T00:00:00.000000Z" },
  { id: 5, name: "Delete Transactions", group_name: "Transactions", guard_name: "api", created_at: "2024-01-19T00:00:00.000000Z", updated_at: "2024-01-19T00:00:00.000000Z" },
  { id: 6, name: "Manage Invoices", group_name: "Invoices", guard_name: "api", created_at: "2024-01-20T00:00:00.000000Z", updated_at: "2024-01-20T00:00:00.000000Z" },
  { id: 7, name: "View Analytics", group_name: "Analytics", guard_name: "api", created_at: "2024-01-21T00:00:00.000000Z", updated_at: "2024-01-21T00:00:00.000000Z" },
  { id: 8, name: "Export Reports", group_name: "Analytics", guard_name: "api", created_at: "2024-01-22T00:00:00.000000Z", updated_at: "2024-01-22T00:00:00.000000Z" },
  { id: 9, name: "Manage Wallets", group_name: "Wallet", guard_name: "api", created_at: "2024-01-23T00:00:00.000000Z", updated_at: "2024-01-23T00:00:00.000000Z" },
  { id: 10, name: "View Wallets", group_name: "Wallet", guard_name: "api", created_at: "2024-01-24T00:00:00.000000Z", updated_at: "2024-01-24T00:00:00.000000Z" },
  { id: 11, name: "Manage Subscriptions", group_name: "Subscriptions", guard_name: "api", created_at: "2024-01-25T00:00:00.000000Z", updated_at: "2024-01-25T00:00:00.000000Z" },
  { id: 12, name: "View Recurring", group_name: "Recurring", guard_name: "api", created_at: "2024-01-26T00:00:00.000000Z", updated_at: "2024-01-26T00:00:00.000000Z" },
  { id: 13, name: "Manage Recurring", group_name: "Recurring", guard_name: "api", created_at: "2024-01-27T00:00:00.000000Z", updated_at: "2024-01-27T00:00:00.000000Z" },
  { id: 14, name: "Settings", group_name: "Settings", guard_name: "api", created_at: "2024-01-28T00:00:00.000000Z", updated_at: "2024-01-28T00:00:00.000000Z" },
  { id: 15, name: "Manage Roles", group_name: "Roles", guard_name: "api", created_at: "2024-01-29T00:00:00.000000Z", updated_at: "2024-01-29T00:00:00.000000Z" },
  { id: 16, name: "View Help Desk", group_name: "Help Desk", guard_name: "api", created_at: "2024-01-30T00:00:00.000000Z", updated_at: "2024-01-30T00:00:00.000000Z" },
  { id: 17, name: "Manage Feedback", group_name: "Feedback", guard_name: "api", created_at: "2024-01-31T00:00:00.000000Z", updated_at: "2024-01-31T00:00:00.000000Z" },
  { id: 18, name: "System Backup", group_name: "System", guard_name: "api", created_at: "2024-02-01T00:00:00.000000Z", updated_at: "2024-02-01T00:00:00.000000Z" },
];
