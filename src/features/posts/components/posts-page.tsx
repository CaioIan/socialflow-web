import * as React from 'react';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/use-auth-store';
import { GlassCard } from '@/shared/components/glass-card';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  MoreVertical,
  Image as ImageIcon,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsService } from '@/features/campaigns/api/campaigns-service';
import { postsService } from '../api/posts-service';
import { CreatePostModal } from './create-post-modal';
import { UploadVersionModal } from './upload-version-modal';
import { Upload } from 'lucide-react';

export default function PostsPage() {
  const { orgId, id: campaignId } = useParams<{ orgId: string, id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isDesigner = role === 'DESIGNER';
  const isClient = role === 'CLIENT';

  // Detalhes da Campanha
  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsService.getAll().then(res => res.find(c => c.id === campaignId)),
    enabled: !!campaignId
  });

  // Lista de Posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', campaignId],
    queryFn: () => postsService.getByCampaign(campaignId!),
    enabled: !!campaignId
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Aprovado', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
      case 'ALTERATION_REQUESTED':
        return { label: 'Alteração Solicitada', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertCircle };
      case 'CANCELLED':
        return { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle };
      default:
        return { label: 'Pendente', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p>Carregando cronograma...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            to={`/organizations/${orgId}/campaigns`} 
            className="text-xs text-zinc-500 hover:text-primary flex items-center gap-1 mb-2 transition-colors w-fit"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar para Campanhas
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-glow flex items-center gap-3">
            {campaign?.title || 'Campanha'}
          </h1>
          <p className="text-zinc-500">Cronograma de postagens e artes.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-[0_0_25px_oklch(var(--primary)/0.3)]"
          >
            <Plus className="w-5 h-5" />
            Novo Post
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post, index) => {
          const status = getStatusConfig(post.status);
          const Icon = status.icon;

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="group hover:border-white/20 transition-all flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                    <Icon className="w-3 h-3" />
                    {status.label}
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 mb-4 group-hover:border-primary/20 transition-all">
                    {post.currentVersion?.feedUrl || (post.assets && post.assets.length > 0) ? (
                      <img 
                        src={post.currentVersion?.feedUrl || post.assets?.[0]?.cloudinaryUrl} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt="Preview do Post"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sem Arte</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 leading-none">
                        {new Date(post.scheduledFor).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-lg font-bold leading-none mt-0.5">
                        {new Date(post.scheduledFor).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight line-clamp-1">{post.briefing || 'Sem título'}</h3>
                      <p className="text-xs text-zinc-500">Publicação às {new Date(post.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed whitespace-pre-wrap italic">
                      "{post.captionFixed}"
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-500" title="Admin">
                      AD
                    </div>
                    {post.assignedDesignerId && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-primary" title="Designer">
                        DS
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-zinc-500">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-medium">0</span>
                    </div>
                    {(isAdmin || isDesigner) && (!post.currentVersionId || post.status === 'ALTERATION_REQUESTED') && (
                      <button 
                        onClick={() => {
                          setSelectedPostId(post.id);
                          setIsUploadModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-primary hover:text-white transition-all bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {post.currentVersionId ? 'Nova Versão' : 'Upload'}
                      </button>
                    )}
                    {(isAdmin || isDesigner || isClient) && post.currentVersionId && (
                      <Link 
                        to={`/organizations/${orgId}/campaigns/${campaignId}/posts/${post.id}`}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-white transition-all bg-emerald-500/10 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Abrir Preview
                      </Link>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}

        {posts.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-zinc-400 mb-2">Nenhum post agendado</h3>
            <p className="text-zinc-600 mb-8 max-w-xs mx-auto text-sm text-balance">
              {isAdmin 
                ? "Comece agendando o primeiro post para este cronograma mensal."
                : "Aguardando o administrador cadastrar o cronograma de posts."
              }
            </p>
            {isAdmin && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors font-bold"
              >
                <Plus className="w-4 h-4" />
                Agendar Primeiro Post
              </button>
            )}
          </div>
        )}
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        campaignId={campaignId!}
      />

      {selectedPostId && (
        <UploadVersionModal 
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedPostId(null);
          }}
          postId={selectedPostId}
          campaignId={campaignId!}
        />
      )}
    </div>
  );
}
