import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/components/sidebar';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/use-auth-store';
import { OrganizationSelector } from '@/features/auth/components/organization-selector';

export function DashboardLayout() {
  const { currentOrganizationId, organizations, user } = useAuthStore();

  // Trava de segurança: somente CLIENTS são obrigados a selecionar empresa no boot.
  // ADMIN e DESIGNER têm livre trânsito para o Dashboard Geral.
  const userRole = user?.role?.toUpperCase();
  const isClient = userRole === 'CLIENT';
  const isAdminOrDesigner = userRole === 'ADMIN' || userRole === 'DESIGNER';

  const activeOrg = organizations.find(org => org.organizationId === currentOrganizationId);

  // Se for Cliente e não tiver org selecionada, mostra seletor.
  // Caso contrário (Admin, Designer ou carregando), segue para o Dashboard.
  if (isClient && !currentOrganizationId) {
    return <OrganizationSelector />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-64 min-h-screen">
        {/* Navbar / Header area */}
        <header className="h-20 border-b border-white/5 bg-black/10 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">SocialFlow</h2>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_oklch(var(--primary))]" />
              {activeOrg?.name || 'Dashboard Central'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Aqui entrará o Organização Switcher e Avatar */}
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white select-none">Usuário</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-white/10 flex items-center justify-center text-primary font-bold">
              U
            </div>
          </div>
        </header>

        {/* Content area */}
        <motion.div
          key={currentOrganizationId} // Remontar ao trocar de org
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
