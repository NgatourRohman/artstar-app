import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Plus, Share2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { useProfile } from '../hooks/useProfile';
import { useArtworks } from '../hooks/useArtworks';
import { useBadges } from '../hooks/useBadges';
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

const STATUS_CONFIG = {
  registered: { label: 'registered', emoji: '📝', color: '#6B7280', bg: '#F3F4F6' },
  selection: { label: 'selection', emoji: '🔍', color: '#2563EB', bg: '#DBEAFE' },
  final: { label: 'final', emoji: '🔥', color: '#D97706', bg: '#FEF3C7' },
  results: { label: 'results', emoji: '🏁', color: '#059669', bg: '#D1FAE5' },
};

export default function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { competitions, addCompetition, updateCompetition, deleteCompetition } = useCompetitions();
  const { artworks } = useArtworks();
  const { profile, addXP } = useProfile();
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
  const [status, setStatus] = useState('registered');
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
      name, date, result, status, notes,
      certificateFile: certFile,
    });
    setSaving(false);

    if (!error && data) {
      setShowAddForm(false);
      setName('');
      setDate(new Date().toISOString().split('T')[0]);
      setResult('participated');
      setStatus('registered');
      setNotes('');
      setCertFile(null);

      // Add XP for registering
      await addXP(20);

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

  const handleUpdateStatus = async (status) => {
    if (!selectedComp) return;
    const { data } = await updateCompetition(selectedComp.id, { status });
    if (data) {
      setSelectedComp(data);
      if (status === 'selection' || status === 'final') {
        await addXP(40);
      } else if (status === 'results') {
        // results status handled by handleUpdateResult
      }
    }
  };

  const handleUpdateResult = async (result) => {
    if (!selectedComp) return;
    const { data } = await updateCompetition(selectedComp.id, { result, status: 'results' });
    if (data) {
      setSelectedComp(data);
      if (result === 'winner' || result === 'grand_winner') {
        await addXP(100);
      }
    }
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
                {/* 1. LeftColumn: Icon */}
                <div
                  className="competition-result-icon"
                  style={{ background: resultConf.bg }}
                >
                  {resultConf.emoji}
                </div>

                {/* 2. MiddleColumn: Content Info */}
                <div className="competition-card-info">
                  <div className="competition-card-name">
                    {comp.name}
                  </div>
                  <div className="competition-card-meta">
                    <span className="competition-status-tag" style={{ 
                      background: STATUS_CONFIG[comp.status]?.bg || '#F3F4F6',
                      color: STATUS_CONFIG[comp.status]?.color || '#6B7280',
                    }}>
                      {t(`competitions.status.${comp.status}`).toUpperCase()}
                    </span>
                    <span className="competition-card-date">{formatDate(comp.date)}</span>
                  </div>
                </div>

                {/* 3. RightColumn: Result Badge */}
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
                <label className="form-label" htmlFor="comp-name">{t('competitions.name_label')}</label>
                <input
                  id="comp-name"
                  type="text"
                  className="form-input"
                  placeholder={t('competitions.name_placeholder')}
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
                <label className="form-label" htmlFor="comp-status">📈 {t('competitions.status_label')}</label>
                <select
                  id="comp-status"
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="registered">📝 {t('competitions.status.registered')}</option>
                  <option value="selection">🔍 {t('competitions.status.selection')}</option>
                  <option value="final">🔥 {t('competitions.status.final')}</option>
                  <option value="results">🏁 {t('competitions.status.results')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="comp-notes">{t('competitions.notes_label')}</label>
                <textarea
                  id="comp-notes"
                  className="form-textarea"
                  placeholder={t('competitions.notes_placeholder')}
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

            <div className="status-update-controls" style={{ 
              background: 'var(--color-bg-tertiary)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-lg)'
            }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
                {t('competitions.update_status')}
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleUpdateStatus(key)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      border: 'none',
                      background: selectedComp.status === key ? cfg.color : 'white',
                      color: selectedComp.status === key ? 'white' : 'var(--color-text)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {cfg.emoji} {t(`competitions.status.${key}`)}
                  </button>
                ))}
              </div>

              {selectedComp.status === 'results' && (
                <>
                  <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-tertiary)', marginTop: 16, marginBottom: 8 }}>
                    {t('competitions.final_result')}
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(RESULT_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleUpdateResult(key)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '12px',
                          border: 'none',
                          background: selectedComp.result === key ? '#92400E' : 'white',
                          color: selectedComp.result === key ? 'white' : 'var(--color-text)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {cfg.emoji} {t(`competitions.results.${key}`)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="linked-artworks" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                🖼️ {t('competitions.linked_artworks')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                {artworks.filter(a => a.competition_id === selectedComp.id).map(art => (
                  <div key={art.id} style={{ 
                    position: 'relative', 
                    borderRadius: 'var(--radius-md)', 
                    overflow: 'hidden',
                    aspectRatio: '1',
                    background: 'var(--color-bg-tertiary)'
                  }}>
                    <img src={art.image_url} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      padding: '4px 8px', 
                      background: 'rgba(0,0,0,0.5)', 
                      color: 'white', 
                      fontSize: '10px' 
                    }}>
                      {art.title}
                    </div>
                  </div>
                ))}
                {artworks.filter(a => a.competition_id === selectedComp.id).length === 0 && (
                  <div style={{ 
                    gridColumn: 'span 2', 
                    padding: 'var(--space-md)', 
                    textAlign: 'center', 
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {t('competitions.no_linked_artworks')}
                  </div>
                )}
              </div>
            </div>

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
