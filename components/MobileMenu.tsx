import React from 'react';
import { ViewType } from '../types';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    onLogout: () => void;
    userName?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    currentView,
    onNavigate,
    onLogout,
    userName
}) => {
    if (!isOpen) return null;

    const handleNavigate = (view: ViewType) => {
        onNavigate(view);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 md:hidden shadow-xl animate-in slide-in-from-left duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h1 className="text-[#0d141b] dark:text-white text-base font-bold leading-none">Financeiro</h1>
                                <p className="text-[#4c739a] text-xs font-normal">Gestão de Contas</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* User Info */}
                    {userName && (
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-[#0d141b] dark:text-white">{userName}</p>
                                    <p className="text-xs text-[#4c739a]">Gestor Financeiro</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        <button
                            onClick={() => handleNavigate('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">home</span>
                            <span className="font-medium">Início</span>
                        </button>

                        <button
                            onClick={() => handleNavigate('add-account')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'add-account'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="font-medium">Contas</span>
                        </button>

                        <button
                            onClick={() => handleNavigate('incomes')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'incomes'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                            <span className="font-medium">Entradas</span>
                        </button>

                        <button
                            onClick={() => handleNavigate('reports')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'reports'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span className="font-medium">Relatórios</span>
                        </button>

                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                        <button
                            onClick={() => handleNavigate('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'settings'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-[#0d141b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-medium">Configurações</span>
                        </button>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
