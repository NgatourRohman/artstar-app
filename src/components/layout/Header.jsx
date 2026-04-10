import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { isDemoMode } = useAuth();
  const { profile } = useProfile();
  const { t } = useTranslation();

  const avatar = profile?.avatar_url || '🦄';
  const name = profile?.display_name || 'Little Artist';

  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'dashboard.greeting_morning';
    if (hour >= 11 && hour < 15) return 'dashboard.greeting_afternoon';
    if (hour >= 15 && hour < 19) return 'dashboard.greeting_evening';
    return 'dashboard.greeting';
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-avatar">{avatar}</div>
        <div className="header-greeting">
          <span className="header-greeting-hi">{t(getGreetingKey(), { name: '' }).split(',')[0]}!</span>
          <span className="header-greeting-name">{name}</span>
        </div>
      </div>
      <div className="header-logo">
        <Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
        ArtStar
      </div>
    </header>
  );
}
