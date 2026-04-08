import { Palette, Trophy } from 'lucide-react';

export default function AddModal({ onClose, onSelectArtwork, onSelectCompetition }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">What do you want to add? ✨</h2>
        
        <div className="flex flex-col gap-md">
          <button 
            className="stat-card" 
            onClick={onSelectArtwork}
            id="add-artwork-btn"
            style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
          >
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #DDD6FE, #A78BFA)' }}>
              <Palette size={24} color="#7C3AED" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value" style={{ fontSize: '1.2rem' }}>New Artwork</span>
              <span className="stat-card-label">Add a drawing, painting, or creation</span>
            </div>
          </button>

          <button 
            className="stat-card" 
            onClick={onSelectCompetition}
            id="add-competition-btn"
            style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
          >
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #FDE68A, #F59E0B)' }}>
              <Trophy size={24} color="#92400E" />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value" style={{ fontSize: '1.2rem' }}>New Competition</span>
              <span className="stat-card-label">Track a contest or art event</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
