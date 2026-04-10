import { useTranslation } from 'react-i18next';
import { useBadges } from '../hooks/useBadges';

export default function Badges() {
  const { t } = useTranslation();
  const { getBadgesWithStatus, badgeCount } = useBadges();
  const badges = getBadgesWithStatus();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-enter">
      <div className="text-center mb-lg">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>
          {t('badges.title')} 🏅
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {t('badges.unlocked_count', { unlocked: unlockedCount, total: badges.length })}
        </p>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          maxWidth: 240,
          height: 8,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          margin: '12px auto 0',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(unlockedCount / badges.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-fun-pink))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <div className="badges-container">
        <div className="badges-grid">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge-card ${badge.unlocked ? '' : 'locked'}`}
            >
              {/* Glow effect for unlocked */}
              {badge.unlocked && (
                <div
                  className="badge-card-glow"
                  style={{
                    boxShadow: `inset 0 0 30px ${badge.color}15, 0 0 20px ${badge.color}10`,
                  }}
                />
              )}
              
              <div className="badge-card-icon">
                {badge.unlocked ? badge.icon : '🔒'}
              </div>
              <div className="badge-card-name" style={badge.unlocked ? { color: badge.color } : {}}>
                {badge.unlocked ? t(badge.name) : '???'}
              </div>
              <div className="badge-card-desc">
                {t(badge.description)}
              </div>
              {badge.unlocked ? (
                <div className="badge-card-date">
                  {t('timeline.earned_badge')} {formatDate(badge.unlocked_at)}
                </div>
              ) : (
                <div className="badge-card-locked-label">{t('badges.locked_desc')} 💪</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
