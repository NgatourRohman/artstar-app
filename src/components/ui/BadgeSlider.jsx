import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const BadgeSlider = ({ badges }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (badges.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % badges.length);
  }, [badges.length]);

  useEffect(() => {
    if (isPaused || badges.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, badges.length, nextSlide]);

  if (!badges || badges.length === 0) return null;

  const currentBadge = badges[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div 
      className="latest-badge-slider-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{ position: 'relative', height: '84px' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="badge-slider-card"
            onClick={() => navigate('/badges')}
          >
            <div className="badge-slider-icon">{currentBadge.icon}</div>
            <div className="badge-slider-info">
              <div className="badge-slider-label">✨ {t('dashboard.latest_badge')}</div>
              <div className="badge-slider-name">{t(currentBadge.name)}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {badges.length > 1 && (
        <div className="badge-slider-dots">
          {badges.map((_, idx) => (
            <div 
              key={idx}
              className={`badge-slider-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeSlider;
