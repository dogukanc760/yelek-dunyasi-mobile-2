import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageStyle,
  useWindowDimensions,
  Modal,
} from 'react-native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS, ROUTES} from '../../constants';
import {useAuth} from '../../context/AuthContext';
import {UserClubEvent} from '../../services/eventService';
import eventService from '../../services/eventService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {Route} from '../../services/routeService';
import routeService from '../../services/routeService';
import {Club} from '../../services/clubService';
import clubService from '../../services/clubService';
import {Announcement} from '../../services/announcementService';
import announcementService from '../../services/announcementService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {ClubApplication} from '../../services/clubService';

// AsyncStorage içeriğini kontrol eden yardımcı fonksiyon
const checkAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('💾 ASYNC STORAGE ANAHTARLARI:', keys);

    // Önemli anahtarları kontrol et
    for (const key of [
      'auth_token',
      'refresh_token',
      'user_data',
      'club_memberships',
    ]) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        console.log(
          `💾 ASYNC STORAGE ${key}:`,
          key === 'user_data' ? JSON.parse(value) : value,
        );
      } else {
        console.log(`💾 ASYNC STORAGE ${key}: BULUNAMAdI`);
      }
    }
  } catch (error) {
    console.error('💾 ASYNC STORAGE HATASI:', error);
  }
};

const Section: React.FC<{
  title: string;
  onSeeAll?: () => void;
  children?: React.ReactNode;
  isLoading?: boolean;
}> = ({title, onSeeAll, children, isLoading = false}) => {
  const {colors} = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, {color: colors.primary}]}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        children
      )}
    </View>
  );
};

interface MinimalClub {
  id: string;
  name: string;
  logo: string;
  memberCount: number;
}

