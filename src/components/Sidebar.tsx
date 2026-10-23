import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarDays,
  MessageSquarePlus, 
  Search, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  Users, 
  Train, 
  Sparkles,
  Shield,
  Upload,
  LogIn,
  Link2,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount: number;
  userRole: UserRole;
  onOpenUploadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  userRole,
  onOpenUploadModal,
}) => {
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
    { id: 'chat', label: 'Helpdesk Assistant', icon: MessageSquarePlus, highlight: true, roles: ['Admin', 'HR', 'Employee'] },
    { id: 'audit', label: 'Activity Logs', icon: FileText, roles: ['Admin'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'HR'] },
    { id: 'profile', label: 'Staff Directory', icon: Users, roles: ['Admin', 'HR', 'Employee'] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside id="kmrl-sidebar" className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40">
          <Train className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-white text-base tracking-tight leading-none">KMRL Portal</h1>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-md uppercase">
              Official
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Kochi Metro Rail Limited</p>
        </div>
      </div>

      {/* Quick Action Upload Button */}
      <div className="p-3">
        <button
          onClick={onOpenUploadModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer active:scale-98"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document / SOP</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                  {item.badge}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>



      {/* Role Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-500" />
          Role: <strong className="text-slate-200">{userRole}</strong>
        </span>
        <span className="text-[10px] text-slate-500">KMRL Verified</span>
      </div>

    </aside>
  );
};
