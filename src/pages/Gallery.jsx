import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Plus, Share2, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useArtworks } from '../hooks/useArtworks';
import { useCompetitions } from '../hooks/useCompetitions';
import { useProfile } from '../hooks/useProfile';
import { useBadges } from '../hooks/useBadges';
import { useShare } from '../hooks/useShare';
import ImageUploader from '../components/ui/ImageUploader';
import EmptyState from '../components/ui/EmptyState';
import ConfettiEffect from '../components/ui/ConfettiEffect';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'drawing', label: 'Drawing', emoji: '✏️' },
  { id: 'painting', label: 'Painting', emoji: '🎨' },
  { id: 'coloring', label: 'Coloring', emoji: '🖍️' },
  { id: 'digital', label: 'Digital', emoji: '💻' },
  { id: 'craft', label: 'Craft', emoji: '✂️' },
  { id: 'other', label: 'Other', emoji: '🎭' },
];

const CATEGORY_COLORS = {
  drawing: '#7C3AED',
  painting: '#F97316',
  coloring: '#EC4899',
  digital: '#3B82F6',
  craft: '#10B981',
  other: '#6366F1',
};

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { artworks, fetchArtworks, addArtwork, deleteArtwork } = useArtworks();
  const { competitions } = useCompetitions();
  const { profile, addXP } = useProfile();
  const { checkAndUnlockBadges, newlyUnlocked, clearNewlyUnlocked } = useBadges();
  const { shareUrl, createShareLink, copyToClipboard } = useShare();
  const { t, i18n } = useTranslation();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('drawing');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState('');
  const [tools, setTools] = useState('');
  const [purpose, setPurpose] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchArtworks(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSaving(true);
    const { data, error } = await addArtwork({ 
      title, description, category, imageFile, date, 
      location, tools, purpose, competition_id: competitionId 
    });
    setSaving(false);

    if (!error && data) {
      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setCategory('drawing');
      setImageFile(null);
      setLocation('');
      setTools('');
      setPurpose('');
      setCompetitionId('');

      // Add XP for uploading artwork
      await addXP(10);

      const categories = [...new Set(artworks.map(a => a.category).concat(category))];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCount = artworks.filter(a => new Date(a.created_at) >= oneWeekAgo).length + 1;
      
      const newBadges = await checkAndUnlockBadges({
        artworkCount: artworks.length + 1,
        competitionCount: 0,
        hasWin: false,
        categoryCount: categories.length,
        weeklyArtworkCount: weeklyCount,
      });

      if (newBadges.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const handleShare = async (artwork) => {
    await createShareLink('artwork', artwork.id);
    setShowShareModal(true);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page-enter">
      <ConfettiEffect active={showConfetti} />

      <div className="section-header">
        <h1 className="section-title" style={{ fontSize: 'var(--text-2xl)' }}>
          {t('gallery.title')} 🖼️
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> {t('nav.add')}
        </button>
      </div>

      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-filter ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.emoji} {cat.id === 'all' ? t('gallery.all') : t(`gallery.categories.${cat.id}`)}
          </button>
        ))}
      </div>

      {artworks.length > 0 ? (
        <div className="gallery-grid">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="artwork-card"
              onClick={() => setSelectedArtwork(artwork)}
            >
              {artwork.image_url ? (
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="artwork-card-image"
                />
              ) : (
                <div
                  className="artwork-card-placeholder"
                  style={{
                    background: `linear-gradient(135deg, ${artwork.color || CATEGORY_COLORS[artwork.category] || '#7C3AED'}15, ${artwork.color || CATEGORY_COLORS[artwork.category] || '#7C3AED'}35)`,
                    color: artwork.color || CATEGORY_COLORS[artwork.category] || '#7C3AED',
                  }}
                >
                  {CATEGORIES.find(c => c.id === artwork.category)?.emoji || '🎨'}
                </div>
              )}
              <div className="artwork-card-info">
                <div className="artwork-card-title">{artwork.title}</div>
                <div className="artwork-card-meta">
                  <span
                    className="artwork-card-category"
                    style={{
                      background: `${CATEGORY_COLORS[artwork.category] || '#7C3AED'}18`,
                      color: CATEGORY_COLORS[artwork.category] || '#7C3AED',
                    }}
                  >
                    {CATEGORIES.find(c => c.id === artwork.category)?.emoji} {t(`gallery.categories.${artwork.category}`)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎨"
          title={t('gallery.empty_title')}
          description={t('gallery.empty_subtitle')}
          action={
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> {t('common.add_artwork')}
            </button>
          }
        />
      )}

      {showAddForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">{t('common.add_artwork')} 🎨</h2>

            <form onSubmit={handleSubmit}>
              <ImageUploader
                onImageSelect={setImageFile}
                onClear={() => setImageFile(null)}
              />

              <div className="form-group mt-md">
                <label className="form-label" htmlFor="art-title">{t('common.title')}</label>
                <input
                  id="art-title"
                  type="text"
                  className="form-input"
                  placeholder={t('common.title')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art-date">{t('common.date')}</label>
                <input
                  id="art-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art-category">{t('common.category')}</label>
                <select
                  id="art-category"
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {t(`gallery.categories.${cat.id}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art-desc">{t('common.description')}</label>
                <textarea
                  id="art-desc"
                  className="form-textarea"
                  placeholder={t('common.description')}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="art-location">📍 {t('gallery.place_label')}</label>
                  <input
                    id="art-location"
                    type="text"
                    className="form-input"
                    placeholder={t('gallery.place_placeholder')}
                value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="art-tools">🖌️ {t('gallery.tools_label')}</label>
                  <input
                    id="art-tools"
                    type="text"
                    className="form-input"
                    placeholder={t('gallery.tools_placeholder')}
                value={tools}
                    onChange={e => setTools(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art-purpose">🎯 {t('gallery.purpose_label')}</label>
                <input
                  id="art-purpose"
                  type="text"
                  className="form-input"
                  placeholder={t('gallery.purpose_placeholder')}
              value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="art-comp">🏆 {t('common.link_competition')}</label>
                <select
                  id="art-comp"
                  className="form-select"
                  value={competitionId}
                  onChange={e => setCompetitionId(e.target.value)}
                >
                  <option value="">-- {t('common.none')} --</option>
                  {competitions.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={saving}>
                {saving ? `✨ ${t('common.saving')}` : `🚀 ${t('common.add_to_gallery')}`}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedArtwork && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedArtwork(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            {selectedArtwork.image_url ? (
              <img
                src={selectedArtwork.image_url}
                alt={selectedArtwork.title}
                className="detail-image"
              />
            ) : (
              <div
                className="detail-image"
                style={{
                  background: `linear-gradient(135deg, ${selectedArtwork.color || '#7C3AED'}15, ${selectedArtwork.color || '#7C3AED'}35)`,
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                {CATEGORIES.find(c => c.id === selectedArtwork.category)?.emoji || '🎨'}
              </div>
            )}

            <h2 className="detail-title">{selectedArtwork.title}</h2>
            <div className="detail-meta">
              <span
                className="artwork-card-category"
                style={{
                  background: `${CATEGORY_COLORS[selectedArtwork.category] || '#7C3AED'}18`,
                  color: CATEGORY_COLORS[selectedArtwork.category] || '#7C3AED',
                }}
              >
                {CATEGORIES.find(c => c.id === selectedArtwork.category)?.emoji} {t(`gallery.categories.${selectedArtwork.category}`)}
              </span>
              <span>{formatDate(selectedArtwork.date || selectedArtwork.created_at)}</span>
            </div>

            {selectedArtwork.description && (
              <p className="detail-description">{selectedArtwork.description}</p>
            )}

            <div className="detail-info-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'var(--space-md)',
              background: 'var(--color-bg-secondary)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-lg)'
            }}>
              {selectedArtwork.location && (
                <div className="detail-info-item">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>📍 {t('common.place').toUpperCase()}</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{selectedArtwork.location}</div>
                </div>
              )}
              {selectedArtwork.tools && (
                <div className="detail-info-item">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>🖌️ {t('common.tools').toUpperCase()}</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{selectedArtwork.tools}</div>
                </div>
              )}
              {selectedArtwork.purpose && (
                <div className="detail-info-item" style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>🎯 {t('common.purpose').toUpperCase()}</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{selectedArtwork.purpose}</div>
                </div>
              )}
              {selectedArtwork.competition_id && (
                <div className="detail-info-item" style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>🏆 {t('common.link_competition').toUpperCase()}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 700 }}>
                    {competitions.find(c => c.id === selectedArtwork.competition_id)?.name || 'Memuat lomba...'}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => handleShare(selectedArtwork)}>
                <Share2 size={16} /> {t('common.share')}
              </button>
              <button 
                className="btn btn-ghost" 
                onClick={() => {
                  deleteArtwork(selectedArtwork.id);
                  setSelectedArtwork(null);
                }}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showShareModal && shareUrl && createPortal(
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">{t('common.share_art_title')}</h2>
            <p className="text-center" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {t('common.share_art_desc')}
            </p>
            <div className="share-link-box">
              <input
                type="text"
                className="share-link-input"
                value={shareUrl}
                readOnly
              />
              <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                {copied ? `✅ ${t('common.copied')}` : '📋'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
