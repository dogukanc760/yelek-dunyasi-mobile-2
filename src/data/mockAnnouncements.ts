import {Announcement} from '../services/announcementService';

// Şu anki tarih
const currentDate = new Date();

// Son bir hafta içindeki duyurular
export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Yeni Etkinlik: Haziran Bisiklet Festivali',
    content:
      "Haziran ayında büyük bir bisiklet festivali düzenliyoruz! 15-18 Haziran tarihleri arasında İstanbul'da gerçekleşecek festivalde konuşmacılar, workshoplar ve grup sürüşleri olacak. Kaçırmayın!",
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    createdAt: new Date(
      currentDate.getTime() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 2 gün önce
    updatedAt: new Date(
      currentDate.getTime() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: false,
    isImportant: true,
    type: 'EVENT',
    relatedEntityId: '6',
    publisherId: 'admin1',
    publisher: {
      id: 'admin1',
      name: 'Sistem Yöneticisi',
      type: 'ADMIN',
    },
  },
  {
    id: 'a2',
    title: 'Güvenli Sürüş Teknikleri Eğitimi',
    content:
      'Kadıköy Bisiklet Topluluğu olarak güvenli sürüş teknikleri eğitimimize tüm üyelerimizi bekliyoruz. Şehir içinde güvenli bisiklet kullanımı, trafik kuralları ve acil durum becerileri hakkında bilgi alacağınız bu eğitimi kaçırmayın.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    createdAt: new Date(
      currentDate.getTime() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 3 gün önce
    updatedAt: new Date(
      currentDate.getTime() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: true,
    isImportant: false,
    type: 'CLUB',
    relatedEntityId: 'club2',
    publisherId: 'club2',
    publisher: {
      id: 'club2',
      name: 'Kadıköy Bisiklet Topluluğu',
      logoUrl: 'https://placehold.co/200x200/purple/white?text=KBT',
      type: 'CLUB',
    },
  },
  {
    id: 'a3',
    title: 'Uygulama Güncellemesi: Yeni Özellikler',
    content:
      'Uygulamamıza yeni özellikler ekledik! Artık güzergah planlama, gelişmiş profil özellikleri ve rota paylaşımı yapabilirsiniz. Ayrıca performans iyileştirmeleri ve hata düzeltmeleri de yaptık.',
    createdAt: new Date(
      currentDate.getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 5 gün önce
    updatedAt: new Date(
      currentDate.getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: false,
    isImportant: true,
    type: 'SYSTEM',
    publisherId: 'system',
    publisher: {
      id: 'system',
      name: 'Sistem',
      type: 'SYSTEM',
    },
  },
  {
    id: 'a4',
    title: 'İBK: Yeni Üyelik Sistemi',
    content:
      'İstanbul Bisiklet Kulübü olarak üyelik sistemimizi yeniledik. Artık kulüp üyeliği başvuruları doğrudan uygulama üzerinden yapılabilecek. Mevcut üyelerimizin de profil bilgilerini güncellemelerini rica ederiz.',
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35',
    createdAt: new Date(
      currentDate.getTime() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 6 gün önce
    updatedAt: new Date(
      currentDate.getTime() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: true,
    isImportant: false,
    type: 'CLUB',
    relatedEntityId: 'club1',
    publisherId: 'club1',
    publisher: {
      id: 'club1',
      name: 'İstanbul Bisiklet Kulübü',
      logoUrl: 'https://placehold.co/200x200/orange/white?text=İBK',
      type: 'CLUB',
    },
  },
  {
    id: 'a5',
    title: 'Bisiklet Yolları: Belediye İş Birliği',
    content:
      'Belediyelere bisiklet yolları ve bisiklet dostu şehir planlaması için önerilerinizi bizimle paylaşabilirsiniz. Önümüzdeki hafta yerel yönetimlerle bir toplantı gerçekleştireceğiz.',
    createdAt: new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 7 gün önce
    updatedAt: new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    isRead: false,
    isImportant: false,
    type: 'GENERAL',
    publisherId: 'admin2',
    publisher: {
      id: 'admin2',
      name: 'Topluluk Yöneticisi',
      type: 'ADMIN',
    },
  },
];

export default mockAnnouncements;
