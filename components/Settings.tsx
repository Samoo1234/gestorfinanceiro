import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface SettingsProps {
    userProfile: UserProfile | null;
    onProfileUpdate: (profile: Partial<UserProfile>) => void;
    onThemeChange: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onProfileUpdate, onThemeChange }) => {
    const [name, setName] = useState(userProfile?.name || '');
    const [theme, setTheme] = useState<'light' | 'dark'>(userProfile?.theme || 'light');
    const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile?.notifications_enabled ?? true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password change
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setTheme(userProfile.theme || 'light');
            setNotificationsEnabled(userProfile.notifications_enabled ?? true);
        }
    }, [userProfile]);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        onThemeChange(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    name,
                    theme,
                    notifications_enabled: notificationsEnabled,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userProfile?.user_id);

            if (updateError) throw updateError;

            onProfileUpdate({ name, theme, notifications_enabled: notificationsEnabled });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setPasswordLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setPasswordSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err: any) {
            setPasswordError(err.message || 'Erro ao alterar senha');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#0d141b] dark:text-white mb-2">Configurações</h1>
                <p className="text-[#4c739a] dark:text-slate-400">Personalize sua experiência no sistema.</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Configurações salvas com sucesso!
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Perfil
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#0d141b] dark:text-slate-200">Nome</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Seu nome"
                        />
                    </div>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">palette</span>
                        Aparência
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-[#0d141b] dark:text-slate-200">Tema</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-2xl text-amber-500">light_mode</span>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">Claro</span>
                                </div>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-2xl text-indigo-500">dark_mode</span>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">Escuro</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        Notificações
                    </h2>
                </div>
                <div className="p-6">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <p className="font-medium text-[#0d141b] dark:text-white">Alertas de vencimento</p>
                            <p className="text-sm text-slate-500">Receba alertas sobre contas próximas do vencimento</p>
                        </div>
                        <button
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 size-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            ></div>
                        </button>
                    </label>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        Segurança
                    </h2>
                </div>
                <div className="p-6">
                    {passwordSuccess && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Senha alterada com sucesso!
                        </div>
                    )}

                    {!showPasswordSection ? (
                        <button
                            onClick={() => setShowPasswordSection(true)}
                            className="flex items-center gap-2 text-primary font-medium hover:underline"
                        >
                            <span className="material-symbols-outlined text-[20px]">key</span>
                            Alterar senha
                        </button>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordError && (
                                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {passwordError}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[#0d141b] dark:text-slate-200">Nova Senha</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[#0d141b] dark:text-slate-200">Confirmar Senha</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white h-11 px-4"
                                    placeholder="Repita a senha"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordSection(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setPasswordError(null);
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {passwordLoading ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Alterar Senha'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {loading ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        Salvar Configurações
                    </>
                )}
            </button>
        </div>
    );
};

export default Settings;
