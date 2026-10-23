import React, { useState } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { 
  Bell, 
  Settings,
  ChevronDown, 
  X, 
  FileText, 
  LogOut,
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  ClipboardCheck,
  MessageSquarePlus,
  BarChart3,
  Users,
  Menu,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  onOpenSearch?: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount?: number;
  onOpenUploadModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSelectUser,
  notifications,
  onMarkNotificationsRead,
  activeTab,
  onTabChange,
  pendingApprovalsCount = 0,
  onLogout,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR', 'Employee'] },
    { id: 'documents', label: 'Documents', icon: FolderKanban, roles: ['Admin', 'HR', 'Employee'] },
    { id: 'leave', label: 'Leave Requests', icon: CalendarDays, roles: ['Admin', 'HR', 'Employee'] },
    { 
      id: 'approvals', 
      label: 'Approvals', 
      icon: ClipboardCheck, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      roles: ['Admin', 'HR'] 
    },
    { id: 'chat', label: 'Helpdesk Assistant', icon: MessageSquarePlus, roles: ['Admin', 'HR', 'Employee'] },
    { id: 'audit', label: 'Activity Logs', icon: FileText, roles: ['Admin'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'HR'] },
    { id: 'profile', label: 'Staff Directory', icon: Users, roles: ['Admin', 'HR', 'Employee'] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(currentUser.role));

  // Determine user initial for circular avatar icon
  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S';

  return (
    <header id="kmrl-navbar" className="sticky top-0 z-40 bg-[#0f141c]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        
        {/* 1. Brand Logo: Clean transparent metro train logo */}
        <div 
          className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
          onClick={() => {
            onTabChange('dashboard');
            setShowMobileMenu(false);
          }}
        >
          <img
            src="/kmrl-logo.png"
            alt="Kochi Metro Rail Limited"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm filter brightness-105"
          />
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-wider">KMRL</span>
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                PORTAL
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Kochi Metro Rail Limited</span>
          </div>
        </div>

        {/* 2. Top Navigation Items (Moved from sidebar to top horizontal bar) */}
        <nav className="hidden lg:flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-teal-300 font-semibold shadow-xs border border-slate-700/80 ring-1 ring-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Settings Gear, Notifications Bell, and User Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Settings Icon */}
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer"
            title="Settings & System Roles"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications Popover Toggle */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-2.5 h-2.5 text-[8px] font-bold text-slate-950 bg-amber-400 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkNotificationsRead}
                      className="text-xs text-teal-700 hover:underline font-medium cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No recent notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 transition-colors ${n.read ? 'bg-white' : 'bg-teal-50/40'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                          <span className="text-[10px] text-slate-400 shrink-0">{(n.timestamp || (n as any).createdAt || '').split(' ')[1] || n.timestamp || ''}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Circular Avatar Button (Pure circle, no arrow, shows user photo or initial fallback) */}
          <div className="relative">
            <button
              id="btn-user-role-menu"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-700/80 hover:ring-teal-400 transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center focus:outline-hidden"
              title={currentUser.name}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`avatar-fallback w-full h-full bg-[#d81b60] text-white items-center justify-center font-bold text-xs shadow-xs ${
                  currentUser.avatar ? 'hidden' : 'flex'
                }`}
              >
                {userInitial}
              </div>
            </button>

            {/* Profile Popover */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800">
                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex items-center gap-3">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#d81b60] text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-white/20 shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold leading-tight">{currentUser.name}</h4>
                      <p className="text-xs text-slate-300">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Department</span>
                    <span className="text-slate-200 font-semibold">{currentUser.department}</span>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/70 border-b border-teal-100/80 text-[11px] text-teal-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Role: <strong className="font-semibold">{currentUser.role}</strong></span>
                  </div>
                  <span className="text-[10px] bg-teal-200 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {/* Switch User / Role Quick Toggle */}
                <div className="p-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Switch Test Account
                  </span>
                  <div className="space-y-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                                u.role === 'Admin' ? 'bg-[#d81b60]' : u.role === 'HR' ? 'bg-teal-600' : 'bg-blue-600'
                              }`}>
                                {initial}
                              </div>
                            )}
                            <span>{u.name} ({u.role})</span>
                          </div>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 space-y-1.5">
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-rose-200/80"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => {
              setShowMobileMenu(!showMobileMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
            }}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Navigation Menu"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500 text-slate-950 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
