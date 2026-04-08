import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILE } from '../../lib/demoData';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const { user, isDemoMode } = useAuth();
  const profile = isDemoMode ? DEMO_PROFILE : user;
  const avatar = profile?.avatar_url || profile?.user_metadata?.avatar_url || '🦄';
  const name = profile?.display_name || profile?.user_metadata?.display_name || 'Little Artist';

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-avatar">{avatar}</div>
        <div className="header-greeting">
          <span className="header-greeting-hi">Hello!</span>
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
