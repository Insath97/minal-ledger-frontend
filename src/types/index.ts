export type Currency = "LKR";

export type TransactionStatus = "success" | "pending" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  role: string;
  joinedAt: string;
}

export interface Wallet {
  id: string;
  currency: Currency;
  balance: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  activity: string;
  icon?: string;
  iconColor?: string;
  date: string;
  price: number;
  status: TransactionStatus;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  permission?: string[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface StatCardData {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  changeLabel: string;
  icon: string;
  iconBg?: string;
}

export interface ChartDataPoint {
  month: string;
  earnings: number;
}

export interface Permission {
  id: number;
  name: string;
  group_name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  is_protected: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface RoleList {
  id: number;
  name: string;
  guard_name: string;
  is_protected?: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
