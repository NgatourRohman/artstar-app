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
  const { badgeCount, getLatestBadge } = useBadges();
  const { profile } = useProfile();
  const { t } = useTranslation();

  const displayProfile = isDemoMode ? DEMO_PROFILE : profile;
  const latestBadge = getLatestBadge();
  const artistName = displayProfile?.display_name || 'Artist';

  const getGreeting = () => {
    // Get hour in 24h format regardless of system settings
    const hour = new Date().getHours();
    
    // Logika salam yang lebih mendetail:
    // 05 - 10: Pagi
    // 11 - 14: Siang
    // 15 - 18: Sore
    // 19 - 04: Malam
    if (hour >= 5 && hour < 11) return t('dashboard.greeting_morning', { name: artistName });
    if (hour >= 11 && hour < 15) return t('dashboard.greeting_afternoon', { name: artistName });
    if (hour >= 15 && hour < 19) return t('dashboard.greeting_evening', { name: artistName });
    return t('dashboard.greeting', { name: artistName });
  };

  return (
    <div className="page-enter">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>
          {getGreeting()} ✨
        </h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Row */}
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
            {badgeCount}
          </div>
          <div className="stat-card-label">{t('dashboard.badges_count')}</div>
        </div>
      </div>

      {/* Latest Badge */}
      {latestBadge && (
        <div className="latest-badge-card" onClick={() => navigate('/badges')} style={{ cursor: 'pointer' }}>
          <div className="latest-badge-icon">{latestBadge.icon}</div>
          <div className="latest-badge-info">
            <div className="latest-badge-label">✨ {t('dashboard.latest_badge')}</div>
            <div className="latest-badge-name">{t(latestBadge.name)}</div>
          </div>
        </div>
      )}

      {/* Recent Artworks */}
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

      {/* Quick Actions */}
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
