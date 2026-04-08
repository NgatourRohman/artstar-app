import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Plus, Share2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { useBadges } from '../hooks/useBadges';
import { useArtworks } from '../hooks/useArtworks';
import { useShare } from '../hooks/useShare';
import ImageUploader from '../components/ui/ImageUploader';
import EmptyState from '../components/ui/EmptyState';
import ConfettiEffect from '../components/ui/ConfettiEffect';

const RESULT_CONFIG = {
  grand_winner: { label: 'Grand Winner', emoji: '👑', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E' },
  winner: { label: 'Winner', emoji: '🏆', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E' },
  finalist: { label: 'Finalist', emoji: '🥈', bg: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', color: '#3730A3' },
  participated: { label: 'Participated', emoji: '⭐', bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', color: '#065F46' },
};

export default function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { competitions, addCompetition, deleteCompetition } = useCompetitions();
  const { artworks } = useArtworks();
  const { checkAndUnlockBadges } = useBadges();
  const { shareUrl, createShareLink, copyToClipboard } = useShare();
  const { t, i18n } = useTranslation();

  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === 'true');
  const [selectedComp, setSelectedComp] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState('participated');
  const [notes, setNotes] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const { data, error } = await addCompetition({
      name, date, result, notes,
      certificateFile: certFile,
    });
    setSaving(false);

    if (!error && data) {
      setShowAddForm(false);
      setName('');
      setDate(new Date().toISOString().split('T')[0]);
      setResult('participated');
      setNotes('');
      setCertFile(null);

      const hasWin = competitions.some(c => c.result === 'winner' || c.result === 'grand_winner') 
        || result === 'winner' || result === 'grand_winner';

      const categories = [...new Set(artworks.map(a => a.category))];

      const newBadges = await checkAndUnlockBadges({
        artworkCount: artworks.length,
        competitionCount: competitions.length + 1,
        hasWin,
        categoryCount: categories.length,
        weeklyArtworkCount: 0,
      });

      if (newBadges.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const handleShare = async (comp) => {
    await createShareLink('competition', comp.id);
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
          {t('competitions.title')} 🏆
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> {t('nav.add')}
        </button>
      </div>

      {/* Competition List */}
      {competitions.length > 0 ? (
        <div className="competitions-list">
          {competitions.map((comp) => {
            const resultConf = RESULT_CONFIG[comp.result] || RESULT_CONFIG.participated;
            return (
              <div
                key={comp.id}
                className="competition-card"
                onClick={() => setSelectedComp(comp)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="competition-result-icon"
                  style={{ background: resultConf.bg }}
                >
                  {resultConf.emoji}
                </div>
                <div className="competition-card-info">
                  <div className="competition-card-name">{comp.name}</div>
                  <div className="competition-card-date">{formatDate(comp.date)}</div>
                </div>
                <span
                  className={`competition-result-badge result-${comp.result}`}
                >
                  {t(`competitions.results.${comp.result}`)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🏆"
          title={t('competitions.empty_title')}
          description={t('competitions.empty_subtitle')}
          action={
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> {t('common.add_competition')}
            </button>
          }
        />
      )}

      {/* Add Competition Modal */}
      {showAddForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">{t('common.add_competition')} 🏆</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="comp-name">{t('common.name')}</label>
                <input
                  id="comp-name"
                  type="text"
                  className="form-input"
                  placeholder={t('common.name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="comp-date">{t('common.date')}</label>
                <input
                  id="comp-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="comp-result">{t('common.result')}</label>
                <select
                  id="comp-result"
                  className="form-select"
                  value={result}
                  onChange={e => setResult(e.target.value)}
                >
                  <option value="participated">⭐ {t('competitions.results.participated')}</option>
                  <option value="finalist">🥈 {t('competitions.results.finalist')}</option>
                  <option value="winner">🏆 {t('competitions.results.winner')}</option>
                  <option value="grand_winner">👑 {t('competitions.results.grand_winner')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="comp-notes">{t('common.description')}</label>
                <textarea
                  id="comp-notes"
                  className="form-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('common.upload_certificate')}</label>
                <ImageUploader
                  onImageSelect={setCertFile}
                  onClear={() => setCertFile(null)}
                />
              </div>

              <button type="submit" className="btn btn-accent btn-block btn-lg" disabled={saving}>
                {saving ? `✨ ${t('common.saving')}` : `🎯 ${t('common.add_competition_btn')}`}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Competition Detail Modal */}
      {selectedComp && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedComp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div className="text-center mb-lg">
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>
                {RESULT_CONFIG[selectedComp.result]?.emoji || '⭐'}
              </div>
              <span className={`competition-result-badge result-${selectedComp.result}`}>
                {t(`competitions.results.${selectedComp.result}`)}
              </span>
            </div>

            <h2 className="detail-title text-center">{selectedComp.name}</h2>
            <div className="detail-meta justify-center">
              <span>📅 {formatDate(selectedComp.date)}</span>
            </div>

            {selectedComp.notes && (
              <p className="detail-description">{selectedComp.notes}</p>
            )}

            {selectedComp.certificate_url && (
              <img
                src={selectedComp.certificate_url}
                alt="Certificate"
                style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }}
              />
            )}

            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => handleShare(selectedComp)}>
                <Share2 size={16} /> {t('common.share')}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  deleteCompetition(selectedComp.id);
                  setSelectedComp(null);
                }}
              >
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Share Modal */}
      {showShareModal && shareUrl && createPortal(
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">{t('common.share_comp_title')}</h2>
            <p className="text-center" style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {t('common.share_comp_desc')}
            </p>
            <div className="share-link-box">
              <input type="text" className="share-link-input" value={shareUrl} readOnly />
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
