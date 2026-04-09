import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: 'body',
    titleKey: 'tour.step_welcome_title',
    contentKey: 'tour.step_welcome_content',
    position: 'center'
  },
  {
    id: 'xp',
    target: '.gamification-summary',
    titleKey: 'tour.step_xp_title',
    contentKey: 'tour.step_xp_content',
    position: 'bottom'
  },
  {
    id: 'add',
    target: '#add-button',
    titleKey: 'tour.step_add_title',
    contentKey: 'tour.step_add_content',
    position: 'top'
  },
  {
    id: 'compete',
    target: '[href="/competitions"]',
    titleKey: 'tour.step_compete_title',
    contentKey: 'tour.step_compete_content',
    position: 'top'
  }
];

export default function GuidedTour() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(-1);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('artstar_tour_v2_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setCurrentStep(0), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      if (step.id === 'welcome') {
        setTargetRect({ top: '50%', left: '50%', width: 0, height: 0 });
      } else {
        const el = document.querySelector(step.target);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('artstar_tour_v2_seen', 'true');
    setCurrentStep(-1);
  };

  if (currentStep === -1) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="tour-overlay" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: step.position === 'center' ? 'center' : 'flex-start',
      justifyContent: 'center',
      pointerEvents: 'auto'
    }}>
      {/* Spotlight effect */}
      {targetRect && step.position !== 'center' && (
        <div style={{
          position: 'absolute',
          top: targetRect.top - 10,
          left: targetRect.left - 10,
          width: targetRect.width + 20,
          height: targetRect.height + 20,
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }} />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="tour-card"
        style={{
          background: 'white',
          width: '90%',
          maxWidth: 320,
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-2xl)',
          position: 'relative',
          marginTop: step.position === 'top' ? 'auto' : (step.position === 'bottom' ? 100 : 0),
          marginBottom: step.position === 'top' ? 100 : 0,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}
      >
        <button 
          onClick={handleComplete}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--color-text-tertiary)' }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{t(step.titleKey)}</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {t(step.contentKey)}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {TOUR_STEPS.map((_, i) => (
              <div key={i} style={{ 
                width: 6, height: 6, borderRadius: '50%', 
                background: i === currentStep ? 'var(--color-primary)' : '#E5E7EB' 
              }} />
            ))}
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            style={{ padding: '8px 16px', fontSize: 'var(--text-xs)' }}
          >
            {currentStep === TOUR_STEPS.length - 1 ? t('tour.start') : t('tour.next')} <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
