// Demo data for when Supabase is not configured
// This allows the app to run and be visually tested without a backend

export const DEMO_PROFILE = {
  id: 'demo-user-1',
  display_name: 'Little Artist',
  avatar_url: '🦄',
  created_at: '2025-09-01T00:00:00Z',
};

export const DEMO_ARTWORKS = [
  {
    id: 'art-1',
    user_id: 'demo-user-1',
    title: 'Rainbow Dragon',
    description: 'A magical dragon with rainbow wings flying over a castle',
    category: 'drawing',
    image_url: null,
    created_at: '2026-03-15T10:00:00Z',
    uploaded_at: '2026-03-15T10:00:00Z',
    color: '#7C3AED',
  },
  {
    id: 'art-2',
    user_id: 'demo-user-1',
    title: 'Ocean Sunset',
    description: 'Beautiful sunset over the ocean with dolphins',
    category: 'painting',
    image_url: null,
    created_at: '2026-03-20T14:00:00Z',
    uploaded_at: '2026-03-20T14:00:00Z',
    color: '#F97316',
  },
  {
    id: 'art-3',
    user_id: 'demo-user-1',
    title: 'My Pet Cat',
    description: 'A portrait of my fluffy cat Whiskers',
    category: 'drawing',
    image_url: null,
    created_at: '2026-03-25T09:00:00Z',
    uploaded_at: '2026-03-25T09:00:00Z',
    color: '#EC4899',
  },
  {
    id: 'art-4',
    user_id: 'demo-user-1',
    title: 'Space Adventure',
    description: 'Astronaut exploring a new planet with alien friends',
    category: 'digital',
    image_url: null,
    created_at: '2026-04-01T11:00:00Z',
    uploaded_at: '2026-04-01T11:00:00Z',
    color: '#3B82F6',
  },
  {
    id: 'art-5',
    user_id: 'demo-user-1',
    title: 'Flower Garden',
    description: 'A colorful garden full of flowers and butterflies',
    category: 'coloring',
    image_url: null,
    created_at: '2026-04-05T16:00:00Z',
    uploaded_at: '2026-04-05T16:00:00Z',
    color: '#10B981',
  },
];

export const DEMO_COMPETITIONS = [
  {
    id: 'comp-1',
    user_id: 'demo-user-1',
    name: 'School Art Fair 2026',
    date: '2026-03-10',
    result: 'winner',
    certificate_url: null,
    notes: 'Won first place with my rainbow dragon drawing!',
    created_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'comp-2',
    user_id: 'demo-user-1',
    name: 'City Kids Drawing Contest',
    date: '2026-02-14',
    result: 'finalist',
    certificate_url: null,
    notes: 'Made it to the finals — so proud!',
    created_at: '2026-02-14T00:00:00Z',
  },
  {
    id: 'comp-3',
    user_id: 'demo-user-1',
    name: 'Online Coloring Challenge',
    date: '2026-01-20',
    result: 'participated',
    certificate_url: null,
    notes: 'My first ever competition!',
    created_at: '2026-01-20T00:00:00Z',
  },
];

export const DEMO_USER_BADGES = [
  { badge_id: 'first_artwork', unlocked_at: '2026-01-15T10:00:00Z' },
  { badge_id: 'five_artworks', unlocked_at: '2026-04-05T16:00:00Z' },
  { badge_id: 'first_competition', unlocked_at: '2026-01-20T00:00:00Z' },
  { badge_id: 'first_win', unlocked_at: '2026-03-10T00:00:00Z' },
  { badge_id: 'colorful_creator', unlocked_at: '2026-04-01T11:00:00Z' },
];

// Helper to generate demo stats
export function getDemoStats() {
  const artworkCount = DEMO_ARTWORKS.length;
  const competitionCount = DEMO_COMPETITIONS.length;
  const badgeCount = DEMO_USER_BADGES.length;
  const categories = [...new Set(DEMO_ARTWORKS.map(a => a.category))];
  const hasWin = DEMO_COMPETITIONS.some(c => c.result === 'winner' || c.result === 'grand_winner');

  // Check weekly streak
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyArtworkCount = DEMO_ARTWORKS.filter(
    a => new Date(a.created_at) >= oneWeekAgo
  ).length;

  return {
    artworkCount,
    competitionCount,
    badgeCount,
    categoryCount: categories.length,
    hasWin,
    weeklyArtworkCount,
  };
}
