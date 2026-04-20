import { LayoutDashboard, Building2, Users, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/use-auth-store';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'DESIGNER', 'CLIENT'] },
  { icon: Building2, label: 'Organizações', href: '/organizations', roles: ['ADMIN', 'DESIGNER'] },
  { icon: Users, label: 'Equipe', href: '/team', roles: ['ADMIN'] },
  { icon: Settings, label: 'Configurações', href: '/settings', roles: ['ADMIN', 'DESIGNER', 'CLIENT'] },
];

export function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_oklch(var(--primary)/0.4)]">
            <span className="text-white font-bold text-xl leading-none">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-glow">SocialFlow</span>
        </div>

        <nav className="space-y-1">
          {menuItems.filter(item => !item.roles || item.roles.includes(user?.role || '')).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-zinc-300")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-red-400 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}
