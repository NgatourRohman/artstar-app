import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import { DEMO_COMPETITIONS } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';

export function useCompetitions() {
  const { user } = useAuth();
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
        const filePath = `${user.id}/${Date.now()}_${certificateFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(filePath, certificateFile);
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
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  }, [user]);

  const deleteCompetition = useCallback(async (id) => {
    if (isDemoMode) {
      setCompetitions(prev => prev.filter(c => c.id !== id));
      return;
    }

    await supabase.from('competitions').delete().eq('id', id);
    setCompetitions(prev => prev.filter(c => c.id !== id));
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  return { competitions, loading, error, fetchCompetitions, addCompetition, deleteCompetition };
}
