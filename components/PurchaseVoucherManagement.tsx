import React, { useState, useMemo } from 'react';
import { PurchaseVoucher } from '../types';
import { formatCurrency, getMonthName, parseDate, formatDate } from '../utils';

interface PurchaseVoucherManagementProps {
    vouchers: PurchaseVoucher[];
    onAdd: (data: Partial<PurchaseVoucher>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const PurchaseVoucherManagement: React.FC<PurchaseVoucherManagementProps> = ({ vouchers, onAdd, onDelete }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [type, setType] = useState<'purchase' | 'voucher'>('purchase');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filteredVouchers = useMemo(() => {
        return vouchers.filter(v => {
            const vDate = parseDate(v.date);
            return vDate.getMonth() === selectedMonth && vDate.getFullYear() === selectedYear;
        }).sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    }, [vouchers, selectedMonth, selectedYear]);

    const totals = useMemo(() => {
        return filteredVouchers.reduce((acc, curr) => {
            if (curr.type === 'purchase') acc.purchases += Number(curr.amount);
            else acc.vouchers += Number(curr.amount);
            acc.total += Number(curr.amount);
            return acc;
        }, { purchases: 0, vouchers: 0, total: 0 });
    }, [filteredVouchers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) return;

        await onAdd({
            type,
            description,
            amount: parseFloat(amount),
            date
        });

        setDescription('');
        setAmount('');
        setIsAdding(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compras e Vales</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus gastos com compras e retiradas de vales.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Registro
                </button>
            </div>

            {/* Filtros e Totais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mês de Referência</p>
                    <div className="flex gap-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-primary"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i} value={i}>{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-24 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-primary"
                        >
                            {[2024, 2025, 2026].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Compras</p>
                        <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(totals.purchases)}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Vales</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totals.vouchers)}</p>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-800 p-4 rounded-2xl border border-slate-800 shadow-lg">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Geral</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(totals.total)}</p>
                    </div>
                </div>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Novo Registro</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('purchase')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'purchase' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Compra
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('voucher')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'voucher' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Vale
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Nota Açougue, Vale pego no dia"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredVouchers.length > 0 ? (
                                filteredVouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {formatDate(voucher.date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${voucher.type === 'purchase'
                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {voucher.type === 'purchase' ? 'Compra' : 'Vale'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                            {voucher.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(voucher.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onDelete(voucher.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl opacity-20">inventory_2</span>
                                            <p>Nenhum registro encontrado neste mês.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseVoucherManagement;