export const HomeScreen: React.FC = () => {
  const {colors} = useTheme();
  const {width: screenWidth} = useWindowDimensions();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {user, isAuthenticated, isLoading: authIsLoading} = useAuth();

  // getStatusColor fonksiyonu HomeScreen scope'una taşındı
  const getStatusColor = (status: string | undefined) => {
    // status undefined olabilir
    const s = status?.toLowerCase();
    if (s === 'pending') return COLORS.warning;
    if (s === 'approved' || s === 'active') return COLORS.success;
    if (s === 'rejected' || s === 'inactive') return COLORS.error;
    return COLORS.textSecondary;
  };

  // Debug logları
  console.log('===================== HOME SCREEN RENDER =====================');
  console.log('USER DATA:', user);
  console.log('CLUB MEMBERSHIPS:', user?.clubMemberships);
  console.log('IS AUTHENTICATED:', isAuthenticated);
  console.log('============================================================');

  // Kullanıcı verisini console.log ile yazdır
  useEffect(() => {
    console.log('===================== USER CHANGED =====================');
    console.log('USER DATA:', user);
    console.log('USER DATA (JSON):', JSON.stringify(user, null, 2));
    console.log('CLUB MEMBERSHIPS:', user?.clubMemberships);
    console.log('IS AUTHENTICATED:', isAuthenticated);
    console.log('========================================================');
  }, [user, isAuthenticated]);

  // Component mount olduğunda yazdır
  useEffect(() => {
    console.log('🏠 HomeScreen Mounted');
    console.log('👤 User State:', JSON.stringify(user, null, 2));
    console.log('🔐 IsAuthenticated:', isAuthenticated);
    console.log(
      '🏢 Club Memberships:',
      JSON.stringify(user?.clubMemberships, null, 2),
    );

    if (!user) {
      console.log('⚠️ User data is null!');
    }

    // Kulüp üyeliklerini kontrol et
    if (user?.clubMemberships) {
      console.log('🏢 Kulüp üyelikleri mevcut:', user.clubMemberships.length);
      user.clubMemberships.forEach((membership, index) => {
        console.log(
          `🏢 Üyelik ${index + 1}:`,
          JSON.stringify(membership, null, 2),
        );
      });
    } else {
      console.log('⚠️ Kulüp üyelikleri bulunamadı!');
    }

    // AsyncStorage kontrolü
    checkAsyncStorage();
  }, [user, isAuthenticated]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [_events, _setEvents] = useState<UserClubEvent[]>([]);
  const [_clubs, _setClubs] = useState<Club[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UserClubEvent[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [activeClubs, setActiveClubs] = useState<Club[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isRoutesLoading, setIsRoutesLoading] = useState(false);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isClubsLoading, setIsClubsLoading] = useState(true);

  const [applications, setApplications] = useState<ClubApplication[]>([]);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);
  const [showProfileCompletionPopup, setShowProfileCompletionPopup] =
    useState(false);

  // Profil tamamlama popup kontrolü
  useEffect(() => {
    console.log('[POPUP_CHECK] useEffect triggered. Deps:', {
      isAuthenticated,
      isUserPresent: !!user,
      isProfileCompleted: user?.isProfileCompleted,
      authIsLoading,
    });

    if (!authIsLoading) {
      if (isAuthenticated && user) {
        console.log(
          `[POPUP_CHECK] Auth loaded. User authenticated. isProfileCompleted: ${user.isProfileCompleted}`,
        );
        if (user.isProfileCompleted === false) {
          console.log(
            '[POPUP_CHECK] Condition met: user.isProfileCompleted is false. Showing popup.',
          );
          setShowProfileCompletionPopup(true);

          // İsteğe bağlı: Sorunlu olabilecek diğer alanları logla
          const profileFieldsToValidate: (keyof typeof user)[] = [
            'nickname',
            'phoneNumber',
            'city',
            'district',
            'motorcycleBrand',
            'motorcycleModel',
            'profilePicture',
            'bloodType',
            'clothingSize',
            'driverLicenseType',
            'emergencyContactName',
            'emergencyContactRelation',
            'emergencyContactPhone',
          ];
          let problematicFieldsFound = false;
          for (const field of profileFieldsToValidate) {
            const value = user[field];
            if (
              value === null ||
              value === undefined ||
              String(value).trim() === '' ||
              String(value).toLowerCase() === 'unknown' ||
              String(value).toLowerCase() === 'null string'
            ) {
              console.log(
                `[POPUP_CHECK] Problematic field for update: ${field} - Value: ${String(
                  value,
                )}`,
              );
              problematicFieldsFound = true;
            }
          }
          if (user.motorcycleCc === null || user.motorcycleCc === undefined) {
            console.log(
              `[POPUP_CHECK] Problematic field for update: motorcycleCc - Value: ${String(
                user.motorcycleCc,
              )}`,
            );
            problematicFieldsFound = true;
          }
          if (problematicFieldsFound) {
            console.log(
              '[POPUP_CHECK] Additional problematic fields identified. User should update these as well.',
            );
          }
        } else {
          console.log(
            '[POPUP_CHECK] Condition NOT met: user.isProfileCompleted is NOT false. Hiding popup.',
          );
          setShowProfileCompletionPopup(false);
        }
      } else {
        console.log(
          '[POPUP_CHECK] Auth loaded. User NOT authenticated or user object is null. Hiding popup.',
        );
        setShowProfileCompletionPopup(false);
      }
    } else {
      console.log('[POPUP_CHECK] Auth is still loading. Waiting...');
      // Auth yüklenirken popup durumunu değiştirmeyebiliriz veya false yapabiliriz.
      // Şimdilik bir şey yapmıyoruz, yükleme bitince koşullar tekrar değerlendirilecek.
    }
  }, [user, isAuthenticated, authIsLoading]);

  const fetchData = useCallback(async () => {
    try {
      console.log('===================== FETCHING DATA =====================');
      setIsLoading(true);

      setIsRoutesLoading(true);
      try {
        const response = await routeService.getPopularRoutes(1, 3);
        setPopularRoutes(response.routes);
      } catch (error) {
        console.error('Popüler rotalar alınırken hata:', error);
        setPopularRoutes([]);
      } finally {
        setIsRoutesLoading(false);
      }

      setIsClubsLoading(true);
      try {
        const response = await clubService.getClubs(1, 3);
        console.log(
          '🏢 Kulüpler API yanıtı (ham):',
          JSON.stringify(response, null, 2),
        );

        // @ts-ignore
        if (response && response.isSuccess && Array.isArray(response.data)) {
          // @ts-ignore
          const mappedClubs = response.data.map((item: any) => {
            console.log('🏢 Tek kulüp verisi:', JSON.stringify(item, null, 2));
            return {
              id: item.id,
              name: item.name || 'İsimsiz Kulüp',
              description: item.description || '',
              logo: item.logo || 'https://via.placeholder.com/40',
              cover:
                item.cover ||
                'https://placehold.co/800x200/darkgray/white?text=Kapak+Fotoğrafı',
              type: item.type?.toLowerCase() || 'public',
              status: item.status?.toLowerCase() || 'active',
              isOfficial: item.isOfficial || false,
              memberCount: item.memberCount || 0,
              isFreeForever: item.isFreeForever || false,
              founderId: item.founderId || '',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            } as Club;
          });

          console.log(
            '🏢 Dönüştürülmüş kulüpler:',
            JSON.stringify(mappedClubs, null, 2),
          );
          setActiveClubs(mappedClubs);
          _setClubs(mappedClubs);
        } else {
          console.error(
            'Kulüpler API yanıtı beklenen formatta değil:',
            response,
          );
          setActiveClubs([]);
          _setClubs([]);
        }
      } catch (error) {
        console.error('Kulüpler alınırken hata:', error);
        setActiveClubs([]);
        _setClubs([]);
      } finally {
        setIsClubsLoading(false);
      }

      setIsLoading(false);
      console.log('===================== DATA FETCHED =====================');
      console.log('USER AFTER FETCH:', user);
      console.log('================================================');
    } catch (error) {
      console.error('Ana sayfa verileri alınırken hata:', error);
      setIsLoading(false);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClubPress = async (clubId: string) => {
    try {
      console.log('🏢 handleClubPress çağrıldı:', clubId);

      if (!clubId) {
        console.error('❌ Geçersiz kulüp ID');
        return;
      }

      console.log('🔍 Kulüp detayları alınıyor...');
      const clubDetails = await clubService.getClubById(clubId);
      console.log('📦 API Yanıtı:', clubDetails);

      if (!clubDetails) {
        console.error('❌ Kulüp detayları alınamadı');
        return;
      }

      if (!clubDetails.id) {
        console.error('❌ Kulüp ID bulunamadı:', clubDetails);
        return;
      }

      console.log('✅ Kulüp detayları alındı, sayfaya yönlendiriliyor...');
      navigation.navigate('ClubDetail', {id: clubDetails.id});
    } catch (error: any) {
      console.error('❌ handleClubPress hatası:', error.message);
      console.error('❌ Hata detayı:', error.response?.data || error);
    }
  };

  const renderEventCard = (event: UserClubEvent) => (
    <TouchableOpacity
      style={[styles.eventCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('EventDetail', {id: event.id})}>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, {color: colors.text}]}>
            {event.title}
          </Text>
          <View style={styles.eventTypeContainer}>
            <MaterialCommunityIcons
              name={event.type === 'RIDE' ? 'motorbike' : 'calendar'}
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.eventType, {color: colors.primary}]}>
              {event.type === 'RIDE' ? 'Sürüş' : 'Toplantı'}
            </Text>
          </View>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventDateContainer}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.eventDate, {color: COLORS.textSecondary}]}>
              {format(new Date(event.startDate), 'd MMMM yyyy', {locale: tr})}
            </Text>
          </View>
          <View style={styles.eventLocationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.eventLocation, {color: COLORS.textSecondary}]}>
              {event.startLocation || 'Konum belirtilmemiş'}
            </Text>
          </View>
        </View>
        <View style={styles.eventFooter}>
          <View style={styles.eventClubContainer}>
            {event.club?.logo ? (
              <Image
                source={{
                  uri: event.club.logo,
                }}
                style={styles.eventClubLogo as ImageStyle}
              />
            ) : (
              <View
                style={[
                  styles.eventClubLogo,
                  {backgroundColor: COLORS.primary},
                ]}>
                <Text style={styles.clubLogoPlaceholder}>
                  {event.club?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <Text
              style={[styles.eventClubName, {color: colors.text}]}
              numberOfLines={1}>
              {event.club?.name || 'Bilinmeyen Kulüp'}
            </Text>
          </View>
          <View style={styles.eventParticipantsContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text
              style={[styles.eventParticipants, {color: COLORS.textSecondary}]}>
              {event.currentParticipants || 0}/{event.maxParticipants || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSmallEventCard = (event: UserClubEvent) => {
    const cardWidth =
      screenWidth > 768 ? '31%' : screenWidth > 480 ? '48%' : '100%';

    return (
      <TouchableOpacity
        style={[
          styles.smallEventCard,
          {backgroundColor: colors.card, width: cardWidth},
        ]}
        onPress={() => navigation.navigate('EventDetail', {id: event.id})}>
        <View style={styles.smallEventContent}>
          <View style={styles.smallEventHeader}>
            <Text style={[styles.eventTitle, {color: colors.text}]}>
              {event.title}
            </Text>
            <View style={styles.smallEventTypeContainer}>
              <MaterialCommunityIcons
                name={event.type === 'RIDE' ? 'motorbike' : 'calendar'}
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.smallEventType, {color: colors.primary}]}>
                {event.type === 'RIDE' ? 'Sürüş' : 'Toplantı'}
              </Text>
            </View>
          </View>
          <View style={styles.smallEventInfo}>
            <View style={styles.smallEventDateContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text
                style={[styles.smallEventDate, {color: COLORS.textSecondary}]}>
                {format(new Date(event.startDate), 'd MMMM yyyy', {locale: tr})}
              </Text>
            </View>
            <View style={styles.smallEventLocationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.smallEventLocation,
                  {color: COLORS.textSecondary},
                ]}>
                {event.startLocation || 'Konum belirtilmemiş'}
              </Text>
            </View>
          </View>
          <View style={styles.smallEventFooter}>
            <View style={styles.smallEventClubContainer}>
              <Image
                source={{
                  uri: event.club?.logo || 'https://via.placeholder.com/40',
                }}
                style={styles.smallEventClubLogo as ImageStyle}
              />
              <Text style={[styles.smallEventClubName, {color: colors.text}]}>
                {event.club?.name}
              </Text>
            </View>
            <View style={styles.smallEventParticipantsContainer}>
              <MaterialCommunityIcons
                name="account-group"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.smallEventParticipants,
                  {color: COLORS.textSecondary},
                ]}>
                {event.currentParticipants}/{event.maxParticipants}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderClubCard = (club: MinimalClub) => (
    <TouchableOpacity
      key={club.id}
      style={[styles.clubCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('ClubDetail', {id: club.id})}>
      <Image
        source={{uri: club.logo}}
        style={styles.clubLogo as ImageStyle}
        resizeMode="cover"
      />
      <View style={styles.clubInfo}>
        <Text style={[styles.clubName, {color: colors.text}]}>{club.name}</Text>
        <Text style={styles.memberCount}>{club.memberCount} üye</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActiveClubCard = (club: Club) => {
    if (!club || !club.id) {
      console.error('Geçersiz kulüp verisi:', club);
      return null;
    }
    // handleClubPress fonksiyonu tanımlı olmalı veya bu kısım düzenlenmeli
    // Şimdilik handleClubPress çağrısını koruyorum, eğer tanımsızsa hata verecektir.
    // Kullanıcı sadece popup ve club logo istediği için buraya dokunmuyorum.
    return (
      <TouchableOpacity
        key={club.id}
        style={[styles.card, {backgroundColor: COLORS.white}]}
        onPress={() => handleClubPress(club.id)}>
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri:
                'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                club.cover.replace('/public', ''),
            }}
            style={styles.coverImage as ImageStyle}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <View style={styles.overlayContent}>
            <Image
              source={{
                uri:
                  'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                  club.logo.replace('/public', ''),
              }}
              style={styles.logo as ImageStyle}
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {club.name || 'İsimsiz Kulüp'}
              </Text>
              <View style={styles.statusBadges}>
                <View style={[styles.badge, {backgroundColor: '#3b82f6'}]}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={12}
                    color="white"
                  />
                  <Text style={styles.badgeText}>Aktif</Text>
                </View>
                <View style={[styles.badge, {backgroundColor: '#f97316'}]}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={12}
                    color="white"
                  />
                  <Text style={styles.badgeText}>
                    {club.memberCount || 0} üye
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.fullWidthBadges}>
            <View style={[styles.fullWidthBadge, {backgroundColor: '#22c55e'}]}>
              <MaterialCommunityIcons
                name="account-tie"
                size={12}
                color="white"
              />
              <Text style={styles.badgeText}>Yönetici</Text>
            </View>
            <View style={[styles.fullWidthBadge, {backgroundColor: '#8b5cf6'}]}>
              <MaterialCommunityIcons name="lock" size={12} color="white" />
              <Text style={styles.badgeText}>Özel Kulüp</Text>
            </View>
            {club.isOfficial && (
              <View
                style={[styles.fullWidthBadge, {backgroundColor: '#22c55e'}]}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={12}
                  color="white"
                />
                <Text style={styles.badgeText}>Resmi Kulüp</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAnnouncementCard = (announcement: Announcement) => (
    <TouchableOpacity
      key={announcement.id}
      style={[styles.announcementCard, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('AnnouncementDetail', {id: announcement.id})
      }>
      <View style={styles.announcementHeader}>
        <View style={styles.announcementInfo}>
          <Text
            style={{...styles.announcementTitle, color: colors.text}}
            numberOfLines={1}>
            {announcement.title}
          </Text>
          <Text
            style={{...styles.publisherName, color: COLORS.textSecondary}}
            numberOfLines={1}>
            {announcement.createdBy.firstName} {announcement.createdBy.lastName}{' '}
            • {format(new Date(announcement.createdAt), 'd MMM', {locale: tr})}
          </Text>
        </View>
      </View>
      <Text
        style={{...styles.announcementContent, color: colors.text}}
        numberOfLines={2}>
        {announcement.content}
      </Text>
    </TouchableOpacity>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return COLORS.success;
      case 'MEDIUM':
        return COLORS.warning;
      case 'HARD':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Kolay';
      case 'MEDIUM':
        return 'Orta';
      case 'HARD':
        return 'Zor';
      default:
        return 'Belirsiz';
    }
  };

  const fetchEvents = useCallback(async () => {
    setIsEventsLoading(true);
    try {
      console.log('🔍 Kullanıcı etkinlikleri getiriliyor...');

      if (!user?.id) {
        console.log('❌ Kullanıcı girişi yapılmamış');
        setUpcomingEvents([]);
        _setEvents([]);
        return;
      }

      const response = await eventService.getUserClubEvents(user.id);
      console.log('📅 API Yanıtı:', JSON.stringify(response, null, 2));

      if (response.isSuccess && response.data?.data) {
        // Yaklaşan etkinlikleri al
        const upcomingEvts = response.data.data.participatedEvents.upcoming;
        console.log(
          '📅 Yaklaşan etkinlikler:',
          JSON.stringify(upcomingEvts, null, 2),
        );

        setUpcomingEvents(upcomingEvts);
        _setEvents(upcomingEvts);
      } else {
        console.error('❌ API yanıtı beklenen formatta değil:', response);
        setUpcomingEvents([]);
        _setEvents([]);
      }
    } catch (error) {
      console.error('❌ Etkinlikler alınırken hata:', error);
      setUpcomingEvents([]);
      _setEvents([]);
    } finally {
      setIsEventsLoading(false);
    }
  }, [user?.id]);

  const fetchAnnouncements = useCallback(async () => {
    setIsAnnouncementsLoading(true);
    try {
      // Kullanıcının üye olduğu kulüplerin ID'lerini al
      const clubIds =
        user?.clubMemberships?.map(membership => membership.clubId) || [];

      // Her kulüp için duyuruları al ve birleştir
      const allAnnouncements: Announcement[] = [];

      for (const clubId of clubIds) {
        try {
          const response = await announcementService.getClubAnnouncements(
            clubId,
            1,
            3,
          );

          console.log(
            `📢 ${clubId} kulübü için duyurular:`,
            JSON.stringify(response, null, 2),
          );

          // API yanıtı düzeltildi
          if (
            response.isSuccess &&
            response.data?.data &&
            response.data.data.length > 0
          ) {
            allAnnouncements.push(...response.data.data);
          }
        } catch (error) {
          console.error(
            `❌ ${clubId} kulübü için duyurular alınırken hata:`,
            error,
          );
        }
      }

      // Duyuruları tarihe göre sırala (en yeni en üstte)
      const sortedAnnouncements = allAnnouncements.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      console.log(
        '📢 Tüm sıralanmış duyurular:',
        JSON.stringify(sortedAnnouncements, null, 2),
      );

      setAnnouncements(sortedAnnouncements);
    } catch (error: any) {
      console.error('❌ Duyurular alınırken genel hata:', error);
      setAnnouncements([]);
    } finally {
      setIsAnnouncementsLoading(false);
    }
  }, [user?.clubMemberships]);

  const fetchApplications = useCallback(async () => {
    try {
      setIsApplicationsLoading(true);
      if (!user?.id) {
        console.log('❌ Kullanıcı ID bulunamadı');
        setApplications([]);
        return;
      }

      console.log('🔍 Kulüp başvuruları getiriliyor...');
      const response = await clubService.getUserApplications(user.id);
      console.log('📝 API Yanıtı:', JSON.stringify(response, null, 2));

      if (response.isSuccess && Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        console.error('❌ API yanıtı beklenen formatta değil:', response);
        setApplications([]);
      }
    } catch (error) {
      console.error('❌ Başvurular alınırken hata:', error);
      setApplications([]);
    } finally {
      setIsApplicationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
    fetchApplications();
  }, [fetchEvents, fetchAnnouncements, fetchApplications]);

  const renderApplicationCard = (application: ClubApplication) => (
    <TouchableOpacity
      key={application.id}
      style={[styles.applicationCard, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('ClubDetail', {id: application.club.id})
      }>
      <View style={styles.applicationHeader}>
        <Image
          source={{uri: application.club.logo}}
          style={styles.clubLogo}
          resizeMode="cover"
        />
        <View style={styles.applicationInfo}>
          <Text
            style={[styles.clubName, {color: colors.text}]}
            numberOfLines={1}>
            {application.club.name}
          </Text>
          <Text
            style={[
              styles.applicationStatus,
              {
                color:
                  application.status === 'PENDING'
                    ? COLORS.warning
                    : application.status === 'APPROVED'
                    ? COLORS.success
                    : COLORS.error,
              },
            ]}>
            {application.status === 'PENDING'
              ? 'Bekliyor'
              : application.status === 'APPROVED'
              ? 'Onaylandı'
              : 'Reddedildi'}
          </Text>
        </View>
      </View>{' '}
      <Text
        style={[styles.applicationNote, {color: colors.text}]}
        numberOfLines={2}>
        {application.applicationNote}
      </Text>
      <View style={styles.responseContainer}>
        <Text style={[styles.responseLabel, {color: colors.text}]}>
          Kulüp Yanıtı:
        </Text>
        <Text
          style={[styles.responseNote, {color: colors.text}]}
          numberOfLines={2}>
          {application.responseNote || 'Henüz Yanıtlanmadı'}
        </Text>
      </View>
      <Text style={styles.applicationDate}>
        {format(new Date(application.createdAt), 'd MMMM yyyy', {locale: tr})}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={
          colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'
        }
        backgroundColor={colors.background}
      />
      <Modal
        transparent={true}
        animationType="slide"
        visible={showProfileCompletionPopup}
        onRequestClose={() => setShowProfileCompletionPopup(false)}>
        <View style={styles.modalCenteredView}>
          <View style={[styles.modalView, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Profilini Tamamla
            </Text>
            <Text style={[styles.modalText, {color: colors.text}]}>
              Profil bilgilerinde eksik veya güncellenmesi gereken alanlar
              bulunmaktadır (örneğin; Kan grubu bilgisi, motosiklet bilgisi
              vb.). Lütfen tüm bilgilerini gözden geçirerek profil tamamlama
              ekranından güncelle.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: colors.primary}]}
                onPress={() => {
                  setShowProfileCompletionPopup(false);
                  navigation.navigate(ROUTES.PROFILE.EDIT_PROFILE);
                }}>
                <Text style={[styles.modalButtonText, {color: COLORS.white}]}>
                  Profili Tamamla
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {backgroundColor: colors.border, marginTop: 10},
                ]}
                onPress={() => setShowProfileCompletionPopup(false)}>
                <Text style={[styles.modalButtonText, {color: colors.text}]}>
                  Daha Sonra
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={[styles.container, {backgroundColor: colors.background}]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.headerContainer}>
          <Text style={{...styles.welcomeText, color: colors.text}}>
            Merhaba, {user?.firstName || 'Sürücü'}!
          </Text>
          <Text style={{...styles.subtitle, color: COLORS.textSecondary}}>
            Bugün nereye sürmek istersin?
          </Text>
        </View>

        {/* Kulüpler bölümünü sadece giriş yapmış ve kulüp üyeliği olan kullanıcılara göster */}
        {isAuthenticated &&
          user?.clubMemberships &&
          user.clubMemberships.length > 0 && (
            <Section
              title="Kulüpler"
              onSeeAll={() => navigation.navigate('ClubsList')}
              isLoading={isClubsLoading}>
              <View style={styles.clubsContainer}>
                {activeClubs
                  .map(club => ({
                    id: club.id,
                    name: club.name,
                    logo:
                      'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                      club.logo.replace('/public', ''),
                    memberCount: club.memberCount,
                  }))
                  .map(renderClubCard)}
              </View>
            </Section>
          )}

        {/* Kulüp üyeliği olmayan kullanıcılar için bilgilendirme mesajı */}
        {isAuthenticated &&
          (!user?.clubMemberships || user.clubMemberships.length === 0) && (
            <View style={styles.noClubContainer}>
              <Text style={[styles.noClubText, {color: colors.text}]}>
                Henüz bir kulübe üye değilsiniz.
              </Text>
              <TouchableOpacity
                style={styles.joinClubButton}
                onPress={() => navigation.navigate('ClubsList')}>
                <Text style={styles.joinClubButtonText}>Kulüpleri Keşfet</Text>
              </TouchableOpacity>
            </View>
          )}

        <Section
          title="Etkinliklerim"
          onSeeAll={() => {
            navigation.navigate('MyEvents');
          }}
          isLoading={isLoading}>
          {isLoading ? (
            <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
              Yükleniyor...
            </Text>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <View style={styles.eventCardsContainer}>
              {upcomingEvents.slice(0, 3).map(event => renderEventCard(event))}
            </View>
          ) : (
            <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
              Katıldığınız etkinlik bulunmamaktadır.
            </Text>
          )}
        </Section>

        <Section
          title="Duyurular"
          onSeeAll={() => {
            navigation.navigate('Notifications');
          }}
          isLoading={isLoading}>
          <View style={styles.announcementsContainer}>
            {isLoading ? (
              <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
                Duyurular yükleniyor...
              </Text>
            ) : announcements && announcements.length > 0 ? (
              announcements
                .slice(0, 2)
                .map((announcement: Announcement) =>
                  renderAnnouncementCard(announcement),
                )
            ) : (
              <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
                Duyuru bulunamadı
              </Text>
            )}
          </View>
        </Section>

        <Section
          title="Sürücüler İçin Son Haberler"
          onSeeAll={() => {
            navigation.navigate('EventsScreen');
          }}
          isLoading={isLoading}>
          {isLoading ? (
            <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
              Yükleniyor...
            </Text>
          ) : upcomingEvents && upcomingEvents.length === 0 ? (
            <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
              Yaklaşan etkinlik bulunmamaktadır.
            </Text>
          ) : (
            <View style={styles.gridContainer}>
              {upcomingEvents &&
                upcomingEvents
                  .slice(0, 6)
                  .map(event => renderSmallEventCard(event))}
            </View>
          )}
        </Section>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Popüler Rotalar
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('PopularRoutes')}
              style={styles.seeAllButton}>
              <Text style={{...styles.seeAllText, color: colors.primary}}>
                Tümünü Gör
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {isRoutesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : popularRoutes && popularRoutes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={40}
                color={COLORS.textSecondary}
              />
              <Text style={{...styles.emptyText, color: colors.text}}>
                Henüz popüler rota bulunmuyor
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.routesContainer}>
              {popularRoutes.map(route => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeCard,
                    {backgroundColor: colors.card, marginRight: 16},
                  ]}
                  onPress={() =>
                    navigation.navigate('RouteDetail', {id: route.id})
                  }>
                  <Image
                    source={{uri: route.imageUrl}}
                    style={styles.routeImage as ImageStyle}
                  />
                  <View style={styles.routeContent}>
                    <Text
                      style={{...styles.routeName, color: colors.text}}
                      numberOfLines={1}>
                      {route.name}
                    </Text>
                    <View style={styles.routeStats}>
                      <View style={styles.routeStat}>
                        <MaterialCommunityIcons
                          name="map-marker-distance"
                          size={14}
                          color={COLORS.textSecondary}
                        />
                        <Text
                          style={{...styles.routeStatText, color: colors.text}}>
                          {route.distance} km
                        </Text>
                      </View>
                      <View style={styles.routeStat}>
                        <MaterialCommunityIcons
                          name="bike"
                          size={14}
                          color={COLORS.textSecondary}
                        />
                        <Text
                          style={{...styles.routeStatText, color: colors.text}}>
                          {route.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.routeDifficulty}>
                      <Text
                        style={{
                          ...styles.routeDifficultyText,
                          color: getDifficultyColor(route.difficulty),
                        }}>
                        {getDifficultyText(route.difficulty)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={{...styles.sectionTitle, color: colors.text}}>
              Aktif Kulüpler
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ClubsList')}>
              <Text style={{...styles.sectionLink, color: COLORS.primary}}>
                Tümünü Gör
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.clubListContainer}>
            {isLoading ? (
              <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
                Kulüpler yükleniyor...
              </Text>
            ) : activeClubs && activeClubs.length === 0 ? (
              <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
                Kulüp bulunamadı
              </Text>
            ) : (
              <View style={styles.clubsGrid}>
                {activeClubs &&
                  activeClubs.map(club => renderActiveClubCard(club))}
              </View>
            )}
          </View>
        </View>

        <Section
          title="Kulüp Başvurularım"
          onSeeAll={() => {}}
          isLoading={isApplicationsLoading}>
          {applications.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.applicationsScrollContainer}>
              {applications.map(renderApplicationCard)}
            </ScrollView>
          ) : (
            <Text style={[styles.emptyText, {color: colors.text}]}>
              Henüz hiç başvurunuz bulunmuyor.
            </Text>
          )}
        </Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    marginTop: 16,
    width: '100%',
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  sectionContent: {
    width: '100%',
  },
  sectionLink: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.primary,
  },
  headerContainer: {
    padding: 16,
  },
  welcomeText: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  // Event card styles
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCover: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  eventType: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
  },
  eventInfo: {
    marginTop: 8,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  eventClubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  eventClubLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubLogoPlaceholder: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  eventClubName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  eventParticipantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  eventParticipants: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
  // Small event card styles
  smallEventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 160,
  },
  smallEventContent: {
    padding: 12,
  },
  smallEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallEventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  smallEventType: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
  },
  smallEventInfo: {
    marginTop: 8,
  },
  smallEventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  smallEventDate: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 6,
  },
  smallEventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallEventLocation: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 6,
  },
  smallEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  smallEventClubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallEventClubLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  smallEventClubName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  smallEventParticipantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallEventParticipants: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
  },
  // Club card styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  coverContainer: {
    position: 'relative',
    height: 120,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlayContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    letterSpacing: 0.5,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  cardContent: {
    padding: 12,
  },
  fullWidthBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  // Grid container
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  announcementsContainer: {
    paddingHorizontal: 16,
  },
  eventCardsContainer: {
    paddingHorizontal: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    marginRight: 4,
  },
  clubListContainer: {
    paddingHorizontal: 16,
  },
  clubsGrid: {
    width: '100%',
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  publisherName: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  announcementContent: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  routeContent: {
    padding: 12,
  },
  routeName: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeStatText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
  routeDifficulty: {
    alignSelf: 'flex-start',
  },
  routeDifficultyText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  routesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Containers
  clubsContainer: {
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  applicationsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  applicationCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applicationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applicationTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  applicationClubName: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
  },
  applicationUserName: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    opacity: 0.8,
  },
  applicationStatus: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    marginTop: 4,
  },
  noClubContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noClubText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  joinClubButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinClubButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  seeAll: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    lineHeight: 20,
    marginRight: 4,
  },
  loader: {
    marginTop: 12,
  },
  clubCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  clubLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: COLORS.border,
  },
  clubInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  clubName: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  memberCount: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    color: COLORS.textSecondary,
  },
  textInputFocus: {
    borderColor: COLORS.primary,
  },
  // Modal stilleri eklendi
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    lineHeight: 22,
  },
  modalButtonContainer: {
    width: '100%',
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicationNote: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginVertical: 8,
  },
  responseContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
  },
  responseLabel: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 14,
  },
  responseNote: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
  },
  applicationDate: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    marginTop: 8,
  },
});

export default HomeScreen;
