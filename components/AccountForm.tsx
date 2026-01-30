
import React, { useState, useEffect } from 'react';
import { Account, AccountStatus, ACCOUNT_CATEGORIES } from '../types';
import CurrencyInput from './CurrencyInput';

interface AccountFormProps {
  onSave: (account: Partial<Account>) => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    totalValue: 0,
    downPayment: 0,
    dueDate: '',
    category: 'Outros',
    installments: 1,
    installmentValue: 0,
    isManualEdit: false
  });

  useEffect(() => {
    if (!formData.isManualEdit) {
      const total = formData.totalValue || 0;
      const down = formData.downPayment || 0;
      const installments = formData.installments || 1;
      setFormData(prev => ({
        ...prev,
        installmentValue: (total - down) / installments
      }));
    }
  }, [formData.totalValue, formData.downPayment, formData.installments, formData.isManualEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.totalValue || !formData.dueDate) return;

    onSave({
      companyName: formData.companyName,
      companyInitials: formData.companyName.substring(0, 2).toUpperCase(),
      totalValue: formData.totalValue,
      installments: `1 / ${formData.installments}`,
      installmentValue: formData.installmentValue,
      dueDate: formData.dueDate,
      category: formData.category,
      status: AccountStatus.PENDING,
      // @ts-ignore - passing extra data for App.tsx logic
      downPayment: formData.downPayment || 0
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-[800px] mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary">Início</button>
          <span className="text-slate-400 text-sm">/</span>
          <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary">Contas</button>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-primary text-sm font-medium">Adicionar Nova Conta</span>
        </div>
      </div>

      <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Adicionar Nova Conta</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Insira os detalhes para o novo registro de contas a pagar.</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-1 md:col-span-2">
              <label className="flex flex-col gap-2">
                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Nome da Empresa</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">business</span>
                  </div>
                  <input
                    required
                    value={formData.companyName}
                    onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))}
                    className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 placeholder:text-slate-400 text-base"
                    placeholder="Pesquisar ou inserir fornecedor"
                    type="text"
                  />
                </div>
              </label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Valor Total</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">R$</div>
                  <CurrencyInput
                    required
                    value={formData.totalValue}
                    onChange={(val) => setFormData(p => ({ ...p, totalValue: val, isManualEdit: false }))}
                    className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 placeholder:text-slate-400 text-base"
                    placeholder="0,00"
                  />
                </div>
              </label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Valor da Entrada</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Opcional</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">R$</div>
                  <CurrencyInput
                    value={formData.downPayment}
                    onChange={(val) => setFormData(p => ({ ...p, downPayment: val, isManualEdit: false }))}
                    className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 placeholder:text-slate-400 text-base"
                    placeholder="0,00"
                  />
                </div>
              </label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Data do Primeiro Vencimento</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <input
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                    className="form-input flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 text-base"
                    type="date"
                  />
                </div>
              </label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Categoria</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                  </div>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="form-select flex w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 pl-10 pr-4 text-base appearance-none"
                  >
                    {ACCOUNT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2 py-4">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalhes do Parcelamento</span>
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Quantidade de Parcelas</span>
                <div className="flex items-center gap-2">
                  <input
                    min="1"
                    value={formData.installments}
                    onChange={e => setFormData(p => ({ ...p, installments: parseInt(e.target.value) || 1 }))}
                    className="form-input flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 px-4 text-base"
                    type="number"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, installments: p.installments + 1 }))}
                      className="flex items-center justify-center w-8 h-5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">expand_less</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, installments: Math.max(1, p.installments - 1) }))}
                      className="flex items-center justify-center w-8 h-5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </button>
                  </div>
                </div>
              </label>
            </div>

            <div className="col-span-1">
              <label className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#0d141b] dark:text-white text-sm font-semibold">Valor da Parcela</span>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, isManualEdit: false }))}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${formData.isManualEdit ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-primary/10 text-primary cursor-default'}`}
                  >
                    {formData.isManualEdit ? 'Edição Manual' : 'Sugestão Auto'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold">R$</div>
                  <CurrencyInput
                    value={formData.installmentValue}
                    onChange={(val) => setFormData(p => ({ ...p, installmentValue: val, isManualEdit: true }))}
                    className={`form-input flex w-full rounded-lg border h-12 pl-10 text-base transition-all text-[#0d141b] dark:text-white ${formData.isManualEdit ? 'border-amber-400 bg-amber-50/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                    placeholder="0,00"
                  />
                  {formData.isManualEdit && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-500">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </div>
                  )}
                </div>
              </label>
              <p className="text-[11px] text-slate-400 mt-2">
                {formData.isManualEdit
                  ? 'Você alterou o valor manualmente. Clique no botão acima para voltar ao cálculo automático.'
                  : 'Calculado como (Total - Entrada) / Parcelas.'}
              </p>
            </div>

            <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-10 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                Salvar Conta
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="w-full max-w-[800px] mt-6 flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Uma vez salva, esta conta aparecerá no seu painel de <strong>Contas Pendentes</strong>. Você pode configurar notificações para as datas de vencimento nas configurações.
        </p>
      </div>
    </div>
  );
};

export default AccountForm;
