import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Image, Trophy, User, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddModal from '../../components/ui/AddModal';

export default function BottomNav() {
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <nav className="bottom-nav" id="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <span className="nav-item-icon"><Home size={22} /></span>
          <span className="nav-item-label">{t('nav.home')}</span>
        </NavLink>

        <NavLink to="/gallery" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-item-icon"><Image size={22} /></span>
          <span className="nav-item-label">{t('nav.gallery')}</span>
        </NavLink>

        <div className="nav-item nav-item-fab">
          <button className="nav-fab-btn" onClick={() => setShowAdd(true)} id="add-button" aria-label="Add new">
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>

        <NavLink to="/competitions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-item-icon"><Trophy size={22} /></span>
          <span className="nav-item-label">{t('nav.compete')}</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-item-icon"><User size={22} /></span>
          <span className="nav-item-label">{t('nav.me')}</span>
        </NavLink>
      </nav>

      {showAdd && (
        <AddModal 
          onClose={() => setShowAdd(false)} 
          onSelectArtwork={() => { setShowAdd(false); navigate('/gallery?add=true'); }}
          onSelectCompetition={() => { setShowAdd(false); navigate('/competitions?add=true'); }}
        />
      )}
    </>
  );
}
