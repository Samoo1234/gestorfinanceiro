
export enum AccountStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  OVERDUE = 'Atrasado'
}

export const ACCOUNT_CATEGORIES = [
  'Fornecedores',
  'Serviços',
  'Impostos',
  'Aluguel',
  'Salários',
  'Utilities',
  'Marketing',
  'Equipamentos',
  'Outros'
] as const;

export type AccountCategory = typeof ACCOUNT_CATEGORIES[number];

export interface Account {
  id: string;
  companyName: string;
  totalValue: number;
  installments: string;
  installmentValue: number;
  dueDate: string;
  status: AccountStatus;
  companyInitials: string;
  category?: string;
}

export interface Income {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
  received: boolean;
}

export interface PurchaseVoucher {
  id: string;
  user_id: string;
  type: 'purchase' | 'voucher';
  description: string;
  amount: number;
  date: string;
  created_at?: string;
}

export type ViewType = 'dashboard' | 'add-account' | 'login' | 'incomes' | 'add-income' | 'reports' | 'register' | 'settings' | 'reset-password' | 'purchases-vouchers';

export interface DashboardStats {
  totalOpen: number;
  totalDueThisWeek: number;
  totalOverdue: number;
  totalIncome: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  notifications_enabled: boolean;
}

export interface Notification {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  accountId?: string;
}
