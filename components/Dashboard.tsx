
import React, { useState } from 'react';
import { Account, AccountStatus, Income, ACCOUNT_CATEGORIES } from '../types';
import { formatDate, formatCurrency, parseDate } from '../utils';
import KanbanView from './KanbanView';
import Charts from './Charts';
import AccountEditModal from './AccountEditModal';

interface DashboardProps {
  accounts: Account[];
  incomes: Income[];
  searchTerm: string;
  onStatusChange: (id: string, newStatus: AccountStatus) => void;
  onDeleteAccount: (id: string) => void;
  onEditAccount: (id: string, data: Partial<Account>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  incomes,
  searchTerm,
  onStatusChange,
  onDeleteAccount,
  onEditAccount
}) => {
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const itemsPerPage = 10;

  // Apply filters
  let filteredAccounts = accounts;

  // Search filter
  if (searchTerm) {
    filteredAccounts = filteredAccounts.filter(acc =>
      acc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Status filter
  if (statusFilter !== 'All') {
    filteredAccounts = filteredAccounts.filter(acc => acc.status === statusFilter);
  }

  // Category filter
  if (categoryFilter !== 'All') {
    filteredAccounts = filteredAccounts.filter(acc => acc.category === categoryFilter);
  }

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusClass = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.PENDING:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case AccountStatus.PAID:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case AccountStatus.OVERDUE:
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return '';
    }
  };

  const stats = {
    totalOpen: accounts
      .filter(acc => acc.status !== AccountStatus.PAID)
      .reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0),
    dueThisWeek: accounts
      .filter(acc => {
        if (acc.status === AccountStatus.PAID) return false;
        const dueDate = parseDate(acc.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        return dueDate >= today && dueDate <= nextWeek;
      })
      .reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0),
    totalOverdue: accounts
      .filter(acc => acc.status === AccountStatus.OVERDUE)
      .reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0),
    totalIncome: incomes.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-wider">Total Entradas</p>
          <p className="text-[#0d141b] dark:text-white text-2xl font-black">
            {formatCurrency(stats.totalIncome)}
          </p>
          <div className="flex items-center gap-1 text-[#078838] bg-[#078838]/10 w-fit px-2 py-0.5 rounded text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">trending_up</span>
            <span>Estável</span>
          </div>
          <span className="absolute -right-2 -bottom-2 material-symbols-outlined text-emerald-500/10 text-6xl transform -rotate-12">account_balance_wallet</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-[#4c739a] text-sm font-medium uppercase tracking-wider">Total em Aberto</p>
          <p className="text-[#0d141b] dark:text-white text-2xl font-bold">
            {formatCurrency(stats.totalOpen)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">Contas Pendentes/Atrasadas</p>
          <span className="absolute -right-2 -bottom-2 material-symbols-outlined text-slate-500/5 text-6xl transform -rotate-12">pending_actions</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-[#4c739a] text-sm font-medium uppercase tracking-wider">Vencendo na Semana</p>
          <p className="text-[#0d141b] dark:text-white text-2xl font-bold">
            {formatCurrency(stats.dueThisWeek)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium font-bold">Próximos 7 dias</p>
          <span className="absolute -right-2 -bottom-2 material-symbols-outlined text-amber-500/5 text-6xl transform -rotate-12">event_upcoming</span>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-rose-600 dark:text-rose-400 text-sm font-bold uppercase tracking-wider">Total em Atraso</p>
          <p className="text-[#0d141b] dark:text-white text-2xl font-bold">
            {formatCurrency(stats.totalOverdue)}
          </p>
          <p className="text-[10px] text-rose-500/60 font-medium font-bold">Contas com prazo vencido</p>
          <span className="absolute -right-2 -bottom-2 material-symbols-outlined text-rose-500/10 text-6xl transform -rotate-12">warning</span>
        </div>
      </div>

      {/* Charts */}
      <Charts accounts={accounts} incomes={incomes} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex bg-[#e7edf3] dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === 'All' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-[#4c739a] hover:text-primary'}`}
            >
              Todos
            </button>
            <button
              onClick={() => { setStatusFilter(AccountStatus.PENDING); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === AccountStatus.PENDING ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-[#4c739a] hover:text-primary'}`}
            >
              Pendente
            </button>
            <button
              onClick={() => { setStatusFilter(AccountStatus.PAID); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === AccountStatus.PAID ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-[#4c739a] hover:text-primary'}`}
            >
              Pago
            </button>
            <button
              onClick={() => { setStatusFilter(AccountStatus.OVERDUE); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === AccountStatus.OVERDUE ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600' : 'text-[#4c739a] hover:text-primary'}`}
            >
              Atrasado
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-lg bg-white dark:bg-slate-800 border border-[#cfdbe7] dark:border-slate-700 px-3 text-sm text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">Todas Categorias</option>
            {ACCOUNT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-sm text-[#4c739a] hidden sm:inline">Visualização:</span>
          <div className="flex bg-[#e7edf3] dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-[#4c739a] hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-[#4c739a] hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanView
          accounts={filteredAccounts}
          onStatusChange={onStatusChange}
          onEdit={setEditingAccount}
          onDelete={onDeleteAccount}
        />
      ) : (
        /* Table */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Valor Total</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Parcelas</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Valor Parcela</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfdbe7] dark:divide-slate-800">
                {paginatedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {account.companyInitials}
                        </div>
                        <span className="text-[#0d141b] dark:text-white text-sm font-semibold truncate max-w-[150px]">{account.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                        {account.category || 'Outros'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-sm whitespace-nowrap">
                      {formatCurrency(account.totalValue)}
                    </td>
                    <td className="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-sm whitespace-nowrap">
                      {account.installments}
                    </td>
                    <td className="px-6 py-4 text-[#0d141b] dark:text-slate-200 text-sm font-medium whitespace-nowrap">
                      {formatCurrency(account.installmentValue)}
                    </td>
                    <td className={`px-6 py-4 text-sm whitespace-nowrap ${account.status === AccountStatus.OVERDUE ? 'text-rose-500 font-medium' : 'text-[#4c739a] dark:text-slate-400'}`}>
                      {formatDate(account.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onStatusChange(account.id, account.status === AccountStatus.PAID ? AccountStatus.PENDING : AccountStatus.PAID)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all hover:brightness-95 active:scale-95 ${getStatusClass(account.status)}`}
                      >
                        {account.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingAccount(account)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar Conta"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {account.status !== AccountStatus.PAID && (
                          <button
                            onClick={() => onStatusChange(account.id, AccountStatus.PAID)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            title="Marcar como Pago"
                          >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta conta?')) {
                              onDeleteAccount(account.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title="Excluir Conta"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAccounts.length === 0 && (
              <div className="p-10 text-center text-[#4c739a]">Nenhuma conta encontrada para este filtro.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-[#cfdbe7] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#4c739a]">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccounts.length)} - {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} de {filteredAccounts.length} entradas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-[#cfdbe7] dark:border-slate-700 text-[#4c739a] hover:bg-white dark:hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-[#4c739a] hover:bg-white dark:hover:bg-slate-800'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 rounded border border-[#cfdbe7] dark:border-slate-700 text-[#4c739a] hover:bg-white dark:hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AccountEditModal
        account={editingAccount}
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSave={onEditAccount}
      />
    </div>
  );
};

export default Dashboard;
