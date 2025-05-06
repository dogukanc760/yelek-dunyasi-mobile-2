import {Event} from '../services/eventService';

// Şu anki tarih
const currentDate = new Date();

// Yaklaşan etkinlikler için mock veri
export const upcomingEvents: Event[] = [
  {
    id: '2',
    title: 'Ortaköy Sahil Turu',
    description: 'Doğa ile iç içe keyifli bir yürüyüş deneyimi...',
    type: 'CYCLING',
    scope: 'PUBLIC',
    status: 'ACTIVE',
    location: {
      city: 'İstanbul',
      district: 'Beşiktaş',
      address: 'Ortaköy Meydanı',
      latitude: 41.047226,
      longitude: 29.026861,
    },
    startDate: new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    endDate: new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    ).toISOString(),
    totalDistance: 15.3,
    isManualDistanceCalculation: false,
    capacity: 20,
    participantCount: 12,
    confirmedParticipantCount: 12,
    targetRanks: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clubId: 'club1',
    clubCityId: 'ist1',
    creatorId: 'org2',
    creator: {
      id: 'org2',
      email: 'zeynep.kaya@example.com',
      firstName: 'Zeynep',
      lastName: 'Kaya',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    club: {
      id: 'club1',
      name: 'İstanbul Bisiklet Kulübü',
      description: 'Bisiklet tutkunlarının buluşma noktası',
      logo: 'https://placehold.co/200x200/orange/white?text=İBK',
      cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      type: 'SPORTS',
      status: 'ACTIVE',
      isOfficial: true,
      memberCount: 100,
      isActive: true,
      isFreeForever: false,
      founderId: 'org1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: '3',
    title: 'Bisiklet Bakım Atölyesi',
    description:
      'Bisiklet bakımı hakkında temel bilgiler edinebileceğiniz atölye çalışması. Zincir bakımı, fren ayarları ve lastik değişimi gibi konular ele alınacak.',
    type: 'WORKSHOP',
    scope: 'PUBLIC',
    status: 'ACTIVE',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Kadıköy Bisiklet Evi',
      latitude: 40.991682,
      longitude: 29.026861,
    },
    startDate: new Date(
      currentDate.getTime() + 10 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    endDate: new Date(
      currentDate.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    ).toISOString(),
    totalDistance: 0,
    isManualDistanceCalculation: false,
    capacity: 15,
    participantCount: 8,
    confirmedParticipantCount: 8,
    targetRanks: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clubId: 'club1',
    clubCityId: 'ist1',
    creatorId: 'org1',
    creator: {
      id: 'org1',
      email: 'ahmet.yilmaz@example.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    club: {
      id: 'club1',
      name: 'İstanbul Bisiklet Kulübü',
      description: 'Bisiklet tutkunlarının buluşma noktası',
      logo: 'https://placehold.co/200x200/orange/white?text=İBK',
      cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      type: 'SPORTS',
      status: 'ACTIVE',
      isOfficial: true,
      memberCount: 100,
      isActive: true,
      isFreeForever: false,
      founderId: 'org1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

// Geçmiş etkinlikler için mock veri
export const pastEvents: Event[] = [
  {
    id: '4',
    title: 'Büyükada Turu',
    description:
      'Büyükadada keyifli bir gün geçirmek için düzenlenen bisiklet turu. Adanın etrafını tamamen dolaşacağız.',
    type: 'CYCLING',
    scope: 'PUBLIC',
    status: 'COMPLETED',
    location: {
      city: 'İstanbul',
      district: 'Adalar',
      address: 'Büyükada İskele Meydanı',
      latitude: 40.876721,
      longitude: 29.118269,
    },
    endLocation: {
      city: 'İstanbul',
      district: 'Adalar',
      address: 'Büyükada İskele Meydanı',
      latitude: 40.876721,
      longitude: 29.118269,
    },
    startDate: new Date(
      currentDate.getTime() - 20 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    endDate: new Date(
      currentDate.getTime() - 20 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000,
    ).toISOString(),
    totalDistance: 18.2,
    isManualDistanceCalculation: false,
    capacity: 25,
    participantCount: 22,
    confirmedParticipantCount: 22,
    targetRanks: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clubId: 'club1',
    clubCityId: 'ist1',
    creatorId: 'org1',
    creator: {
      id: 'org1',
      email: 'ahmet.yilmaz@example.com',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    club: {
      id: 'club1',
      name: 'İstanbul Bisiklet Kulübü',
      description: 'Bisiklet tutkunlarının buluşma noktası',
      logo: 'https://placehold.co/200x200/orange/white?text=İBK',
      cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      type: 'SPORTS',
      status: 'ACTIVE',
      isOfficial: true,
      memberCount: 100,
      isActive: true,
      isFreeForever: false,
      founderId: 'org1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    participants: Array.from({length: 22}, (_, i) => ({
      id: `user${i + 60}`,
      userId: `user${i + 60}`,
      eventId: '4',
      firstName: `Katılımcı${i + 60}`,
      lastName: 'Soyad',
      status: 'CONFIRMED',
      joinedAt: new Date().toISOString(),
      profilePicture: `https://randomuser.me/api/portraits/${
        i % 2 === 0 ? 'men' : 'women'
      }/${(i % 10) + 1}.jpg`,
    })),
  },
  {
    id: '5',
    title: 'Yeni Başlayanlar için Bisiklet Eğitimi',
    description:
      'Bisiklete yeni başlayanlar için temel sürüş teknikleri, trafik kuralları ve güvenli sürüş hakkında bilgilendirme eğitimi.',
    type: 'TRAINING',
    scope: 'PUBLIC',
    status: 'COMPLETED',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caddebostan Sahili',
      latitude: 40.962314,
      longitude: 29.056761,
    },
    startDate: new Date(
      currentDate.getTime() - 15 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    endDate: new Date(
      currentDate.getTime() - 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    ).toISOString(),
    totalDistance: 0,
    isManualDistanceCalculation: false,
    capacity: 15,
    participantCount: 12,
    confirmedParticipantCount: 12,
    targetRanks: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clubId: 'club2',
    clubCityId: 'ist1',
    creatorId: 'org3',
    creator: {
      id: 'org3',
      email: 'mehmet.demir@example.com',
      firstName: 'Mehmet',
      lastName: 'Demir',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    club: {
      id: 'club2',
      name: 'Kadıköy Bisiklet Topluluğu',
      description: 'Kadıköy bisiklet severler topluluğu',
      logo: 'https://placehold.co/200x200/purple/white?text=KBT',
      cover: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182',
      type: 'SPORTS',
      status: 'ACTIVE',
      isOfficial: true,
      memberCount: 50,
      isActive: true,
      isFreeForever: false,
      founderId: 'org3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    participants: Array.from({length: 12}, (_, i) => ({
      id: `user${i + 80}`,
      userId: `user${i + 80}`,
      eventId: '5',
      firstName: `Katılımcı${i + 80}`,
      lastName: 'Soyad',
      status: 'CONFIRMED',
      joinedAt: new Date().toISOString(),
      profilePicture: `https://randomuser.me/api/portraits/${
        i % 2 === 0 ? 'men' : 'women'
      }/${(i % 10) + 1}.jpg`,
    })),
  },
];

// Tüm etkinlikleri bir araya getir
export const allEvents: Event[] = [...upcomingEvents, ...pastEvents];

// Verileri takvim görünümü için hazırla
export const calendarEvents = allEvents.reduce((acc, event) => {
  const startDate = event.startDate.split('T')[0]; // Tarih kısmını al (YYYY-MM-DD)

  if (!acc[startDate]) {
    acc[startDate] = [];
  }

  acc[startDate].push(event);
  return acc;
}, {} as Record<string, Event[]>);

export default {
  upcomingEvents,
  pastEvents,
  allEvents,
  calendarEvents,
};
