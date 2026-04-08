import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_ARTWORKS, DEMO_COMPETITIONS } from '../lib/demoData';

export default function SharedView() {
  const { shareId } = useParams();
  const [item, setItem] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchSharedItem() {
      if (isDemoMode) {
        // Demo: show a sample artwork
        setItem(DEMO_ARTWORKS[0]);
        setType('artwork');
        setLoading(false);
        return;
      }

      try {
        // Get the share record
        const { data: share, error: shareError } = await supabase
          .from('shares')
          .select('*')
          .eq('id', shareId)
          .single();

        if (shareError) throw new Error(t('common.share_not_found', 'Tautan berbagi tidak ditemukan atau sudah kadaluarsa.'));

        // Fetch the actual item
        const table = share.item_type === 'artwork' ? 'artworks' : 'competitions';
        const { data: itemData, error: itemError } = await supabase
          .from(table)
          .select('*')
          .eq('id', share.item_id)
          .single();

        if (itemError) throw new Error(t('common.item_not_found', 'Karya atau lomba tidak ditemukan. Pastikan sudah diatur ke publik.'));

        setItem(itemData);
        setType(share.item_type);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedItem();
  }, [shareId, t]);

  if (loading) {
    return (
      <div className="shared-view">
        <div className="shared-view-brand">✨ ArtStar</div>
        <div className="text-center" style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>
          🎨
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 16 }}>{t('common.loading', 'Sabar ya, sedang memuat...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-view">
        <div className="shared-view-brand">✨ ArtStar</div>
        <div className="empty-state">
          <div className="empty-state-icon">💫</div>
          <h3 className="empty-state-title">{t('common.oops', 'Waduh!')}</h3>
          <p className="empty-state-desc">{error}</p>
          <a href="/" className="btn btn-primary mt-lg">{t('common.back_home', 'Kembali ke Beranda')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-view">
      <div className="shared-view-brand">✨ ArtStar</div>

      {type === 'artwork' && item && (
        <div style={{ width: '100%' }}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="detail-image"
            />
          ) : (
            <div
              className="detail-image"
              style={{
                background: `linear-gradient(135deg, ${item.color || '#7C3AED'}15, ${item.color || '#7C3AED'}35)`,
                borderRadius: 'var(--radius-xl)',
              }}
            >
              🎨
            </div>
          )}
          <h1 className="detail-title text-center">{item.title}</h1>
          {item.description && (
            <p className="detail-description text-center">{item.description}</p>
          )}
          <div className="text-center" style={{ marginTop: 8 }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              background: '#7C3AED15',
              color: '#7C3AED',
              fontWeight: 700,
            }}>
              {t(`gallery.categories.${item.category}`, item.category)}
            </span>
          </div>
        </div>
      )}

      {type === 'competition' && item && (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>
            {item.result === 'winner' || item.result === 'grand_winner' ? '🏆' : item.result === 'finalist' ? '🥈' : '⭐'}
          </div>
          <h1 className="detail-title">{item.name}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {item.notes && (
            <p className="detail-description">{item.notes}</p>
          )}
          {item.certificate_url && (
            <img
              src={item.certificate_url}
              alt="Certificate"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginTop: 16 }}
            />
          )}
        </div>
      )}

      <div className="text-center mt-xl">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
          Made with ArtStar ⭐
        </p>
        <a href="/" className="btn btn-outline btn-sm">
          {t('common.create_portfolio', 'Create Your Own Portfolio!')}
        </a>
      </div>
    </div>
  );
}
