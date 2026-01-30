import React, { useState, useEffect } from 'react';
import { Income } from '../types';
import { formatCurrency, formatDate, getTodayString } from '../utils';
import CurrencyInput from './CurrencyInput';

interface IncomeManagementProps {
    incomes: Income[];
    onAddIncome: (income: Partial<Income>) => void;
    onDeleteIncome: (id: string) => void;
    onToggleReceived: (id: string) => void;
    onEditIncome?: (id: string, data: Partial<Income>) => void;
}

const IncomeManagement: React.FC<IncomeManagementProps> = ({
    incomes,
    onAddIncome,
    onDeleteIncome,
    onToggleReceived,
    onEditIncome
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState<number>(0);
    const [date, setDate] = useState(getTodayString());
    const [category, setCategory] = useState('Salário');

    // Edit modal state
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [editDescription, setEditDescription] = useState('');
    const [editValue, setEditValue] = useState<number>(0);
    const [editDate, setEditDate] = useState('');
    const [editCategory, setEditCategory] = useState('');

    const categories = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'];

    useEffect(() => {
        if (editingIncome) {
            setEditDescription(editingIncome.description);
            setEditValue(editingIncome.value);
            setEditDate(editingIncome.date);
            setEditCategory(editingIncome.category);
        }
    }, [editingIncome]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddIncome({
            description,
            value: value,
            date,
            category,
            received: false
        });
        setDescription('');
        setValue(0);
        setShowAddForm(false);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIncome && onEditIncome) {
            onEditIncome(editingIncome.id, {
                description: editDescription,
                value: editValue,
                date: editDate,
                category: editCategory
            });
        }
        setEditingIncome(null);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0d141b] dark:text-white">Gestão de Entradas</h1>
                    <p className="text-[#4c739a] text-sm">Controle sua renda mensal e outras fontes de receita.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-emerald-600/20"
                >
                    <span className="material-symbols-outlined text-[20px]">{showAddForm ? 'close' : 'add'}</span>
                    <span>{showAddForm ? 'Cancelar' : 'Nova Entrada'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-6 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-[#4c739a] uppercase">Descrição</label>
                            <input
                                required
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Salário Mensal"
                                className="h-11 rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4c739a] uppercase">Valor (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                <CurrencyInput
                                    required
                                    value={value}
                                    onChange={setValue}
                                    placeholder="0,00"
                                    className="h-11 w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4c739a] uppercase">Data</label>
                            <input
                                required
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-11 rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#4c739a] uppercase">Categoria</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="h-11 rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all"
                        >
                            Salvar Entrada
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-4 text-[#0d141b] dark:text-slate-300 text-xs font-bold uppercase tracking-wider text-center">Recebido</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#cfdbe7] dark:divide-slate-800">
                                    {incomes.map((income) => (
                                        <tr key={income.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">{income.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                                                    {income.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                                                {formatCurrency(income.value)}
                                            </td>
                                            <td className="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-sm">
                                                {formatDate(income.date)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => onToggleReceived(income.id)}
                                                    className={`size-6 rounded flex items-center justify-center transition-all ${income.received ? 'bg-emerald-500 text-white' : 'border-2 border-[#cfdbe7] dark:border-slate-700 text-transparent hover:border-emerald-500'}`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {onEditIncome && (
                                                        <button
                                                            onClick={() => setEditingIncome(income)}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Excluir esta entrada?')) {
                                                                onDeleteIncome(income.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {incomes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-[#4c739a]">Nenhuma entrada cadastrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-100 text-sm font-medium mb-1 uppercase tracking-wider">Total em Entradas</p>
                            <h2 className="text-3xl font-black">
                                {formatCurrency(incomes.reduce((acc, curr) => acc + curr.value, 0))}
                            </h2>
                            <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                <span>Meta de Renda: 105%</span>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                            <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Resumo Mensal</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#4c739a]">Recebido</span>
                                <span className="font-bold text-emerald-600">
                                    {formatCurrency(incomes.filter(i => i.received).reduce((acc, curr) => acc + curr.value, 0))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[#4c739a]">A receber</span>
                                <span className="font-bold text-amber-600">
                                    {formatCurrency(incomes.filter(i => !i.received).reduce((acc, curr) => acc + curr.value, 0))}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${(incomes.filter(i => i.received).length / (incomes.length || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingIncome && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">edit</span>
                                Editar Entrada
                            </h3>
                            <button
                                onClick={() => setEditingIncome(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Descrição</label>
                                <input
                                    required
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                    type="text"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Valor</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                        <CurrencyInput
                                            required
                                            value={editValue}
                                            onChange={setEditValue}
                                            className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 pl-10 pr-4"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Data</label>
                                    <input
                                        required
                                        value={editDate}
                                        onChange={e => setEditDate(e.target.value)}
                                        className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Categoria</label>
                                <select
                                    value={editCategory}
                                    onChange={e => setEditCategory(e.target.value)}
                                    className="form-select w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingIncome(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeManagement;
