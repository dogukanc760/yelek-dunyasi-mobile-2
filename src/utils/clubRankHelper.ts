export const ClubRank = {
  GENERAL_PRESIDENT: 'general_president',
  GENERAL_COACH: 'general_coach',
  GENERAL_ROAD_CAPTAIN: 'general_road_captain',
  GENERAL_COORDINATOR: 'general_coordinator',
  GENERAL_DISCIPLINE: 'general_discipline',
  GENERAL_TREASURER: 'general_treasurer',
  CITY_PRESIDENT: 'city_president',
  CITY_COACH: 'city_coach',
  CITY_ROAD_CAPTAIN: 'city_road_captain',
  CITY_COORDINATOR: 'city_coordinator',
  CITY_DISCIPLINE: 'city_discipline',
  CITY_TREASURER: 'city_treasurer',
  MEMBER: 'member',
  PROSPECT: 'prospect',
  HANGAROUND: 'hangaround',
} as const;

const rankDescriptions: Record<string, string> = {
  general_president: 'Genel Başkan',
  general_coach: 'Genel Koç',
  general_road_captain: 'Genel Yol Kaptanı',
  general_coordinator: 'Genel Koordinatör',
  general_discipline: 'Genel Disiplin Sorumlusu',
  general_treasurer: 'Genel Sayman',
  city_president: 'Şehir Başkanı',
  city_coach: 'Şehir Koçu',
  city_road_captain: 'Şehir Yol Kaptanı',
  city_coordinator: 'Şehir Koordinatörü',
  city_discipline: 'Şehir Disiplin Sorumlusu',
  city_treasurer: 'Şehir Saymanı',
  member: 'Üye',
  prospect: 'Aday Üye',
  hangaround: 'Misafir Üye',
};

export const getRankDescription = (rank: string): string => {
  const normalizedRank = rank.toLowerCase();
  return rankDescriptions[normalizedRank] || rank;
};
