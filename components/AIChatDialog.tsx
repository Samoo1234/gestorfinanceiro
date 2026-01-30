import React, { useState, useRef, useEffect } from 'react';
import { Account, Income } from '../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIChatDialogProps {
    accounts: Account[];
    incomes: Income[];
    userName?: string;
}

// URL do webhook do n8n - configure no .env.local
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

const AIChatDialog: React.FC<AIChatDialogProps> = ({ accounts, incomes, userName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Olá${userName ? `, ${userName}` : ''}! 👋 Sou seu assistente financeiro. Posso ajudar você com dicas sobre suas finanças, análise de gastos e muito mais. Como posso ajudar hoje?`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Prepara contexto financeiro para enviar ao n8n
    const getFinancialContext = () => {
        const totalExpenses = accounts.reduce((sum, acc) => sum + acc.installmentValue, 0);
        const totalIncomes = incomes.reduce((sum, inc) => sum + inc.value, 0);
        const pendingAccounts = accounts.filter(acc => acc.status === 'pending').length;
        const overdueAccounts = accounts.filter(acc => acc.status === 'overdue').length;
        const paidAccounts = accounts.filter(acc => acc.status === 'paid').length;

        return {
            totalExpenses,
            totalIncomes,
            balance: totalIncomes - totalExpenses,
            pendingAccounts,
            overdueAccounts,
            paidAccounts,
            totalAccounts: accounts.length,
            categories: [...new Set(accounts.map(acc => acc.category))],
            recentAccounts: accounts.slice(0, 5).map(acc => ({
                company: acc.companyName,
                value: acc.installmentValue,
                dueDate: acc.dueDate,
                status: acc.status
            }))
        };
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!N8N_WEBHOOK_URL) {
                // Resposta de fallback quando não há webhook configurado
                setTimeout(() => {
                    const fallbackMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: '⚠️ O webhook do n8n ainda não foi configurado. Adicione `VITE_N8N_WEBHOOK_URL` no arquivo `.env.local` para ativar o assistente de IA.',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, fallbackMessage]);
                    setIsLoading(false);
                }, 500);
                return;
            }

            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    userName: userName || 'Usuário',
                    financialContext: getFinancialContext(),
                    conversationHistory: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            // Tenta ler como texto primeiro
            const responseText = await response.text();
            let assistantContent = '';

            try {
                // Tenta parsear como JSON
                const data = JSON.parse(responseText);

                // Suporta vários formatos de resposta do n8n
                if (typeof data === 'string') {
                    assistantContent = data;
                } else if (Array.isArray(data)) {
                    // Se for array, pega o primeiro item
                    const firstItem = data[0];
                    assistantContent = firstItem?.response || firstItem?.message || firstItem?.output || firstItem?.text || JSON.stringify(firstItem);
                } else if (typeof data === 'object') {
                    // Tenta vários campos comuns
                    assistantContent = data.response || data.message || data.output || data.text || data.content || data.result || data.answer || JSON.stringify(data);
                }
            } catch {
                // Se não for JSON válido, usa o texto direto
                assistantContent = responseText;
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: assistantContent || 'Resposta recebida, mas sem conteúdo.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            const errorDetails = error instanceof Error ? error.message : 'Erro desconhecido';
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ Erro ao conectar com o assistente.\n\n**Detalhes:** ${errorDetails}\n\n**Dicas:**\n• Verifique se o n8n está rodando\n• Confirme a URL do webhook\n• Habilite CORS no n8n`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickActions = [
        { label: '📊 Resumo financeiro', action: 'Me dê um resumo da minha situação financeira atual' },
        { label: '💡 Dicas de economia', action: 'Quais dicas você tem para economizar dinheiro?' },
        { label: '📅 Contas próximas', action: 'Quais contas tenho para pagar nos próximos dias?' },
    ];

    const handleQuickAction = (action: string) => {
        setInputValue(action);
        setTimeout(() => handleSendMessage(), 100);
    };

    return (
        <>
            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
                    ? 'bg-red-500 hover:bg-red-600 rotate-0'
                    : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700'
                    }`}
                aria-label={isOpen ? 'Fechar chat' : 'Abrir assistente financeiro'}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Indicador de notificação */}
            {!isOpen && (
                <span className="fixed bottom-16 right-6 z-50 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            )}

            {/* Caixa de Diálogo */}
            <div
                className={`fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 transform ${isOpen
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                style={{ maxHeight: 'calc(100vh - 180px)' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-t-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Assistente Financeiro</h3>
                        <p className="text-white/70 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Online • Powered by IA
                        </p>
                    </div>
                </div>

                {/* Mensagens */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                                    ? 'bg-primary text-white rounded-br-md'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-600'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Ações Rápidas */}
                {messages.length <= 2 && (
                    <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Sugestões</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.action)}
                                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-600 dark:text-slate-300 rounded-full transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua mensagem..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-full text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            className="w-10 h-10 bg-primary hover:bg-primary/90 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChatDialog;
