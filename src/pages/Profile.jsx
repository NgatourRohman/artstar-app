import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LogOut, Award, Clock, Settings, Globe, Palette, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useBadges } from '../hooks/useBadges';
import { DEMO_PROFILE } from '../lib/demoData';
import { generatePortfolioPDF } from '../lib/ExportUtils';

const AVATAR_OPTIONS = [
  '🦄', '🐱', '🐶', '🦊', '🐼',
  '🐰', '🦁', '🐸', '🐧', '🦋',
  '🌟', '🌈', '🎨', '🚀', '💎',
  '🌸', '🎵', '🍦', '🐝', '🦕',
];

export default function Profile() {
  const navigate = useNavigate();
  const { signOut, isDemoMode } = useAuth();
  const { profile, fetchProfile, updateProfile } = useProfile();
  const { artworks } = useArtworks();
  const { competitions } = useCompetitions();
  const { badgeCount } = useBadges();
  const { t, i18n } = useTranslation();

  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const displayProfile = isDemoMode ? DEMO_PROFILE : profile;

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (displayProfile) {
      setEditName(displayProfile.display_name || '');
      setEditAvatar(displayProfile.avatar_url || '🦄');
    }
  }, [displayProfile]);

  const handleSaveSettings = () => {
    updateProfile({ display_name: editName, avatar_url: editAvatar });
    setShowSettings(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleExportPDF = () => {
    generatePortfolioPDF({
      profile: displayProfile,
      artworks,
      competitions,
      badgeCount,
      t
    });
  };

  const memberSince = displayProfile?.created_at
    ? new Date(displayProfile.created_at).toLocaleDateString(i18n.resolveLanguage === 'id' ? 'id-ID' : 'en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="page-enter">
      <div className="profile-header">
        <div className="profile-avatar">
          {displayProfile?.avatar_url || '🦄'}
        </div>
        <h1 className="profile-name">{displayProfile?.display_name || 'Little Artist'}</h1>
        <p className="profile-since">⭐ {t('profile.member_since', { date: memberSince })}</p>
      </div>

      <div className="stats-row mt-xl">
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

      <div className="flex flex-col gap-sm mt-xl">
        <button
          className="stat-card"
          onClick={() => navigate('/badges')}
          style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FECDD3, #FB7185)' }}>
            <Award size={22} color="#BE123C" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label" style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>{t('badges.title')}</span>
            <span className="stat-card-label">{t('profile.earned', { count: badgeCount })}</span>
          </div>
        </button>

        <button
          className="stat-card"
          onClick={handleExportPDF}
          style={{ 
            cursor: 'pointer', 
            textAlign: 'left',
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            border: '2px dashed #3B82F6',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="stat-card-icon" style={{ background: '#3B82F6' }}>
            <Award size={22} color="white" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label" style={{ fontWeight: 800, color: '#1E40AF', fontSize: 'var(--text-base)' }}>{t('common.export_pdf')}</span>
            <span className="stat-card-label" style={{ color: '#1E40AF' }}>{t('common.export_pdf_desc')}</span>
          </div>
        </button>

        <button
          className="stat-card"
          onClick={() => navigate('/timeline')}
          style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #DDD6FE, #A78BFA)' }}>
            <Clock size={22} color="#7C3AED" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label" style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>{t('timeline.title')}</span>
            <span className="stat-card-label">{t('profile.see_journey')}</span>
          </div>
        </button>

        <button
          className="stat-card"
          onClick={() => setShowSettings(true)}
          style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #D1FAE5, #10B981)' }}>
            <Settings size={22} color="#065F46" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label" style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>{t('profile.settings')}</span>
            <span className="stat-card-label">{t('profile.change_name_avatar')}</span>
          </div>
        </button>

        <button
          className="stat-card"
          onClick={handleLogout}
          style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FECDD3, #FB7185)' }}>
            <LogOut size={22} color="#BE123C" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label" style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 'var(--text-base)' }}>{t('profile.sign_out')}</span>
            <span className="stat-card-label">{t('profile.see_you_later')}</span>
          </div>
        </button>
      </div>

      {showSettings && createPortal(
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">{t('profile.settings')} ⚙️</h2>

            <div className="form-group">
              <label className="form-label">{t('profile.language')}</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className={`btn ${i18n.resolvedLanguage === 'en' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => i18n.changeLanguage('en')}
                >
                  🇬🇧 EN
                </button>
                <button
                  className={`btn ${i18n.resolvedLanguage === 'id' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  onClick={() => i18n.changeLanguage('id')}
                >
                  🇮🇩 ID
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile.change_avatar')}</label>
              <div className="avatar-picker">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    className={`avatar-option ${editAvatar === emoji ? 'selected' : ''}`}
                    onClick={() => setEditAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">{t('profile.change_name')}</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={handleSaveSettings}>
              ✨ {t('profile.save')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
