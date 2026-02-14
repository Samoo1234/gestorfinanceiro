import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 w-[240px] border-r border-solid border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-[#e7edf3] dark:border-slate-800">
        <div className="size-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined">payments</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-[#0d141b] dark:text-white text-base font-bold leading-none truncate">Financeiro</h1>
          <p className="text-[#4c739a] dark:text-slate-500 text-xs font-normal">Gestão de Contas</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-2 flex-1">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'dashboard'
              ? 'bg-primary/10 text-primary'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'dashboard' ? 'text-primary' : 'text-[#4c739a] group-hover:text-primary'}`}>home</span>
            <span>Início</span>
          </button>

          <button
            onClick={() => onNavigate('incomes')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'incomes' || currentView === 'add-income'
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'incomes' || currentView === 'add-income' ? 'text-emerald-600' : 'text-[#4c739a] group-hover:text-emerald-600'}`}>account_balance_wallet</span>
            <span>Entradas</span>
          </button>

          <button
            onClick={() => onNavigate('add-account')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'add-account'
              ? 'bg-primary/10 text-primary'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'add-account' ? 'text-primary' : 'text-[#4c739a] group-hover:text-primary'}`}>receipt_long</span>
            <span>Contas</span>
          </button>

          <button
            onClick={() => onNavigate('purchases-vouchers')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'purchases-vouchers'
              ? 'bg-orange-500/10 text-orange-600'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'purchases-vouchers' ? 'text-orange-600' : 'text-[#4c739a] group-hover:text-orange-600'}`}>shopping_basket</span>
            <span>Compras e Vales</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'reports'
              ? 'bg-primary/10 text-primary'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'reports' ? 'text-primary' : 'text-[#4c739a] group-hover:text-primary'}`}>bar_chart</span>
            <span>Relatórios</span>
          </button>

          <div className="h-px bg-[#e7edf3] dark:bg-slate-800 my-3"></div>

          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${currentView === 'settings'
              ? 'bg-primary/10 text-primary'
              : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${currentView === 'settings' ? 'text-primary' : 'text-[#4c739a] group-hover:text-primary'}`}>settings</span>
            <span>Configurações</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#e7edf3] dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 transition-all group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:text-rose-500">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
