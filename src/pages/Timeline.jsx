import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useBadges } from '../hooks/useBadges';
import { BADGE_DEFINITIONS } from '../lib/badges';
import EmptyState from '../components/ui/EmptyState';

const TYPE_CONFIG = {
  artwork: {
    color: '#7C3AED',
    emoji: '🎨',
  },
  competition: {
    color: '#F97316',
    emoji: '🏆',
  },
  badge: {
    color: '#EC4899',
    emoji: '🏅',
  },
};

export default function Timeline() {
  const { artworks } = useArtworks();
  const { competitions } = useCompetitions();
  const { userBadges } = useBadges();
  const { t, i18n } = useTranslation();

  const timelineGroups = useMemo(() => {
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

    const groups = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      let groupLabel;
      if (itemDate.getTime() === today.getTime()) {
        groupLabel = i18n.language === 'id' ? 'Hari Ini' : 'Today';
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groupLabel = i18n.language === 'id' ? 'Kemarin' : 'Yesterday';
      } else {
        groupLabel = new Date(item.date).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }

      let group = groups.find(g => g.label === groupLabel);
      if (!group) {
        group = { label: groupLabel, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });

    return groups;
  }, [artworks, competitions, userBadges, i18n.language]);

  if (timelineGroups.length === 0) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    }
  };

  return (
    <div className="page-enter">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="text-center mb-xl"
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
          {t('timeline.title')} 🚀
        </h1>
      </motion.div>

      <motion.div 
        className="timeline"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {timelineGroups.map((group) => (
          <div key={group.label} className="timeline-group">
            <h2 className="timeline-group-header">
              {group.label}
            </h2>
            
            <div className="timeline-items">
              {group.items.map((item) => {
                const config = TYPE_CONFIG[item.type];
                return (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    className="timeline-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="timeline-item-dot"
                      style={{ background: config.color }}
                    />

                    <div className="timeline-item-card">
                      <div className="flex items-center justify-between mb-sm">
                        <div className="flex items-center gap-sm">
                          <span style={{ fontSize: '1.2rem' }}>{item.icon || config.emoji}</span>
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
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                          {new Date(item.date).toLocaleTimeString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="timeline-item-title">
                        {item.type === 'badge' ? t(item.title) : item.title}
                      </div>
                      
                      <div className="timeline-item-subtitle mt-xs" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {item.type === 'artwork' && t(`gallery.categories.${item.subtitle}`)}
                        {item.type === 'competition' && t(`competitions.results.${item.subtitle}`)}
                        {item.type === 'badge' && t(item.subtitle)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
