import React, { useState } from 'react';
import { supabase } from '../supabase';

interface RegisterPageProps {
    onRegister: () => void;
    onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onBackToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (signUpError) throw signUpError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 px-6 lg:px-10 py-3 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="size-6 shrink-0">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Portal Contas</h2>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
                    <div className="w-full max-w-[480px] flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-[#e7edf3] dark:border-slate-800 p-8 text-center">
                            <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-2">Conta Criada com Sucesso!</h2>
                            <p className="text-[#4c739a] dark:text-slate-400 mb-6">
                                Verifique seu email para confirmar sua conta. Depois, você poderá fazer login.
                            </p>
                            <button
                                onClick={onBackToLogin}
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all"
                            >
                                Voltar ao Login
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 px-6 lg:px-10 py-3 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 text-primary">
                    <div className="size-6 shrink-0">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z"></path>
                        </svg>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Portal Contas</h2>
                </div>
                <button
                    onClick={onBackToLogin}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Voltar ao Login
                </button>
            </header>

            <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    <div className="text-center">
                        <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-2">Criar Conta</h1>
                        <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal">Preencha os dados abaixo para começar.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7edf3] dark:border-slate-800 overflow-hidden">
                        <div className="w-full h-24 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(to bottom right, #10b981, #059669)' }}></div>

                        <form className="p-8 flex flex-col gap-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Nome Completo</label>
                                <input
                                    required
                                    className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all"
                                    placeholder="Seu nome"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">E-mail</label>
                                <input
                                    required
                                    className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all"
                                    placeholder="nome@empresa.com.br"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Senha</label>
                                <div className="relative flex items-stretch">
                                    <input
                                        required
                                        className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all pr-12"
                                        placeholder="Mínimo 6 caracteres"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-[#4c739a] hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Confirmar Senha</label>
                                <input
                                    required
                                    className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all"
                                    placeholder="Repita a senha"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                type="submit"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Criar Conta</span>
                                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-t border-[#e7edf3] dark:border-slate-800 text-center">
                            <p className="text-xs text-[#4c739a] dark:text-slate-500">
                                Já tem uma conta? <button onClick={onBackToLogin} className="text-primary font-bold hover:underline">Faça login</button>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
