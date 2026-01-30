import React, { useState, useRef, useEffect } from 'react';
import { Account, AccountStatus, Notification } from '../types';
import { formatDate, parseDate } from '../utils';

interface NotificationsDropdownProps {
    accounts: Account[];
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ accounts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Generate notifications based on account data
    const generateNotifications = (): Notification[] => {
        const notifications: Notification[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        accounts.forEach(account => {
            if (account.status === AccountStatus.PAID) return;

            const dueDate = parseDate(account.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (account.status === AccountStatus.OVERDUE || diffDays < 0) {
                notifications.push({
                    id: `overdue-${account.id}`,
                    type: 'danger',
                    title: 'Conta Atrasada',
                    message: `${account.companyName} - Venceu em ${formatDate(account.dueDate)}`,
                    accountId: account.id
                });
            } else if (diffDays === 0) {
                notifications.push({
                    id: `today-${account.id}`,
                    type: 'warning',
                    title: 'Vence Hoje',
                    message: `${account.companyName} - R$ ${account.installmentValue.toFixed(2)}`,
                    accountId: account.id
                });
            } else if (diffDays <= 3) {
                notifications.push({
                    id: `soon-${account.id}`,
                    type: 'info',
                    title: `Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`,
                    message: `${account.companyName} - ${formatDate(account.dueDate)}`,
                    accountId: account.id
                });
            }
        });

        // Sort: danger first, then warning, then info
        return notifications.sort((a, b) => {
            const order = { danger: 0, warning: 1, info: 2 };
            return order[a.type] - order[b.type];
        });
    };

    const notifications = generateNotifications();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationStyles = (type: Notification['type']) => {
        switch (type) {
            case 'danger':
                return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600';
            case 'warning':
                return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600';
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'danger':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#e7edf3] dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-[#d8e2ed] dark:hover:bg-slate-700 transition-colors shrink-0 relative"
            >
                <span className="material-symbols-outlined">notifications</span>
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-bold text-[#0d141b] dark:text-white">Notificações</h3>
                        {notifications.length > 0 && (
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                {notifications.length} alerta{notifications.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">notifications_off</span>
                                <p className="text-sm">Nenhuma notificação</p>
                                <p className="text-xs mt-1">Você está em dia! 🎉</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 border-l-4 ${getNotificationStyles(notification.type)} hover:bg-opacity-75 transition-colors cursor-pointer`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`material-symbols-outlined text-[20px] mt-0.5`}>
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-[#0d141b] dark:text-white">{notification.title}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{notification.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <button className="w-full text-center text-xs text-primary font-semibold hover:underline">
                                Ver todas as contas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
