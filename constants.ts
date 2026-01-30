
import { Account, AccountStatus } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: '1',
    companyName: 'Acme Corp',
    companyInitials: 'AC',
    totalValue: 1500,
    installments: '1 / 3',
    installmentValue: 500,
    dueDate: '2023-11-15',
    status: AccountStatus.PENDING
  },
  {
    id: '2',
    companyName: 'Global Logistics',
    companyInitials: 'GL',
    totalValue: 3000,
    installments: '1 / 1',
    installmentValue: 3000,
    dueDate: '2023-11-10',
    status: AccountStatus.PAID
  },
  {
    id: '3',
    companyName: 'Tech Solutions',
    companyInitials: 'TS',
    totalValue: 450,
    installments: '2 / 2',
    installmentValue: 225,
    dueDate: '2023-11-20',
    status: AccountStatus.PENDING
  },
  {
    id: '4',
    companyName: 'Office Supplies Inc',
    companyInitials: 'OS',
    totalValue: 120,
    installments: '1 / 1',
    installmentValue: 120,
    dueDate: '2023-11-05',
    status: AccountStatus.OVERDUE
  },
  {
    id: '5',
    companyName: 'Marketing Pros',
    companyInitials: 'MP',
    totalValue: 2400,
    installments: '1 / 4',
    installmentValue: 600,
    dueDate: '2023-11-25',
    status: AccountStatus.PENDING
  }
];

export const USER_MOCK = {
  name: 'Alex Rivera',
  role: 'Gestor Financeiro',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXm4LPvp3M3CIwbWUMvPNiHjMoSgcjrHKxV6WZhpHWKBpJChTWijkLneZ0JY4uWl2pHZ2nxCNvh4m3E_XxSSQGGFgY9OwRgJqLwu4M8ZlTpy6BsmqznY-ftp7qLKS7HEhlz5GIILU27MlTVXLDe9RG7H4c4B-CbkhC26Z_aHSnXLUZX7WAfV_27PcWiAW0WMBdZ9XySaCCxceEtyGsD2XD4j0fXofiWJsIYK_F37cN0V_hDwRFRsRWijPhvutsRdEUAlAGEGihWsM'
};
