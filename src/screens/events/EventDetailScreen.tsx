import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import eventService, {Event, Participant} from '../../services/eventService';
import {RootStackParamList} from '../../types/navigation';
import {FONTS} from '../../constants';

type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;
type EventDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EventDetailScreen = () => {
  const {colors} = useTheme();
  const route = useRoute<EventDetailRouteProp>();
  const navigation = useNavigation<EventDetailNavigationProp>();
  const {id} = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = 'a2bb0d9b-f9fa-47c4-bd5b-1f0086947bf6'; // TODO: Gerçek kullanıcı ID'sini auth sisteminden al

  const isParticipant = useMemo(() => {
    if (!event?.participants) return false;
    return event.participants.some(p => p.userId === currentUserId);
  }, [event?.participants, currentUserId]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEventById(id);
        console.log('API Response:', response);
        console.log('Event Travel Link:', response?.data?.travelLink);
        if (response?.isSuccess && response?.data) {
          setEvent(response.data);
        } else {
          console.log('Event not found or invalid response:', response);
          Alert.alert('Hata', 'Etkinlik bulunamadı');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Etkinlik getirilirken hata:', error);
        Alert.alert('Hata', 'Etkinlik yüklenirken bir sorun oluştu');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigation]);

  const handleParticipate = async () => {
    if (!event) return;

    try {
      if (isParticipant) {
        // Etkinlikten ayrıl
        const response = await eventService.leaveEvent(event.id);
        if (response.success) {
          // Katılımcılar listesinden kullanıcıyı çıkar
          const updatedParticipants =
            event.participants?.filter(p => p.userId !== currentUserId) || [];
          setEvent({
            ...event,
            participants: updatedParticipants,
            participantCount: event.participantCount - 1,
            confirmedParticipantCount: event.confirmedParticipantCount - 1,
          });
          Alert.alert('Başarılı', 'Etkinlikten ayrıldınız.');
        }
      } else {
        // Etkinliğe katıl
        const response = await eventService.joinEvent(event.id);
        if (response.success) {
          // Katılımcılar listesine kullanıcıyı ekle
          const newParticipant: Participant = {
            id: Date.now().toString(), // Geçici ID
            eventId: event.id,
            userId: currentUserId,
            status: 'pending',
            rejectionReason: null,
            kilometers: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: currentUserId,
              email: '',
              firstName: '',
              lastName: '',
              profilePicture: '',
            },
          };
          setEvent({
            ...event,
            participants: [...(event.participants || []), newParticipant],
            participantCount: event.participantCount + 1,
          });
          Alert.alert('Başarılı', 'Etkinliğe katılım talebiniz alındı.');
        }
      }
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      Alert.alert('Hata', 'İşlem sırasında bir sorun oluştu');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          Etkinlik yükleniyor...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{color: colors.text}}>Etkinlik bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.card}]}>
        <View style={styles.organizerInfo}>
          {event.creator && (
            <>
              <Image
                source={{
                  uri:
                    event.creator.profilePicture ||
                    'https://via.placeholder.com/150',
                }}
                style={styles.organizerAvatar}
              />
              <Text style={[styles.organizerName, {color: colors.text}]}>
                {event.creator.firstName} {event.creator.lastName}
              </Text>
            </>
          )}
        </View>
        <Text style={[styles.eventTitle, {color: colors.text}]}>
          {event.title}
        </Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.detailText, {color: colors.text}]}>
            {format(new Date(event.startDate), 'd MMMM yyyy, HH:mm', {
              locale: tr,
            })}
          </Text>
        </View>

        {/* Başlangıç Konumu */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={24}
            color={colors.primary}
          />
          <View style={styles.locationContainer}>
            <Text style={[styles.locationTitle, {color: colors.text}]}>
              Başlangıç Noktası
            </Text>
            <Text style={[styles.detailText, {color: colors.text}]}>
              {event.locationName}
            </Text>
          </View>
        </View>

        {/* Ara Noktalar */}
        {event.waypoints &&
          event.waypoints.length > 0 &&
          event.waypoints.map((waypoint, index) => (
            <View key={index} style={styles.detailRow}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={24}
                color={colors.primary}
              />
              <View style={styles.locationContainer}>
                <Text style={[styles.locationTitle, {color: colors.text}]}>
                  Ara Nokta {index + 1}
                </Text>
                <Text style={[styles.detailText, {color: colors.text}]}>
                  {waypoint.name}
                </Text>
                {waypoint.description && (
                  <Text
                    style={[styles.waypointDescription, {color: colors.text}]}>
                    {waypoint.description}
                  </Text>
                )}
              </View>
            </View>
          ))}

        {/* Bitiş Konumu */}
        {event.destinationLocationName && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="flag-checkered"
              size={24}
              color={colors.notification}
            />
            <View style={styles.locationContainer}>
              <Text style={[styles.locationTitle, {color: colors.text}]}>
                Bitiş Noktası
              </Text>
              <Text style={[styles.detailText, {color: colors.text}]}>
                {event.destinationLocationName}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.detailText, {color: colors.text}]}>
            {event.participantCount} / {event.maxParticipants} Katılımcı
          </Text>
        </View>

        {event.distance !== '0.00' && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.detailText, {color: colors.text}]}>
              {event.distance} km
            </Text>
          </View>
        )}

        {/* Etiketler */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name="tag-multiple"
              size={24}
              color={colors.primary}
            />
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <Text
                  key={index}
                  style={[styles.tag, {backgroundColor: colors.primary}]}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Maps Butonu - Ayrı beyaz card içinde */}
      {event?.travelLink && (
        <View style={[styles.mapSection, {backgroundColor: colors.card}]}>
          <TouchableOpacity
            style={styles.mapLinkButton}
            onPress={() => Linking.openURL(event.travelLink)}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={20}
              color={colors.primary}
              style={styles.mapIcon}
            />
            <Text style={[styles.mapLinkText, {color: colors.primary}]}>
              Rotayı Google Maps'te Aç
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Etkinlik Açıklaması
        </Text>
        <Text style={[styles.description, {color: colors.text}]}>
          {event.description}
        </Text>
      </View>

      {event.club && (
        <View style={[styles.section, {backgroundColor: colors.card}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Düzenleyen Kulüp
          </Text>
          <View style={styles.clubInfo}>
            <Image source={{uri: event.club.logo}} style={styles.clubLogo} />
            <View style={styles.clubDetails}>
              <Text style={[styles.clubName, {color: colors.text}]}>
                {event.club.name}
              </Text>
              <Text
                style={[styles.clubDescription, {color: colors.text}]}
                numberOfLines={2}>
                {event.club.description}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Katılımcılar */}
      <View style={[styles.section, {backgroundColor: colors.card}]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Katılımcılar ({event.participants?.length || 0})
          </Text>
        </View>
        <View style={styles.participantsList}>
          {event.participants && event.participants.length > 0 ? (
            event.participants.map(participant => (
              <View key={participant.id} style={styles.participantItem}>
                <Image
                  source={{
                    uri:
                      participant.user?.profilePicture ||
                      'https://via.placeholder.com/150',
                  }}
                  style={styles.participantAvatar}
                />
                <Text style={[styles.participantName, {color: colors.text}]}>
                  {participant.user?.firstName} {participant.user?.lastName}
                </Text>
                {participant.status === 'pending' && (
                  <Text
                    style={[
                      styles.pendingStatus,
                      {color: colors.notification},
                    ]}>
                    Onay Bekliyor
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, {color: colors.text}]}>
              Henüz katılımcı bulunmuyor
            </Text>
          )}
        </View>
      </View>

      {/* Katılım Butonları */}
      <View style={styles.actionButtonsContainer}>
        {event?.status === 'planned' && (
          <>
            <TouchableOpacity
              style={[
                styles.participateButton,
                {
                  backgroundColor: isParticipant
                    ? colors.notification
                    : colors.primary,
                },
              ]}
              onPress={handleParticipate}>
              <MaterialCommunityIcons
                name={isParticipant ? 'calendar-remove' : 'calendar-check'}
                size={24}
                color="white"
              />
              <Text style={styles.participateButtonText}>
                {isParticipant ? 'Katılmıyorum' : 'Katılıyorum'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  organizerName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 28,
    marginBottom: 8,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 20,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
    marginLeft: 8,
  },
  description: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  participantItem: {
    alignItems: 'center',
    width: 80,
  },
  participantAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  participantName: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  actionButtonsContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  participateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  participateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  clubLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  clubDescription: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    opacity: 0.8,
  },
  locationContainer: {
    flex: 1,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  pendingStatus: {
    fontSize: 10,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginTop: 2,
  },
  locationTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  waypointDescription: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 8,
    flex: 1,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    color: 'white',
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  mapSection: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mapLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapIcon: {
    marginRight: 8,
  },
  mapLinkText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
});
