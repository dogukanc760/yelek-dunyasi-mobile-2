import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useTheme,
} from '@react-navigation/native';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, SIZES} from '../../constants';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {mockAnnouncements} from '../../data/mockAnnouncements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Announcement} from '../../services/announcementService';

type AnnouncementDetailRouteProp = RouteProp<
  RootStackParamList,
  'AnnouncementDetail'
>;

export const AnnouncementDetailScreen = () => {
  const route = useRoute<AnnouncementDetailRouteProp>();
  const navigation = useNavigation();
  const {colors} = useTheme();
  const {id, publisherId} = route.params;

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        if (publisherId) {
          // Belirli bir kulübe ait duyuruları filtrele
          const filteredAnnouncements = mockAnnouncements.filter(
            a =>
              a.publisherId === publisherId || a.publisher?.id === publisherId,
          );
          setAnnouncements(filteredAnnouncements);

          // Başlığı güncelle
          if (
            filteredAnnouncements.length > 0 &&
            filteredAnnouncements[0].publisher
          ) {
            navigation.setOptions({
              title: `${filteredAnnouncements[0].publisher.name} Duyuruları`,
            });
          }
        } else if (id) {
          // Belirli bir duyuruyu bul
          const selectedAnnouncement = mockAnnouncements.find(a => a.id === id);
          if (selectedAnnouncement) {
            setAnnouncement(selectedAnnouncement);
          }
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Duyurular alınırken hata:', error);
      setLoading(false);
    }
  }, [id, publisherId, navigation]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleRefresh = async () => {
    fetchAnnouncements();
  };

  const renderAnnouncementItem = ({item}: {item: Announcement}) => (
    <TouchableOpacity
      style={[styles.announcementCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('AnnouncementDetail', {id: item.id})}>
      <Text style={[styles.announcementTitle, {color: colors.text}]}>
        {item.title}
      </Text>
      <Text
        style={[styles.announcementContent, {color: COLORS.textSecondary}]}
        numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={[styles.announcementDate, {color: COLORS.textSecondary}]}>
        {format(new Date(item.createdAt), 'd MMMM yyyy', {
          locale: tr,
        })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{color: colors.text, marginTop: 10}}>Yükleniyor...</Text>
      </View>
    );
  }

  // Hem id hem de publisherId yoksa hata göster
  if (!id && !publisherId) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color={COLORS.error}
        />
        <Text style={{color: colors.text, marginTop: 10}}>
          Duyuru bulunamadı
        </Text>
      </View>
    );
  }

  // Eğer publisherId varsa, kulübe ait tüm duyuruları listele
  if (publisherId) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        {announcements.length > 0 ? (
          <FlatList
            data={announcements}
            renderItem={renderAnnouncementItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.text}]}>
              Duyuru bulunamadı
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Eğer id varsa ve announcement bulunduysa, tek bir duyurunun detayını göster
  if (announcement) {
    return (
      <ScrollView
        style={[styles.container, {backgroundColor: colors.background}]}
        contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          <Text style={[styles.title, {color: colors.text}]}>
            {announcement.title}
          </Text>

          <View style={styles.publisherRow}>
            <MaterialCommunityIcons
              name="account"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.publisherText, {color: COLORS.textSecondary}]}>
              {announcement.publisher?.name || 'Anonim'}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.dateText, {color: COLORS.textSecondary}]}>
              {format(new Date(announcement.createdAt), 'd MMMM yyyy', {
                locale: tr,
              })}
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={[styles.content, {color: colors.text}]}>
            {announcement.content}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Duyuru bulunamadıysa hata göster
  return (
    <View style={[styles.errorContainer, {backgroundColor: colors.background}]}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={50}
        color={COLORS.error}
      />
      <Text style={{color: colors.text, marginTop: 10}}>Duyuru bulunamadı</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.md,
  },
  publisherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  publisherText: {
    marginLeft: 8,
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SIZES.spacing.lg,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  listContainer: {
    padding: SIZES.spacing.lg,
  },
  announcementCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  announcementContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
