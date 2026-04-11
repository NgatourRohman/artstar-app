import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowLeft, TrendingUp, Star, Award, Calendar, ChevronRight } from 'lucide-react';
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
  
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'monthly'

  // Helper to get Monday of the week in UTC
  const getUTCMonday = (date) => {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
  };

  const chartData = useMemo(() => {
    const today = new Date();
    const currentLang = i18n.language === 'id' ? 'id-ID' : 'en-US';

    if (viewMode === 'weekly') {
      const weeks = [];
      // Initialize last 8 weeks using UTC
      for (let i = 7; i >= 0; i--) {
        const referenceDate = new Date(today);
        referenceDate.setUTCDate(today.getUTCDate() - (i * 7));
        const monday = getUTCMonday(referenceDate);
        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);
        
        const label = `${monday.getUTCDate()} ${monday.toLocaleDateString(currentLang, { month: 'short' })} - ${sunday.getUTCDate()} ${sunday.toLocaleDateString(currentLang, { month: 'short' })}`;
        
        weeks.push({
          id: monday.toISOString().split('T')[0],
          name: label,
          artworks: 0,
          competitions: 0,
          isCurrent: i === 0
        });
      }

      artworks.forEach(art => {
        const artDate = new Date(art.created_at || art.date);
        const artMonday = getUTCMonday(artDate).toISOString().split('T')[0];
        const week = weeks.find(w => w.id === artMonday);
        if (week) week.artworks += 1;
      });

      competitions.forEach(comp => {
        const compDate = new Date(comp.date);
        const compMonday = getUTCMonday(compDate).toISOString().split('T')[0];
        const week = weeks.find(w => w.id === compMonday);
        if (week) week.competitions += 1;
      });

      return weeks;
    } else {
      // Monthly: last 6 months using UTC for safety
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
        const monthKey = d.toLocaleString(currentLang, { month: 'short', timeZone: 'UTC' });
        const id = d.toISOString().slice(0, 7); // YYYY-MM
        
        months.push({
          id,
          name: monthKey,
          artworks: 0,
          competitions: 0,
          isCurrent: i === 0
        });
      }

      artworks.forEach(art => {
        const d = new Date(art.created_at || art.date);
        const id = d.toISOString().slice(0, 7);
        const month = months.find(m => m.id === id);
        if (month) month.artworks += 1;
      });

      competitions.forEach(comp => {
        const d = new Date(comp.date);
        const id = d.toISOString().slice(0, 7);
        const month = months.find(m => m.id === id);
        if (month) month.competitions += 1;
      });

      return months;
    }
  }, [artworks, competitions, viewMode, i18n.language]);

  const summaryStats = useMemo(() => {
    const today = new Date();
    const thisMonday = getUTCMonday(today).toISOString().split('T')[0];
    
    const lastMondayDate = getUTCMonday(today);
    lastMondayDate.setUTCDate(lastMondayDate.getUTCDate() - 7);
    const lastMonday = lastMondayDate.toISOString().split('T')[0];

    const stats = {
      thisWeekArt: 0,
      thisWeekComp: 0,
      lastWeekArt: 0,
      lastWeekComp: 0
    };

    artworks.forEach(art => {
      const artMonday = getUTCMonday(new Date(art.created_at || art.date)).toISOString().split('T')[0];
      if (artMonday === thisMonday) stats.thisWeekArt += 1;
      if (artMonday === lastMonday) stats.lastWeekArt += 1;
    });

    competitions.forEach(comp => {
      const compMonday = getUTCMonday(new Date(comp.date)).toISOString().split('T')[0];
      if (compMonday === thisMonday) stats.thisWeekComp += 1;
      if (compMonday === lastMonday) stats.lastWeekComp += 1;
    });

    const calculateGrowth = (current, prev) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prev) / prev) * 100);
    };

    return {
      art: stats.thisWeekArt,
      comp: stats.thisWeekComp,
      artGrowth: calculateGrowth(stats.thisWeekArt, stats.lastWeekArt),
      compGrowth: calculateGrowth(stats.thisWeekComp, stats.lastWeekComp)
    };
  }, [artworks, competitions]);

  const winRateInsight = useMemo(() => {
    if (competitions.length === 0) return { label: t('analytics.win_rate.start'), color: '#6B7280', emoji: '🌱' };
    const wins = competitions.filter(c => c.result === 'winner' || c.result === 'grand_winner').length;
    const rate = (wins / competitions.length) * 100;
    if (rate >= 50) return { label: t('analytics.win_rate.often'), color: '#D97706', emoji: '👑' };
    if (wins > 0) return { label: t('analytics.win_rate.great'), color: '#2563EB', emoji: '⭐' };
    return { label: t('analytics.win_rate.keep_going'), color: '#059669', emoji: '🎨' };
  }, [competitions, t]);

  const activityTimeline = useMemo(() => {
    return [
      ...artworks.map(a => ({ type: 'art', date: new Date(a.created_at || a.date), text: t('analytics.narrative.art', { title: a.title }) })),
      ...competitions.map(c => ({ type: 'comp', date: new Date(c.date), text: t('analytics.narrative.comp', { name: c.name }) }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);
  }, [artworks, competitions, t]);

  return (
    <div className="page-enter analytics-page" style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div className="section-header" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="section-title" style={{ fontSize: 'var(--text-xl)' }}>
          {t('analytics.title')} ✨
        </h1>
      </div>

      <div className="hero-stats" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary), #9333EA)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-2xl)',
        color: 'white',
        marginBottom: 'var(--space-xl)',
        boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.4)'
      }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 8, fontWeight: 800 }}>
          {t('analytics.hero_title', { name: profile?.display_name || 'Little Artist' })} 👨‍🎨
        </h2>
        <p style={{ opacity: 0.9, fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          {t('analytics.hero_subtitle')}
        </p>
      </div>

      {/* Summary Insight Section */}
      <div className="summary-insights" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, marginBottom: 'var(--space-md)', color: 'var(--color-text-tertiary)', letterSpacing: '1px' }}>
          {t('analytics.summary.this_week').toUpperCase()}
        </h3>
        <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
          {/* Artworks Card */}
          <div className="insight-card" style={{ 
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ padding: 10, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-lg)', color: '#6366F1', display: 'flex' }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{summaryStats.art}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4 }}>
                {t('analytics.summary.artworks')}
              </div>
            </div>
            <div style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)',
              background: summaryStats.artGrowth >= 0 ? '#DCFCE7' : '#FEE2E2',
              color: summaryStats.artGrowth >= 0 ? '#166534' : '#991B1B',
              flexShrink: 0
            }}>
              {summaryStats.artGrowth > 0 ? `+${summaryStats.artGrowth}%` : summaryStats.artGrowth === 0 ? t('analytics.summary.growth_stable') : `${summaryStats.artGrowth}%`}
            </div>
          </div>

          {/* Competitions Card */}
          <div className="insight-card" style={{ 
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(245, 158, 11, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ padding: 10, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', color: '#F59E0B', display: 'flex' }}>
              <Award size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{summaryStats.comp}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4 }}>
                {t('analytics.summary.competitions')}
              </div>
            </div>
            <div style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)',
              background: summaryStats.compGrowth >= 0 ? '#DCFCE7' : '#FEE2E2',
              color: summaryStats.compGrowth >= 0 ? '#166534' : '#991B1B',
              flexShrink: 0
            }}>
              {summaryStats.compGrowth > 0 ? `+${summaryStats.compGrowth}%` : summaryStats.compGrowth === 0 ? t('analytics.summary.growth_stable') : `${summaryStats.compGrowth}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 className="section-subtitle" style={{ fontSize: 'var(--text-xs)', fontWeight: 800, margin: 0, color: 'var(--color-text-tertiary)', letterSpacing: '1px' }}>
          {t('analytics.growth_title').toUpperCase()}
        </h3>
        <div className="view-toggle" style={{ background: '#F1F5F9', padding: 4, borderRadius: 'var(--radius-lg)', display: 'flex', gap: 4 }}>
          <button 
            onClick={() => setViewMode('weekly')}
            style={{ 
              padding: '6px 14px', 
              fontSize: '10px', 
              fontWeight: 800, 
              borderRadius: 'var(--radius-md)', 
              border: 'none',
              background: viewMode === 'weekly' ? 'white' : 'transparent',
              boxShadow: viewMode === 'weekly' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              color: viewMode === 'weekly' ? '#6366F1' : 'var(--color-text-tertiary)',
              transition: 'all 0.2s'
            }}
          >
            {t('analytics.weekly').toUpperCase()}
          </button>
          <button 
            onClick={() => setViewMode('monthly')}
            style={{ 
              padding: '6px 14px', 
              fontSize: '10px', 
              fontWeight: 800, 
              borderRadius: 'var(--radius-md)', 
              border: 'none',
              background: viewMode === 'monthly' ? 'white' : 'transparent',
              boxShadow: viewMode === 'monthly' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              color: viewMode === 'monthly' ? '#6366F1' : 'var(--color-text-tertiary)',
              transition: 'all 0.2s'
            }}
          >
            {t('analytics.monthly').toUpperCase()}
          </button>
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        height: 300, 
        minWidth: 0,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: 'var(--space-lg)', 
        borderRadius: 'var(--radius-2xl)', 
        marginBottom: 'var(--space-xl)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
        border: '1px solid rgba(255,255,255,0.8)' 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              fontSize={9} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-text-tertiary)', fontWeight: 600 }}
              interval={viewMode === 'weekly' ? 1 : 0}
            />
            <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-tertiary)', fontWeight: 600 }} />
            <Tooltip 
              cursor={{ fill: '#F1F5F9', radius: 8 }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 600 }}
            />
            <Bar dataKey="artworks" radius={[6, 6, 0, 0]} name={t('dashboard.artworks_count')} barSize={viewMode === 'weekly' ? 10 : 20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#6366F1' : '#CBD5E1'} />
              ))}
            </Bar>
            <Bar dataKey="competitions" radius={[6, 6, 0, 0]} name={t('dashboard.competitions_count')} barSize={viewMode === 'weekly' ? 10 : 20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#F59E0B' : '#E2E8F0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Champion Pace Section */}
      <h3 className="section-subtitle" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
        {t('analytics.win_rate_title')}
      </h3>
      <div style={{ 
        background: winRateInsight.color + '08', 
        border: `1.5px dashed ${winRateInsight.color}30`,
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-2xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{winRateInsight.emoji}</div>
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: winRateInsight.color, marginBottom: 4 }}>
            {winRateInsight.label}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
             {t('analytics.hero_subtitle')}
          </div>
        </div>
      </div>

      {/* Log Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 className="section-subtitle" style={{ fontSize: 'var(--text-sm)', fontWeight: 800, margin: 0 }}>
          {t('analytics.timeline_title')}
        </h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
          {t('dashboard.see_all')} <ChevronRight size={14} />
        </button>
      </div>
      <div className="narrative-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {activityTimeline.map((act, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            alignItems: 'center',
            padding: 'var(--space-md)',
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #F9FAFB'
          }}>
            <div style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              background: act.type === 'art' ? 'var(--color-primary)' : 'var(--color-accent)',
              boxShadow: `0 0 0 4px ${act.type === 'art' ? 'var(--color-primary-light)' : '#FEF3C7'}`
            }} />
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {act.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
