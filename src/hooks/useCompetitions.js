import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_COMPETITIONS } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';
import { extractFilePath } from '../lib/storageUtils';
import { compressImage } from '../lib/imageUtils';
import { useNotifications } from '../context/NotificationContext';

export function useCompetitions() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [competitions, setCompetitions] = useState(isDemoMode ? DEMO_COMPETITIONS : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);

  const fetchCompetitions = useCallback(async () => {
    if (isDemoMode) {
      setCompetitions(DEMO_COMPETITIONS);
      return;
    }

    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('competitions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (err) throw err;
      setCompetitions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addCompetition = useCallback(async ({ name, date, result, notes, certificateFile }) => {
    if (isDemoMode) {
      const newComp = {
        id: `comp-${Date.now()}`,
        user_id: 'demo-user-1',
        name,
        date,
        result,
        notes,
        certificate_url: certificateFile ? URL.createObjectURL(certificateFile) : null,
        created_at: new Date().toISOString(),
      };
      setCompetitions(prev => [newComp, ...prev]);
      return { data: newComp, error: null };
    }

    try {
      let certificate_url = null;
      if (certificateFile) {
        const compressedFile = await compressImage(certificateFile);
        
        const filePath = `${user.id}/${Date.now()}_${certificateFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(filePath, compressedFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('certificates')
          .getPublicUrl(filePath);
        certificate_url = publicUrl;
      }

      const { data, error: err } = await supabase
        .from('competitions')
        .insert({
          user_id: user.id,
          name,
          date,
          result,
          notes,
          certificate_url,
        })
        .select()
        .single();

      if (err) throw err;
      setCompetitions(prev => [data, ...prev]);
      showSuccess('Competition record added! 🏆');
      return { data, error: null };
    } catch (err) {
      showError(`Failed to add competition: ${err.message}`);
      return { data: null, error: err.message };
    }
  }, [user, showSuccess, showError]);

  const deleteCompetition = useCallback(async (id) => {
    if (isDemoMode) {
      setCompetitions(prev => prev.filter(c => c.id !== id));
      return;
    }

    try {
      const { data: comp } = await supabase
        .from('competitions')
        .select('certificate_url')
        .eq('id', id)
        .single();

      if (comp?.certificate_url) {
        const filePath = extractFilePath(comp.certificate_url, 'certificates');
        if (filePath) {
          console.debug(`Attempting to remove certificate file: ${filePath}`);
          const { error: storageError } = await supabase.storage.from('certificates').remove([filePath]);
          if (storageError) {
            console.error('SUPABASE STORAGE ERROR (Certificates):', storageError);
            showError(`Could not delete certificate from storage (Error: ${storageError.message}).`);
          } else {
            console.debug('Successfully removed certificate from storage');
          }
        } else {
          console.warn('Could not extract certificate path from URL:', comp.certificate_url);
        }
      }

      const { error: err } = await supabase.from('competitions').delete().eq('id', id);
      if (err) throw err;

      setCompetitions(prev => prev.filter(c => c.id !== id));
      showSuccess('Competition deleted');
    } catch (err) {
      console.error('Error deleting competition:', err);
      showError(`Failed to delete competition: ${err.message}`);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  return { competitions, loading, error, fetchCompetitions, addCompetition, deleteCompetition };
}
