export const BADGE_DEFINITIONS = [
  {
    id: 'first_artwork',
    name: 'badges.list.first_artwork.name',
    description: 'badges.list.first_artwork.desc',
    icon: '🎨',
    requirement_type: 'artwork_count',
    requirement_value: 1,
    color: '#7C3AED',
  },
  {
    id: 'five_artworks',
    name: 'badges.list.five_artworks.name',
    description: 'badges.list.five_artworks.desc',
    icon: '🖼️',
    requirement_type: 'artwork_count',
    requirement_value: 5,
    color: '#3B82F6',
  },
  {
    id: 'ten_artworks',
    name: 'badges.list.ten_artworks.name',
    description: 'badges.list.ten_artworks.desc',
    icon: '⭐',
    requirement_type: 'artwork_count',
    requirement_value: 10,
    color: '#F59E0B',
  },
  {
    id: 'first_competition',
    name: 'badges.list.first_competition.name',
    description: 'badges.list.first_competition.desc',
    icon: '🏅',
    requirement_type: 'competition_count',
    requirement_value: 1,
    color: '#10B981',
  },
  {
    id: 'first_win',
    name: 'badges.list.first_win.name',
    description: 'badges.list.first_win.desc',
    icon: '🏆',
    requirement_type: 'first_win',
    requirement_value: 1,
    color: '#F97316',
  },
  {
    id: 'five_competitions',
    name: 'badges.list.five_competitions.name',
    description: 'badges.list.five_competitions.desc',
    icon: '🎯',
    requirement_type: 'competition_count',
    requirement_value: 5,
    color: '#EC4899',
  },
  {
    id: 'colorful_creator',
    name: 'badges.list.colorful_creator.name',
    description: 'badges.list.colorful_creator.desc',
    icon: '🌈',
    requirement_type: 'category_count',
    requirement_value: 3,
    color: '#14B8A6',
  },
  {
    id: 'streak_3',
    name: 'badges.list.streak_3.name',
    description: 'badges.list.streak_3.desc',
    icon: '🔥',
    requirement_type: 'weekly_streak',
    requirement_value: 3,
    color: '#EF4444',
  },
];

export function checkBadgeEligibility(badgeDef, stats) {
  switch (badgeDef.requirement_type) {
    case 'artwork_count':
      return stats.artworkCount >= badgeDef.requirement_value;
    case 'competition_count':
      return stats.competitionCount >= badgeDef.requirement_value;
    case 'first_win':
      return stats.hasWin;
    case 'category_count':
      return stats.categoryCount >= badgeDef.requirement_value;
    case 'weekly_streak':
      return stats.weeklyArtworkCount >= badgeDef.requirement_value;
    default:
      return false;
  }
}
