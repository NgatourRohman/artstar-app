import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useBadges } from '../hooks/useBadges';
import { BADGE_DEFINITIONS } from '../lib/badges';
import EmptyState from '../components/ui/EmptyState';

const TYPE_CONFIG = {
  artwork: {
    color: '#7C3AED',
    bg: 'linear-gradient(135deg, #DDD6FE, #A78BFA)',
    emoji: '🎨',
    label: 'Artwork',
  },
  competition: {
    color: '#F97316',
    bg: 'linear-gradient(135deg, #FDE68A, #F59E0B)',
    emoji: '🏆',
    label: 'Competition',
  },
  badge: {
    color: '#EC4899',
    bg: 'linear-gradient(135deg, #FECDD3, #FB7185)',
    emoji: '🏅',
    label: 'Badge',
  },
};

export default function Timeline() {
  const { artworks } = useArtworks();
  const { competitions } = useCompetitions();
  const { userBadges } = useBadges();
  const { t } = useTranslation();

  const timelineItems = useMemo(() => {
    const items = [];

    artworks.forEach(a => items.push({
      id: a.id,
      type: 'artwork',
      title: a.title,
      subtitle: a.category,
      date: a.created_at,
    }));

    competitions.forEach(c => items.push({
      id: c.id,
      type: 'competition',
      title: c.name,
      subtitle: c.result,
      date: c.date || c.created_at,
    }));

    userBadges.forEach(ub => {
      const badge = BADGE_DEFINITIONS.find(b => b.id === ub.badge_id);
      if (badge) {
        items.push({
          id: ub.badge_id,
          type: 'badge',
          title: badge.name,
          subtitle: badge.description,
          date: ub.unlocked_at,
          icon: badge.icon,
        });
      }
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  }, [artworks, competitions, userBadges]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (timelineItems.length === 0) {
    return (
      <div className="page-enter">
        <EmptyState
          icon="📅"
          title={t('timeline.empty_title')}
          description={t('timeline.empty_subtitle')}
        />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <h1 className="text-center mb-lg" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)' }}>
        {t('timeline.title')} 🚀
      </h1>

      <div className="timeline">
        {timelineItems.map((item, index) => {
          const config = TYPE_CONFIG[item.type];
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="timeline-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="timeline-item-dot"
                style={{ background: config.bg }}
              >
                {item.icon || config.emoji}
              </div>

              <div className="timeline-item-date">{formatDate(item.date)}</div>

              <div className="timeline-item-card" style={{ borderLeft: `3px solid ${config.color}` }}>
                <div className="flex items-center gap-sm">
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: `${config.color}15`,
                    color: config.color,
                  }}>
                    {t(`timeline.type.${item.type}`)}
                  </span>
                </div>
                <div className="timeline-item-title mt-sm">
                  {item.type === 'badge' ? t(item.title) : item.title}
                </div>
                <div className="timeline-item-subtitle">
                  {item.type === 'artwork' && t(`gallery.categories.${item.subtitle}`)}
                  {item.type === 'competition' && t(`competitions.results.${item.subtitle}`)}
                  {item.type === 'badge' && t(item.subtitle)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
