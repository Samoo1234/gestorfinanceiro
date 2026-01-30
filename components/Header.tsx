import React from 'react';
import { ViewType, UserProfile, Account } from '../types';
import NotificationsDropdown from './NotificationsDropdown';

interface HeaderProps {
  onAddClick: () => void;
  openMobileMenu: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  userProfile: UserProfile | null;
  accounts: Account[];
  onNavigate: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddClick,
  openMobileMenu,
  searchTerm,
  onSearchChange,
  userProfile,
  accounts,
  onNavigate
}) => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 px-4 md:px-8 py-3 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-30">
      {/* Mobile Menu Button */}
      <button
        onClick={openMobileMenu}
        className="md:hidden flex items-center justify-center size-10 text-[#0d141b] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Title - Hidden on Mobile */}
      <div className="hidden md:flex items-center gap-4 text-[#0d141b] dark:text-white min-w-0">
        <p className="text-xl font-black leading-tight tracking-[-0.015em] truncate">Contas a Pagar</p>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <label className="flex flex-col w-full relative">
          <span className="material-symbols-outlined text-[#4c739a] dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none">
            search
          </span>
          <input
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full form-input h-10 rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 placeholder:text-[#4c739a] dark:placeholder:text-slate-500 text-sm font-normal transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Add Account Button */}
        <button
          onClick={onAddClick}
          className="hidden sm:flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Conta
        </button>

        {/* Mobile Add Button */}
        <button
          onClick={onAddClick}
          className="sm:hidden flex items-center justify-center size-10 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
        </button>

        {/* Notifications */}
        <NotificationsDropdown accounts={accounts} />

        {/* User Profile */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors group"
        >
          <div className="hidden sm:flex flex-col items-end min-w-0">
            <span className="text-[13px] font-semibold text-[#0d141b] dark:text-white truncate max-w-[120px]">
              {userProfile?.name || 'Usuário'}
            </span>
            <span className="text-[11px] text-[#4c739a] dark:text-slate-500">Gestor</span>
          </div>
          <div className="size-9 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
