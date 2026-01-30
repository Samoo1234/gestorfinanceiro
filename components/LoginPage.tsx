
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface LoginPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar no sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) throw error;

      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'Erro ao enviar email de recuperação');
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetSuccess(false);
    setResetError(null);
  };

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
        <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
          Ajuda
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[480px] flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-2">Entrar no Sistema</h1>
            <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal">Gerencie suas contas a pagar com facilidade.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e7edf3] dark:border-slate-800 overflow-hidden">
            <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(to bottom right, #137fec, #0a4fa1)' }}></div>

            <form className="p-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

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
                <div className="flex justify-between items-center">
                  <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative flex items-stretch">
                  <input
                    required
                    className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all pr-12"
                    placeholder="••••••••"
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

              <div className="flex items-center gap-2 py-1">
                <input
                  className="w-4 h-4 text-primary border-[#cfdbe7] dark:border-slate-700 rounded focus:ring-primary/20 bg-slate-50 dark:bg-slate-800"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm text-[#4c739a] dark:text-slate-400 font-medium cursor-pointer" htmlFor="remember">Lembrar de mim</label>
              </div>

              <button
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Entrar</span>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-t border-[#e7edf3] dark:border-slate-800 text-center">
              <p className="text-xs text-[#4c739a] dark:text-slate-500">
                Não tem uma conta? <button onClick={onRegister} className="text-primary font-bold hover:underline">Cadastre-se</button>
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-[#4c739a] dark:text-slate-500 text-xs font-medium">
            <button className="hover:text-primary transition-colors">Política de Privacidade</button>
            <button className="hover:text-primary transition-colors">Termos de Uso</button>
            <button className="hover:text-primary transition-colors">Segurança</button>
          </div>
        </div>
      </main>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Recuperar Senha</h3>
              <button
                onClick={closeResetModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {resetSuccess ? (
                <div className="text-center">
                  <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-emerald-600 text-3xl">mail</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#0d141b] dark:text-white mb-2">Email Enviado!</h4>
                  <p className="text-[#4c739a] dark:text-slate-400 text-sm mb-4">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </p>
                  <button
                    onClick={closeResetModal}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p className="text-[#4c739a] dark:text-slate-400 text-sm mb-4">
                    Digite seu email e enviaremos instruções para redefinir sua senha.
                  </p>

                  {resetError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      {resetError}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-[#0d141b] dark:text-slate-200 text-sm font-semibold">E-mail</label>
                    <input
                      required
                      className="form-input flex w-full rounded-lg text-[#0d141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#cfdbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 placeholder:text-[#4c739a] px-4 text-base font-normal transition-all"
                      placeholder="nome@empresa.com.br"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={resetLoading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeResetModal}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {resetLoading ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        'Enviar'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 -z-10 opacity-10 dark:opacity-5 pointer-events-none">
        <svg fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="400" fill="url(#paint0_linear)" r="300"></circle>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="100" x2="100" y1="100" y2="700">
              <stop stopColor="#137fec"></stop>
              <stop offset="1" stopColor="white" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LoginPage;

