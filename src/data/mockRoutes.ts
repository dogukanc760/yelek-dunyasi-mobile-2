import {Route} from '../types/route';
import {PopularRoute} from '../types/route';

// Şu anki tarih
const now = new Date();

// Popüler rotalar için mock veri
export const mockPopularRoutes: Route[] = [
  {
    id: '1',
    name: 'Belgrad Ormanı Turu',
    description:
      "İstanbul'un en popüler doğa rotalarından biri olan Belgrad Ormanı, yemyeşil ağaçlar arasında keyifli bir bisiklet deneyimi sunar. Hafta sonları özellikle kalabalık olabilir.",
    imageUrl: 'https://picsum.photos/800/500',
    distance: 15.5,
    elevation: 320,
    estimatedDuration: 110, // dakika cinsinden
    difficulty: 'MEDIUM',
    type: 'CYCLING',
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2023-04-22').toISOString(),
    createdBy: 'user123',
    city: 'İstanbul',
    district: 'Sarıyer',
    isPublic: true,
    isFavorite: false,
    rating: 4.7,
    ratingCount: 142,
    popularity: 9.2,
    startPoint: {
      latitude: 41.1811,
      longitude: 28.9898,
    },
    endPoint: {
      latitude: 41.1836,
      longitude: 29.0143,
    },
    waypoints: [
      {latitude: 41.1822, longitude: 28.9975},
      {latitude: 41.1789, longitude: 29.0032},
      {latitude: 41.1804, longitude: 29.0098},
    ],
    tags: ['doğa', 'orman', 'mtb'],
    surface: 'MIXED',
    routeData: {
      origin: {
        latitude: 41.1811,
        longitude: 28.9898,
      },
      destination: {
        latitude: 41.1836,
        longitude: 29.0143,
      },
      waypoints: [
        {latitude: 41.1822, longitude: 28.9975},
        {latitude: 41.1789, longitude: 29.0032},
        {latitude: 41.1804, longitude: 29.0098},
      ],
      mode: 'CYCLING',
    },
  },
  {
    id: '2',
    name: 'Kadıköy - Üsküdar Sahil Yolu',
    description:
      'Kadıköy ve Üsküdar arasındaki sahil yolu, deniz manzarası eşliğinde rahat bir sürüş sunar. Hafif eğimli ve asfalt yol, her seviyeden bisikletçi için uygundur.',
    imageUrl: 'https://picsum.photos/800/500',
    distance: 8.3,
    elevation: 45,
    estimatedDuration: 40,
    difficulty: 'EASY',
    type: 'CYCLING',
    createdAt: new Date('2023-02-05').toISOString(),
    updatedAt: new Date('2023-05-18').toISOString(),
    createdBy: 'user456',
    city: 'İstanbul',
    district: 'Kadıköy',
    isPublic: true,
    isFavorite: true,
    rating: 4.8,
    ratingCount: 214,
    popularity: 9.6,
    startPoint: {
      latitude: 40.9909,
      longitude: 29.0231,
    },
    endPoint: {
      latitude: 41.0228,
      longitude: 29.0158,
    },
    waypoints: [
      {latitude: 41.0012, longitude: 29.0207},
      {latitude: 41.012, longitude: 29.0175},
    ],
    tags: ['sahil', 'deniz', 'asfalt'],
    surface: 'PAVED',
    routeData: {
      origin: {
        latitude: 40.9909,
        longitude: 29.0231,
      },
      destination: {
        latitude: 41.0228,
        longitude: 29.0158,
      },
      waypoints: [
        {latitude: 41.0012, longitude: 29.0207},
        {latitude: 41.012, longitude: 29.0175},
      ],
      mode: 'CYCLING',
    },
  },
  {
    id: '3',
    name: 'Polonezköy - Riva Rotası',
    description:
      "İstanbul'un sakin kuzey ormanlarını keşfedin. Polonezköy'den başlayıp Riva'ya uzanan bu zorlu rota, teknik sürüş sevenler için ideal. Bol iniş çıkışlı ve yer yer patika yollar içerir.",
    imageUrl: 'https://picsum.photos/800/500',
    distance: 22.7,
    elevation: 580,
    estimatedDuration: 180,
    difficulty: 'HARD',
    type: 'MOUNTAIN_BIKING',
    createdAt: new Date('2023-01-28').toISOString(),
    updatedAt: new Date('2023-06-10').toISOString(),
    createdBy: 'user789',
    city: 'İstanbul',
    district: 'Beykoz',
    isPublic: true,
    isFavorite: false,
    rating: 4.9,
    ratingCount: 98,
    popularity: 8.5,
    startPoint: {
      latitude: 41.1173,
      longitude: 29.1961,
    },
    endPoint: {
      latitude: 41.2173,
      longitude: 29.2266,
    },
    waypoints: [
      {latitude: 41.135, longitude: 29.2033},
      {latitude: 41.168, longitude: 29.21},
      {latitude: 41.195, longitude: 29.2189},
    ],
    tags: ['orman', 'mtb', 'macera', 'zorlu'],
    surface: 'UNPAVED',
    routeData: {
      origin: {
        latitude: 41.1173,
        longitude: 29.1961,
      },
      destination: {
        latitude: 41.2173,
        longitude: 29.2266,
      },
      waypoints: [
        {latitude: 41.135, longitude: 29.2033},
        {latitude: 41.168, longitude: 29.21},
        {latitude: 41.195, longitude: 29.2189},
      ],
      mode: 'WALKING',
    },
  },
  {
    id: '4',
    name: 'Adalar Turu',
    description:
      "Büyükada ve Heybeliada'yı dolaşan keyifli bir tur. Tarihi köşkler, çam ormanları ve deniz manzarasıyla İstanbul'un eşsiz adalarını keşfedin.",
    imageUrl: 'https://picsum.photos/800/500',
    distance: 28.6,
    elevation: 390,
    estimatedDuration: 150,
    difficulty: 'MEDIUM',
    type: 'CYCLING',
    createdAt: new Date('2023-03-12').toISOString(),
    updatedAt: new Date('2023-05-28').toISOString(),
    createdBy: 'user012',
    city: 'İstanbul',
    district: 'Adalar',
    isPublic: true,
    isFavorite: true,
    rating: 4.7,
    ratingCount: 186,
    popularity: 9.0,
    startPoint: {
      latitude: 40.8758,
      longitude: 29.119,
    },
    endPoint: {
      latitude: 40.8731,
      longitude: 29.1209,
    },
    waypoints: [
      {latitude: 40.8775, longitude: 29.0913},
      {latitude: 40.8733, longitude: 29.0873},
      {latitude: 40.8865, longitude: 29.1005},
      {latitude: 40.8777, longitude: 29.1175},
    ],
    tags: ['adalar', 'deniz', 'tarihi', 'turistik'],
    surface: 'PAVED',
    routeData: {
      origin: {
        latitude: 40.8758,
        longitude: 29.119,
      },
      destination: {
        latitude: 40.8731,
        longitude: 29.1209,
      },
      waypoints: [
        {latitude: 40.8775, longitude: 29.0913},
        {latitude: 40.8733, longitude: 29.0873},
        {latitude: 40.8865, longitude: 29.1005},
        {latitude: 40.8777, longitude: 29.1175},
      ],
      mode: 'CYCLING',
    },
  },
  {
    id: '5',
    name: 'Göksu - Riva Kıyı Rotası',
    description:
      "Beykoz'daki bu güzel rota, Göksu Deresi başlangıcından Riva'ya kadar uzanır. Doğal güzellikler ve yer yer zorlu patikalar içerir.",
    imageUrl: 'https://picsum.photos/800/500',
    distance: 18.4,
    elevation: 340,
    estimatedDuration: 130,
    difficulty: 'MEDIUM',
    type: 'HIKING',
    createdAt: new Date('2023-02-18').toISOString(),
    updatedAt: new Date('2023-06-15').toISOString(),
    createdBy: 'user345',
    city: 'İstanbul',
    district: 'Beykoz',
    isPublic: true,
    isFavorite: false,
    rating: 4.6,
    ratingCount: 72,
    popularity: 7.8,
    startPoint: {
      latitude: 41.0841,
      longitude: 29.0864,
    },
    endPoint: {
      latitude: 41.2179,
      longitude: 29.2176,
    },
    waypoints: [
      {latitude: 41.115, longitude: 29.1099},
      {latitude: 41.1479, longitude: 29.1398},
      {latitude: 41.1801, longitude: 29.1675},
    ],
    tags: ['doğa', 'nehir', 'kıyı', 'yürüyüş'],
    surface: 'TRAIL',
    routeData: {
      origin: {
        latitude: 41.0841,
        longitude: 29.0864,
      },
      destination: {
        latitude: 41.2179,
        longitude: 29.2176,
      },
      waypoints: [
        {latitude: 41.115, longitude: 29.1099},
        {latitude: 41.1479, longitude: 29.1398},
        {latitude: 41.1801, longitude: 29.1675},
      ],
      mode: 'WALKING',
    },
  },
];

export default mockPopularRoutes;
