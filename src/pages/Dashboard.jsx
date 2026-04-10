import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Trophy, Award, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useBadges } from '../hooks/useBadges';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILE } from '../lib/demoData';
import BadgeSlider from '../components/ui/BadgeSlider';

const CATEGORY_EMOJIS = {
  drawing: '✏️',
  painting: '🎨',
  coloring: '🖍️',
  digital: '💻',
  craft: '✂️',
  other: '🎭',
};

const CATEGORY_COLORS = {
  drawing: '#7C3AED',
  painting: '#F97316',
  coloring: '#EC4899',
  digital: '#3B82F6',
  craft: '#10B981',
  other: '#6366F1',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { artworks } = useArtworks();
  const { competitions } = useCompetitions();
  const { getBadgesWithStatus } = useBadges();
  const { profile } = useProfile();
  const { t } = useTranslation();

  const displayProfile = isDemoMode ? DEMO_PROFILE : profile;
  const allBadges = getBadgesWithStatus();
  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const artistName = displayProfile?.display_name || 'Artist';

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 11) return t('dashboard.greeting_morning', { name: artistName });
    if (hour >= 11 && hour < 15) return t('dashboard.greeting_afternoon', { name: artistName });
    if (hour >= 15 && hour < 19) return t('dashboard.greeting_evening', { name: artistName });
    return t('dashboard.greeting', { name: artistName });
  };

  return (
    <div className="page-enter">
      <div className="dashboard-greeting">
        <h1>
          {getGreeting()} ✨
        </h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      <div className="gamification-summary" style={{
        background: 'var(--color-bg-secondary)',
        padding: 'var(--space-md) var(--space-lg)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--space-lg)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              background: 'var(--color-primary)', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: 'var(--radius-full)',
              fontSize: '10px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
              letterSpacing: '0.05em'
            }}>
              LEVEL {displayProfile?.level || 1}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              XP: {displayProfile?.xp || 0}
            </span>
          </div>
          <button 
            className="btn-text" 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/analytics');
            }}
            style={{ 
              fontSize: '10px', 
              color: 'var(--color-primary)', 
              fontWeight: 800,
              padding: '4px 10px',
              background: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {t('gamification.see_detail')}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 2 }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            ✨ {t('gamification.xp_left', { amount: 100 - ((displayProfile?.xp || 0) % 100), level: (displayProfile?.level || 1) + 1 })}
          </span>
        </div>
        <div style={{ 
          height: 12, 
          background: 'rgba(0,0,0,0.05)', 
          borderRadius: 'var(--radius-full)', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            width: `${(displayProfile?.xp || 0) % 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), #A78BFA)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }} />
        </div>
      </div>

      <div className="stats-row">
        <div 
          className="stat-card" 
          onClick={() => navigate('/gallery')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #DDD6FE, #A78BFA)' }}>
            <Palette size={22} color="#7C3AED" />
          </div>
          <div className="stat-card-value" style={{ color: '#7C3AED' }}>
            {artworks.length}
          </div>
          <div className="stat-card-label">{t('dashboard.artworks_count')}</div>
        </div>

        <div 
          className="stat-card"
          onClick={() => navigate('/competitions')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FDE68A, #F59E0B)' }}>
            <Trophy size={22} color="#92400E" />
          </div>
          <div className="stat-card-value" style={{ color: '#F59E0B' }}>
            {competitions.length}
          </div>
          <div className="stat-card-label">{t('dashboard.competitions_count')}</div>
        </div>

        <div 
          className="stat-card"
          onClick={() => navigate('/badges')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FECDD3, #FB7185)' }}>
            <Award size={22} color="#BE123C" />
          </div>
          <div className="stat-card-value" style={{ color: '#EC4899' }}>
            {unlockedBadges.length}
          </div>
          <div className="stat-card-label">{t('dashboard.badges_count')}</div>
        </div>
      </div>

      {unlockedBadges.length > 0 && (
        <BadgeSlider badges={unlockedBadges} />
      )}

      {artworks.length > 0 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.recent_artworks')}</h2>
            <button className="section-action" onClick={() => navigate('/gallery')}>
              {t('dashboard.see_all')} <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          <div className="horizontal-scroll">
            {artworks.slice(0, 6).map((artwork) => (
              <div key={artwork.id} className="recent-artwork-mini" onClick={() => navigate('/gallery')}>
                <div
                  className="recent-artwork-mini-image"
                  style={{
                    background: artwork.image_url
                      ? `url(${artwork.image_url}) center/cover`
                      : `linear-gradient(135deg, ${artwork.color || CATEGORY_COLORS[artwork.category] || '#7C3AED'}22, ${artwork.color || CATEGORY_COLORS[artwork.category] || '#7C3AED'}44)`,
                  }}
                >
                  {!artwork.image_url && (CATEGORY_EMOJIS[artwork.category] || '🎨')}
                </div>
                <div className="recent-artwork-mini-title">{artwork.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {artworks.length === 0 && (
        <div className="text-center mt-xl">
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎨</div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            {t('gallery.empty_title')}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 'var(--text-sm)' }}>
            {t('gallery.empty_subtitle')}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/gallery?add=true')}>
            <Sparkles size={20} /> {t('common.add_artwork')}
          </button>
        </div>
      )}
    </div>
  );
}
