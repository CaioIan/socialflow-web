import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/use-auth-store';
import { postsService } from '../api/posts-service';
import { InstagramPreview } from '@/shared/components/instagram-preview';
import { GlassCard } from '@/shared/components/glass-card';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageSquare,
  Calendar,
  User,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PostDetailPage() {
  const { orgId, campId, postId } = useParams<{ orgId: string, campId: string, postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isClient = role === 'CLIENT';

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsService.getByCampaign(campId!).then(posts => posts.find(p => p.id === postId)),
    enabled: !!postId
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: any) => postsService.updateStatus(postId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', campId] });
    }
  });

  const handleCopyCaption = () => {
    if (post?.captionFixed) {
      navigator.clipboard.writeText(post.captionFixed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p>Carregando preview...</p>
      </div>
    );
  }

  if (!post) return <div>Post não encontrado.</div>;

  const feedUrl = post.currentVersion?.feedUrl || post.assets?.[0]?.cloudinaryUrl || null;
  const storiesUrl = post.currentVersion?.storiesUrl || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <Link 
          to={`/organizations/${orgId}/campaigns/${campId}/posts`} 
          className="text-sm text-zinc-500 hover:text-primary flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Cronograma
        </Link>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400`}>
            Status: {post.status}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-8">
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium text-white">
                    {new Date(post.scheduledFor).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-white">Designer: Fernanda</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Briefing Operacional</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-5 italic">
                    "{post.briefing || 'Nenhum briefing fornecido.'}"
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Legenda Fixa Oficial</h4>
                    <button 
                      onClick={handleCopyCaption}
                      className="text-[10px] font-bold flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiado!' : 'Copiar Legenda'}
                    </button>
                  </div>
                  <div className="bg-zinc-950/50 border border-white/10 rounded-2xl p-5 text-sm text-white leading-relaxed font-mono whitespace-pre-wrap shadow-inner">
                    {post.captionFixed}
                  </div>
                </div>
              </div>

              {/* Approval Panel */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {post.status !== 'APPROVED' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate('APPROVED')}
                      disabled={updateStatusMutation.isPending || !post.currentVersionId}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:grayscale"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprovar Postagém
                    </button>
                  )}
                  {post.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate('ALTERATION_REQUESTED')}
                      disabled={updateStatusMutation.isPending || !post.currentVersionId}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:grayscale"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Solicitar Ajuste
                    </button>
                  )}
                </div>
                {!post.currentVersionId && (
                  <p className="text-[10px] text-zinc-500 text-center mt-4">
                    Aguardando a designer fazer o upload da primeira versão para habilitar aprovação.
                  </p>
                )}
                {post.status === 'APPROVED' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Este post foi aprovado!</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <GlassCard className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Comentários e Histórico</h3>
            </div>
            
            <div className="py-12 text-center text-zinc-600">
              <p className="text-sm">Nenhum comentário por enquanto.</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">Chat será habilitado na entrega final</p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Premium Instagram Preview */}
        <div className="lg:col-span-5 order-1 lg:order-2 sticky top-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <InstagramPreview 
              feedUrl={feedUrl}
              storiesUrl={storiesUrl}
              username={orgId || 'socialflow'}
              caption={post.captionFixed}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
