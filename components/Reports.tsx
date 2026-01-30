
import React, { useState, useMemo } from 'react';
import { Account, Income, AccountStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface ReportsProps {
    accounts: Account[];
    incomes: Income[];
}

const Reports: React.FC<ReportsProps> = ({ accounts, incomes }) => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const filteredData = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);

        const monthAccounts = accounts.filter(acc => {
            const accDate = new Date(acc.dueDate + 'T00:00:00');
            return accDate.getFullYear() === year && (accDate.getMonth() + 1) === month;
        });

        const monthIncomes = incomes.filter(inc => {
            const incDate = new Date(inc.date + 'T00:00:00');
            return incDate.getFullYear() === year && (incDate.getMonth() + 1) === month;
        });

        const totalIncome = monthIncomes.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
        const totalExpense = monthAccounts.reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0);
        const totalPaid = monthAccounts
            .filter(acc => acc.status === AccountStatus.PAID)
            .reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0);
        const totalPending = totalExpense - totalPaid;

        return {
            accounts: monthAccounts,
            incomes: monthIncomes,
            totalIncome,
            totalExpense,
            totalPaid,
            totalPending,
            netProfit: totalIncome - totalExpense
        };
    }, [selectedMonth, accounts, incomes]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ['Tipo', 'Descrição/Empresa', 'Categoria', 'Valor', 'Data', 'Status'];
        const rows: string[][] = [];

        // Add incomes
        filteredData.incomes.forEach(inc => {
            rows.push([
                'Entrada',
                inc.description,
                inc.category,
                inc.value.toFixed(2),
                inc.date,
                inc.received ? 'Recebido' : 'Pendente'
            ]);
        });

        // Add expenses
        filteredData.accounts.forEach(acc => {
            rows.push([
                'Saída',
                acc.companyName,
                acc.category || 'Outros',
                acc.installmentValue.toFixed(2),
                acc.dueDate,
                acc.status
            ]);
        });

        // Add summary
        rows.push([]);
        rows.push(['RESUMO']);
        rows.push(['Total Entradas', '', '', filteredData.totalIncome.toFixed(2)]);
        rows.push(['Total Saídas', '', '', filteredData.totalExpense.toFixed(2)]);
        rows.push(['Saldo Líquido', '', '', filteredData.netProfit.toFixed(2)]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${selectedMonth}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        // Create a printable HTML that looks like a PDF
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Relatório Financeiro - ${selectedMonth}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
                    h1 { color: #137fec; border-bottom: 2px solid #137fec; padding-bottom: 10px; }
                    h2 { color: #444; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f5f7fa; font-weight: bold; }
                    .summary { display: flex; gap: 20px; margin: 20px 0; }
                    .card { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
                    .card-label { font-size: 12px; color: #666; text-transform: uppercase; }
                    .card-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
                    .income { color: #10b981; }
                    .expense { color: #ef4444; }
                    .balance { color: ${filteredData.netProfit >= 0 ? '#137fec' : '#ef4444'}; }
                    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>📊 Relatório Financeiro</h1>
                <p><strong>Período:</strong> ${selectedMonth}</p>
                <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                
                <div class="summary">
                    <div class="card">
                        <div class="card-label">Total Entradas</div>
                        <div class="card-value income">${formatCurrency(filteredData.totalIncome)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Total Saídas</div>
                        <div class="card-value expense">${formatCurrency(filteredData.totalExpense)}</div>
                    </div>
                    <div class="card">
                        <div class="card-label">Saldo Líquido</div>
                        <div class="card-value balance">${formatCurrency(filteredData.netProfit)}</div>
                    </div>
                </div>
                
                <h2>📤 Saídas (Contas a Pagar)</h2>
                <table>
                    <thead>
                        <tr><th>Empresa</th><th>Categoria</th><th>Parcela</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        ${filteredData.accounts.map(acc => `
                            <tr>
                                <td>${acc.companyName}</td>
                                <td>${acc.category || 'Outros'}</td>
                                <td>${acc.installments}</td>
                                <td class="expense">${formatCurrency(acc.installmentValue)}</td>
                                <td>${formatDate(acc.dueDate)}</td>
                                <td>${acc.status}</td>
                            </tr>
                        `).join('')}
                        ${filteredData.accounts.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#999;">Nenhuma conta neste período</td></tr>' : ''}
                    </tbody>
                </table>
                
                <h2>📥 Entradas (Receitas)</h2>
                <table>
                    <thead>
                        <tr><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Data</th></tr>
                    </thead>
                    <tbody>
                        ${filteredData.incomes.map(inc => `
                            <tr>
                                <td>${inc.description}</td>
                                <td>${inc.category}</td>
                                <td class="income">${formatCurrency(inc.value)}</td>
                                <td>${formatDate(inc.date)}</td>
                            </tr>
                        `).join('')}
                        ${filteredData.incomes.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:#999;">Nenhuma entrada neste período</td></tr>' : ''}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>GestorFinanceiro Pro © ${new Date().getFullYear()}</p>
                </div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .p-4, .p-8 { padding: 0 !important; }
          .shadow-sm, .shadow-md { shadow: none !important; border: 1px solid #eee; }
        }
        .print-only { display: none; }
      `}</style>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <div>
                    <h2 className="text-[#0d141b] dark:text-white text-2xl font-bold">Relatórios Mensais</h2>
                    <p className="text-[#4c739a] dark:text-slate-400 text-sm">Análise detalhada do seu fluxo de caixa</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="form-input rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-10 px-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm active:scale-95"
                        title="Exportar CSV"
                    >
                        <span className="material-symbols-outlined text-[18px]">table_view</span>
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-1.5 px-3 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm active:scale-95"
                        title="Exportar PDF"
                    >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 h-10 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all font-medium text-sm shadow-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        <span className="hidden sm:inline">Imprimir</span>
                    </button>
                </div>
            </div>


            {/* Título de Impressão */}
            <div className="print-only mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold">Relatório Financeiro - {selectedMonth}</h1>
                <p className="text-gray-600">Gestor Financeiro Pro</p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[#4c739a] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Entradas</p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold">{formatCurrency(filteredData.totalIncome)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[#4c739a] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Saídas Totais</p>
                    <p className="text-rose-600 dark:text-rose-400 text-2xl font-bold">{formatCurrency(filteredData.totalExpense)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[#4c739a] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${filteredData.netProfit >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                        {formatCurrency(filteredData.netProfit)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-[#4c739a] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pagas vs Pendentes</p>
                    <div className="flex items-end gap-2 text-sm">
                        <span className="text-emerald-600 font-bold">{formatCurrency(filteredData.totalPaid)}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-amber-600 font-bold">{formatCurrency(filteredData.totalPending)}</span>
                    </div>
                </div>
            </div>

            {/* Tabela de Saídas (Contas) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-[#0d141b] dark:text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-500">trending_down</span>
                        Detalhamento de Saídas
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Parcela</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Vencimento</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredData.accounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-[#0d141b] dark:text-slate-200">{acc.companyName}</td>
                                    <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{acc.installments}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(acc.installmentValue)}</td>
                                    <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{formatDate(acc.dueDate)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${acc.status === AccountStatus.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {acc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.accounts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">Nenhuma conta encontrada para este mês.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-sm text-[#0d141b] dark:text-white uppercase">Total de Saídas</td>
                                <td colSpan={3} className="px-6 py-4 text-rose-600 dark:text-rose-400 text-lg">
                                    {formatCurrency(filteredData.totalExpense)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Tabela de Entradas */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-[#0d141b] dark:text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                        Detalhamento de Entradas
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filteredData.incomes.map((inc) => (
                                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-[#0d141b] dark:text-slate-200">{inc.description}</td>
                                    <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{inc.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(inc.value)}</td>
                                    <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{formatDate(inc.date)}</td>
                                </tr>
                            ))}
                            {filteredData.incomes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Nenhuma entrada encontrada para este mês.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-sm text-[#0d141b] dark:text-white uppercase">Total de Entradas</td>
                                <td colSpan={2} className="px-6 py-4 text-emerald-600 dark:text-emerald-400 text-lg">
                                    {formatCurrency(filteredData.totalIncome)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
