import React from 'react';
import { Account, AccountStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface KanbanViewProps {
    accounts: Account[];
    onStatusChange: (id: string, newStatus: AccountStatus) => void;
    onEdit: (account: Account) => void;
    onDelete: (id: string) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ accounts, onStatusChange, onEdit, onDelete }) => {
    const columns = [
        { status: AccountStatus.PENDING, label: 'Pendente', color: 'amber', icon: 'schedule' },
        { status: AccountStatus.OVERDUE, label: 'Atrasado', color: 'rose', icon: 'warning' },
        { status: AccountStatus.PAID, label: 'Pago', color: 'emerald', icon: 'check_circle' }
    ];

    const getColumnAccounts = (status: AccountStatus) =>
        accounts.filter(acc => acc.status === status);

    const handleDragStart = (e: React.DragEvent, accountId: string) => {
        e.dataTransfer.setData('accountId', accountId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: AccountStatus) => {
        e.preventDefault();
        const accountId = e.dataTransfer.getData('accountId');
        if (accountId) {
            onStatusChange(accountId, status);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => (
                <div
                    key={column.status}
                    className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 min-h-[400px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.status)}
                >
                    <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-${column.color}-200 dark:border-${column.color}-900/30`}>
                        <span className={`material-symbols-outlined text-${column.color}-500`}>{column.icon}</span>
                        <h3 className={`font-bold text-${column.color}-600 dark:text-${column.color}-400`}>{column.label}</h3>
                        <span className={`ml-auto bg-${column.color}-100 dark:bg-${column.color}-900/30 text-${column.color}-700 dark:text-${column.color}-400 text-xs font-bold px-2 py-0.5 rounded-full`}>
                            {getColumnAccounts(column.status).length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {getColumnAccounts(column.status).map(account => (
                            <div
                                key={account.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, account.id)}
                                className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                            {account.companyInitials}
                                        </div>
                                        <span className="font-semibold text-sm text-[#0d141b] dark:text-white truncate max-w-[120px]">
                                            {account.companyName}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(account)}
                                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Excluir esta conta?')) onDelete(account.id);
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Parcela:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{account.installments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Valor:</span>
                                        <span className="font-bold text-primary">{formatCurrency(account.installmentValue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Vencimento:</span>
                                        <span className={`font-medium ${column.status === AccountStatus.OVERDUE ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {formatDate(account.dueDate)}
                                        </span>
                                    </div>
                                    {account.category && (
                                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                                {account.category}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {getColumnAccounts(column.status).length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">inbox</span>
                                Nenhuma conta
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanView;
