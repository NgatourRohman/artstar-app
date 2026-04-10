import { useProfileContext } from '../context/ProfileContext';

export function useProfile() {
  const context = useProfileContext();
  
  // Return the context values to maintain compatibility with existing components
  return {
    profile: context.profile,
    loading: context.loading,
    error: context.error,
    fetchProfile: context.fetchProfile,
    updateProfile: context.updateProfile,
    addXP: context.addXP
  };
}
