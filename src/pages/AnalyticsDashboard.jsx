import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { ArrowLeft, TrendingUp, Star, Award, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useProfile } from '../hooks/useProfile';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { artworks } = useArtworks();
  const { competitions } = useCompetitions();
  const { profile } = useProfile();

  const chartData = useMemo(() => {
    const months = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
  months[monthKey] = { name: monthKey, artworks: 0, competitions: 0 };
    }

    artworks.forEach(art => {
      const d = new Date(art.created_at || art.date);
      const monthKey = d.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
  if (months[monthKey]) months[monthKey].artworks += 1;
    });

    competitions.forEach(comp => {
      const d = new Date(comp.date);
      const monthKey = d.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
  if (months[monthKey]) months[monthKey].competitions += 1;
    });

    return Object.values(months);
  }, [artworks, competitions]);

  const winRateInsight = useMemo(() => {
    if (competitions.length === 0) return { label: t('analytics.win_rate.start'), color: '#6B7280', emoji: '🌱' };
    
    const wins = competitions.filter(c => c.result === 'winner' || c.result === 'grand_winner').length;
    const rate = (wins / competitions.length) * 100;

    if (rate >= 50) return { label: t('analytics.win_rate.often'), color: '#D97706', emoji: '👑' };
    if (wins > 0) return { label: t('analytics.win_rate.great'), color: '#2563EB', emoji: '⭐' };
    return { label: t('analytics.win_rate.keep_going'), color: '#059669', emoji: '🎨' };
  }, [competitions]);

  const activityTimeline = useMemo(() => {
    const activities = [
      ...artworks.map(a => ({ 
        type: 'art', 
        date: new Date(a.created_at || a.date), 
        text: t('analytics.narrative.art', { title: a.title }) 
      })),
      ...competitions.map(c => ({ 
        type: 'comp', 
        date: new Date(c.date), 
        text: t('analytics.narrative.comp', { name: c.name }) 
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    return activities;
  }, [artworks, competitions]);

  return (
    <div className="page-enter analytics-page" style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div className="section-header">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="section-title" style={{ fontSize: 'var(--text-xl)' }}>
          {t('analytics.title')} ✨
        </h1>
      </div>

      <div className="hero-stats" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary), #A78BFA)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-2xl)',
        color: 'white',
        marginBottom: 'var(--space-xl)',
        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)'
      }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 8 }}>
          {t('analytics.hero_title', { name: profile?.display_name || 'Little Artist' })} 👨‍🎨
        </h2>
        <p style={{ opacity: 0.9, fontSize: 'var(--text-sm)' }}>
          {t('analytics.hero_subtitle')}
        </p>
      </div>

      <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card-plain" style={{ background: '#F3F4F6', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📈</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{artworks.length}</div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{t('analytics.total_artworks')}</div>
        </div>
        <div className="stat-card-plain" style={{ background: '#F3F4F6', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🎯</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{competitions.length}</div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{t('analytics.total_competitions')}</div>
        </div>
      </div>

      <h3 className="section-subtitle" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
        {t('analytics.growth_title')}
      </h3>
      <div style={{ width: '100%', height: 200, background: 'white', padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-xl)', boxShadow: 'var(--shadow-sm)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="artworks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name={t('dashboard.artworks_count')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="section-subtitle" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
        {t('analytics.win_rate_title')}
      </h3>
      <div style={{ 
        background: winRateInsight.color + '10', 
        border: `2px dashed ${winRateInsight.color}40`,
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ fontSize: '2.5rem' }}>{winRateInsight.emoji}</div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: winRateInsight.color }}>
          {winRateInsight.label}
        </div>
      </div>

      <h3 className="section-subtitle" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
        {t('analytics.timeline_title')}
      </h3>
      <div className="narrative-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {activityTimeline.map((act, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            alignItems: 'center',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              background: act.type === 'art' ? 'var(--color-primary)' : 'var(--color-accent)' 
            }} />
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {act.text}
            </div>
          </div>
        ))}
        {activityTimeline.length === 0 && (
          <div className="text-center" style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)', padding: 'var(--space-xl)' }}>
            {t('analytics.no_activity')}
          </div>
        )}
      </div>
    </div>
  );
}
