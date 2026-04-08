import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_ARTWORKS } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';

export function useArtworks() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState(isDemoMode ? DEMO_ARTWORKS : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);

  const fetchArtworks = useCallback(async (category = null) => {
    if (isDemoMode) {
      if (category && category !== 'all') {
        setArtworks(DEMO_ARTWORKS.filter(a => a.category === category));
      } else {
        setArtworks(DEMO_ARTWORKS);
      }
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setArtworks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addArtwork = useCallback(async ({ title, description, category, imageFile }) => {
    if (isDemoMode) {
      const newArt = {
        id: `art-${Date.now()}`,
        user_id: 'demo-user-1',
        title,
        description,
        category,
        image_url: imageFile ? URL.createObjectURL(imageFile) : null,
        created_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
        color: ['#7C3AED', '#F97316', '#EC4899', '#3B82F6', '#10B981'][Math.floor(Math.random() * 5)],
      };
      setArtworks(prev => [newArt, ...prev]);
      return { data: newArt, error: null };
    }

    try {
      let image_url = null;
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('artworks')
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(filePath);
        image_url = publicUrl;
      }

      const { data, error: err } = await supabase
        .from('artworks')
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          image_url,
        })
        .select()
        .single();

      if (err) throw err;
      setArtworks(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  }, [user]);

  const deleteArtwork = useCallback(async (id) => {
    if (isDemoMode) {
      setArtworks(prev => prev.filter(a => a.id !== id));
      return;
    }

    await supabase.from('artworks').delete().eq('id', id);
    setArtworks(prev => prev.filter(a => a.id !== id));
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  return { artworks, loading, error, fetchArtworks, addArtwork, deleteArtwork };
}
