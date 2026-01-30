import React, { useState, useEffect } from 'react';
import { Account, AccountStatus, ACCOUNT_CATEGORIES } from '../types';
import { formatCurrency } from '../utils';
import CurrencyInput from './CurrencyInput';

interface AccountEditModalProps {
    account: Account | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Account>) => void;
}

const AccountEditModal: React.FC<AccountEditModalProps> = ({ account, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        totalValue: 0,
        installmentValue: 0,
        dueDate: '',
        category: 'Outros',
        status: AccountStatus.PENDING
    });

    useEffect(() => {
        if (account) {
            setFormData({
                companyName: account.companyName,
                totalValue: account.totalValue,
                installmentValue: account.installmentValue,
                dueDate: account.dueDate,
                category: account.category || 'Outros',
                status: account.status
            });
        }
    }, [account]);

    if (!isOpen || !account) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(account.id, {
            companyName: formData.companyName,
            companyInitials: formData.companyName.substring(0, 2).toUpperCase(),
            totalValue: formData.totalValue,
            installmentValue: formData.installmentValue,
            dueDate: formData.dueDate,
            category: formData.category,
            status: formData.status
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit</span>
                        Editar Conta
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Empresa</label>
                        <input
                            required
                            value={formData.companyName}
                            onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                            type="text"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Valor Total</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                <CurrencyInput
                                    required
                                    value={formData.totalValue}
                                    onChange={(val) => setFormData(p => ({ ...p, totalValue: val }))}
                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 pl-10 pr-4"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Valor da Parcela</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                <CurrencyInput
                                    required
                                    value={formData.installmentValue}
                                    onChange={(val) => setFormData(p => ({ ...p, installmentValue: val }))}
                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 pl-10 pr-4"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Data de Vencimento</label>
                            <input
                                required
                                value={formData.dueDate}
                                onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                                className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                type="date"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                className="form-select w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                            >
                                {ACCOUNT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Status</label>
                        <div className="flex gap-2">
                            {[AccountStatus.PENDING, AccountStatus.PAID, AccountStatus.OVERDUE].map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, status }))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.status === status
                                        ? status === AccountStatus.PAID
                                            ? 'bg-emerald-500 text-white'
                                            : status === AccountStatus.OVERDUE
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-amber-500 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountEditModal;
