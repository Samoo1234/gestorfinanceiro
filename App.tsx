
import React, { useState, useEffect } from 'react';
import { ViewType, Account, AccountStatus, Income, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AccountForm from './components/AccountForm';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import IncomeManagement from './components/IncomeManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';
import MobileMenu from './components/MobileMenu';
import { supabase } from './supabase';
import { parseDate, getTodayString } from './utils';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('login');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setView('dashboard');
        fetchIncomes(session.user.id);
        fetchAccounts(session.user.id);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView('dashboard');
        fetchIncomes(session.user.id);
        fetchAccounts(session.user.id);
        fetchProfile(session.user.id);
      } else {
        setView('login');
        setIncomes([]);
        setAccounts([]);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme from profile
  useEffect(() => {
    if (userProfile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile?.theme]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    } else if (error?.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert([{ user_id: userId }])
        .select()
        .single();
      if (newProfile) setUserProfile(newProfile);
    }
  };

  const fetchIncomes = async (userId: string) => {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (!error && data) {
      setIncomes(data);
    }
  };

  const fetchAccounts = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (!error && data) {
      const todayStr = getTodayString();
      const mappedAccounts: Account[] = data.map(acc => {
        let status = acc.status as AccountStatus;
        if (status === AccountStatus.PENDING && acc.due_date < todayStr) {
          status = AccountStatus.OVERDUE;
        }

        return {
          id: acc.id,
          companyName: acc.company_name,
          companyInitials: acc.company_initials,
          totalValue: Number(acc.total_value),
          installments: acc.installments,
          installmentValue: Number(acc.installment_value),
          dueDate: acc.due_date,
          status: status,
          category: acc.category || 'Outros'
        };
      });
      setAccounts(mappedAccounts);
    }
    setIsLoading(false);
  };

  const handleLogin = () => setView('dashboard');
  const handleRegister = () => setView('register');
  const handleBackToLogin = () => setView('login');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('login');
  };

  const handleAddAccount = async (newAccountData: any) => {
    if (!session || !newAccountData.installments) return;

    const totalInstallmentsStr = newAccountData.installments.split(' / ')[1];
    const totalInstallments = parseInt(totalInstallmentsStr) || 1;
    const installmentsToCreate = [];

    const startDate = parseDate(newAccountData.dueDate);

    if (newAccountData.downPayment > 0) {
      installmentsToCreate.push({
        company_name: newAccountData.companyName,
        company_initials: newAccountData.companyInitials,
        total_value: newAccountData.totalValue,
        installments: 'Entrada',
        installment_value: newAccountData.downPayment,
        due_date: getTodayString(),
        status: AccountStatus.PAID,
        category: newAccountData.category || 'Outros',
        user_id: session.user.id
      });
    }

    for (let i = 0; i < totalInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      if (dueDate.getDate() !== startDate.getDate()) {
        dueDate.setDate(0);
      }

      installmentsToCreate.push({
        company_name: newAccountData.companyName,
        company_initials: newAccountData.companyInitials,
        total_value: newAccountData.totalValue,
        installments: `${i + 1} / ${totalInstallments}`,
        installment_value: newAccountData.installmentValue,
        due_date: dueDate.toISOString().split('T')[0],
        status: AccountStatus.PENDING,
        category: newAccountData.category || 'Outros',
        user_id: session.user.id
      });
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert(installmentsToCreate)
      .select();

    if (!error && data) {
      const mappedNewAccounts: Account[] = data.map(acc => ({
        id: acc.id,
        companyName: acc.company_name,
        companyInitials: acc.company_initials,
        totalValue: acc.total_value,
        installments: acc.installments,
        installmentValue: acc.installment_value,
        dueDate: acc.due_date,
        status: acc.status as AccountStatus,
        category: acc.category || 'Outros'
      }));
      setAccounts([...mappedNewAccounts, ...accounts]);
      setView('dashboard');
    }
  };

  const handleEditAccount = async (id: string, data: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update({
        company_name: data.companyName,
        company_initials: data.companyInitials,
        total_value: data.totalValue,
        installment_value: data.installmentValue,
        due_date: data.dueDate,
        category: data.category,
        status: data.status
      })
      .eq('id', id);

    if (!error) {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...data } : acc));
    }
  };

  const handleAddIncome = async (newIncomeData: Partial<Income>) => {
    if (!session) return;

    const { data, error } = await supabase
      .from('incomes')
      .insert([{
        ...newIncomeData,
        user_id: session.user.id
      }])
      .select();

    if (!error && data) {
      setIncomes([data[0], ...incomes]);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);

    if (!error) {
      setIncomes(incomes.filter(i => i.id !== id));
    }
  };

  const handleToggleIncomeReceived = async (id: string) => {
    const income = incomes.find(i => i.id === id);
    if (!income) return;

    const { error } = await supabase
      .from('incomes')
      .update({ received: !income.received })
      .eq('id', id);

    if (!error) {
      setIncomes(incomes.map(i => i.id === id ? { ...i, received: !i.received } : i));
    }
  };

  const handleEditIncome = async (id: string, data: Partial<Income>) => {
    const { error } = await supabase
      .from('incomes')
      .update({
        description: data.description,
        value: data.value,
        date: data.date,
        category: data.category
      })
      .eq('id', id);

    if (!error) {
      setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, ...data } : inc));
    }
  };


  const handleDeleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: AccountStatus) => {
    const { error } = await supabase
      .from('accounts')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Auth screens
  if (!session) {
    if (view === 'register') {
      return <RegisterPage onRegister={handleLogin} onBackToLogin={handleBackToLogin} />;
    }
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <>
            <Header
              onAddClick={() => setView('add-account')}
              openMobileMenu={() => setMobileMenuOpen(true)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              userProfile={userProfile}
              accounts={accounts}
              onNavigate={setView}
            />
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <Dashboard
                accounts={accounts}
                incomes={incomes}
                searchTerm={searchTerm}
                onStatusChange={handleStatusChange}
                onDeleteAccount={handleDeleteAccount}
                onEditAccount={handleEditAccount}
              />
            )}
          </>
        );
      case 'incomes':
        return (
          <IncomeManagement
            incomes={incomes}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            onToggleReceived={handleToggleIncomeReceived}
            onEditIncome={handleEditIncome}
          />
        );
      case 'add-account':
        return (
          <div className="flex-1 bg-background-light dark:bg-background-dark">
            <AccountForm
              onSave={handleAddAccount}
              onCancel={() => setView('dashboard')}
            />
          </div>
        );
      case 'reports':
        return (
          <div className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto">
            <Reports accounts={accounts} incomes={incomes} />
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto">
            <Settings
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
              onThemeChange={handleThemeChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
      />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
        userName={userProfile?.name || undefined}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        {renderContent()}

        <footer className="mt-auto py-4 px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between opacity-60">
          <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">© 2024 GestorFinanceiro. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <button className="text-[10px] md:text-xs text-slate-500 hover:text-primary transition-colors">Termos</button>
            <button className="text-[10px] md:text-xs text-slate-500 hover:text-primary transition-colors">Privacidade</button>
            <button className="text-[10px] md:text-xs text-slate-500 hover:text-primary transition-colors">Ajuda</button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
