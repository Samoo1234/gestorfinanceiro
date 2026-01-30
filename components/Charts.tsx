import React, { useEffect, useRef } from 'react';
import { Account, Income, AccountStatus } from '../types';
import { formatCurrency } from '../utils';

interface ChartsProps {
    accounts: Account[];
    incomes: Income[];
}

const Charts: React.FC<ChartsProps> = ({ accounts, incomes }) => {
    const pieCanvasRef = useRef<HTMLCanvasElement>(null);
    const barCanvasRef = useRef<HTMLCanvasElement>(null);

    // Calculate statistics
    const statusData = {
        pending: accounts.filter(a => a.status === AccountStatus.PENDING).reduce((sum, a) => sum + a.installmentValue, 0),
        paid: accounts.filter(a => a.status === AccountStatus.PAID).reduce((sum, a) => sum + a.installmentValue, 0),
        overdue: accounts.filter(a => a.status === AccountStatus.OVERDUE).reduce((sum, a) => sum + a.installmentValue, 0)
    };

    const totalIncome = incomes.reduce((sum, i) => sum + i.value, 0);
    const totalExpense = accounts.reduce((sum, a) => sum + a.installmentValue, 0);

    useEffect(() => {
        // Draw Pie Chart
        const pieCanvas = pieCanvasRef.current;
        if (pieCanvas) {
            const ctx = pieCanvas.getContext('2d');
            if (ctx) {
                const total = statusData.pending + statusData.paid + statusData.overdue;
                const centerX = pieCanvas.width / 2;
                const centerY = pieCanvas.height / 2;
                const radius = Math.min(centerX, centerY) - 20;

                ctx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);

                if (total === 0) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 30;
                    ctx.stroke();
                    return;
                }

                const data = [
                    { value: statusData.paid, color: '#10b981' },
                    { value: statusData.pending, color: '#f59e0b' },
                    { value: statusData.overdue, color: '#ef4444' }
                ];

                let startAngle = -Math.PI / 2;

                data.forEach(item => {
                    if (item.value > 0) {
                        const sliceAngle = (item.value / total) * 2 * Math.PI;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                        ctx.strokeStyle = item.color;
                        ctx.lineWidth = 30;
                        ctx.stroke();
                        startAngle += sliceAngle;
                    }
                });

                // Draw center circle (donut hole)
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 40, 0, 2 * Math.PI);
                ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff';
                ctx.fill();
            }
        }

        // Draw Bar Chart
        const barCanvas = barCanvasRef.current;
        if (barCanvas) {
            const ctx = barCanvas.getContext('2d');
            if (ctx) {
                const width = barCanvas.width;
                const height = barCanvas.height;
                const padding = 40;
                const barWidth = 60;
                const gap = 40;

                ctx.clearRect(0, 0, width, height);

                const maxValue = Math.max(totalIncome, totalExpense, 1);
                const scale = (height - padding * 2) / maxValue;

                // Draw bars
                const bars = [
                    { value: totalIncome, color: '#10b981', label: 'Entradas' },
                    { value: totalExpense, color: '#ef4444', label: 'Saídas' }
                ];

                const startX = (width - (bars.length * barWidth + (bars.length - 1) * gap)) / 2;

                bars.forEach((bar, index) => {
                    const x = startX + index * (barWidth + gap);
                    const barHeight = bar.value * scale;
                    const y = height - padding - barHeight;

                    // Draw bar
                    ctx.fillStyle = bar.color;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, barHeight, 6);
                    ctx.fill();

                    // Draw label
                    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b';
                    ctx.font = '12px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(bar.label, x + barWidth / 2, height - 10);

                    // Draw value
                    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#0d141b';
                    ctx.font = 'bold 11px Inter, sans-serif';
                    ctx.fillText(formatCurrency(bar.value), x + barWidth / 2, y - 8);
                });
            }
        }
    }, [accounts, incomes, statusData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart - Status Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 p-6">
                <h3 className="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">pie_chart</span>
                    Distribuição por Status
                </h3>
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <canvas ref={pieCanvasRef} width={200} height={200}></canvas>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#0d141b] dark:text-white">
                                {accounts.length}
                            </span>
                            <span className="text-xs text-slate-500">contas</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="size-3 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Pago ({formatCurrency(statusData.paid)})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="size-3 rounded-full bg-amber-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Pendente ({formatCurrency(statusData.pending)})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="size-3 rounded-full bg-rose-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Atrasado ({formatCurrency(statusData.overdue)})</span>
                    </div>
                </div>
            </div>

            {/* Bar Chart - Income vs Expense */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#cfdbe7] dark:border-slate-800 p-6">
                <h3 className="font-bold text-[#0d141b] dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                    Entradas vs Saídas
                </h3>
                <div className="flex items-center justify-center">
                    <canvas ref={barCanvasRef} width={280} height={200}></canvas>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-medium">Balanço</p>
                        <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(totalIncome - totalExpense)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charts;
