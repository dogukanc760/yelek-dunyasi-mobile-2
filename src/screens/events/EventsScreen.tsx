import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextStyle,
  TouchableOpacity,
  StatusBar,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useTheme,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS, SIZES, ROUTES} from '../../constants';
import {Event} from '../../services/eventService';
import {Calendar, DateData} from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  upcomingEvents,
  pastEvents,
  allEvents,
  calendarEvents,
} from '../../data/mockEvents';

type EventsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EventsScreenRouteProp = RouteProp<RootStackParamList, 'EventsScreen'>;

type ViewMode = 'list' | 'calendar';
type FilterType = 'all' | 'past' | 'upcoming' | 'my';

interface EventParticipationState {
  eventId: string;
  action: 'join' | 'leave';
  reason?: string;
  processing: boolean;
}

const EventsScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const route = useRoute<EventsScreenRouteProp>();
  const clubId = route.params?.clubId;
  const filterType = route.params?.filter || 'upcoming';
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participation, setParticipation] =
    useState<EventParticipationState | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    filterType as FilterType,
  );

  const fetchEvents = useCallback(
    async (status: FilterType = activeFilter) => {
      try {
        setLoading(true);
        setTimeout(() => {
          let filteredEvents: Event[] = [];

          if (status === 'upcoming') {
            filteredEvents = upcomingEvents;
          } else if (status === 'past') {
            filteredEvents = pastEvents;
          } else if (status === 'my') {
            filteredEvents = allEvents.filter(
              event => event.participationStatus === 'JOINED',
            );
          } else {
            filteredEvents = allEvents;
          }

          // Eğer clubId parametresi varsa, sadece o kulübe ait etkinlikleri göster
          if (clubId) {
            filteredEvents = filteredEvents.filter(
              event => event.clubId === clubId,
            );

            // Kulüp ID'si varsa, başlığı güncellemek için kulüp adını bulalım
            const clubEvent = filteredEvents[0];
            if (clubEvent && clubEvent.club) {
              navigation.setOptions({
                title: `${clubEvent.club.name} Etkinlikleri`,
              });
            }
          }

          setEvents(filteredEvents);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Etkinlikler alınırken hata:', error);
        setLoading(false);
      }
    },
    [clubId, navigation, activeFilter],
  );

  useEffect(() => {
    if (route.params?.filter) {
      setActiveFilter(route.params.filter as FilterType);
    }
  }, [route.params?.filter]);

  const handleRefresh = async () => {
    await fetchEvents(activeFilter);
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    let title = 'Etkinlikler';

    if (activeFilter === 'upcoming') {
      title = 'Yaklaşan Etkinlikler';
    } else if (activeFilter === 'past') {
      title = 'Geçmiş Etkinlikler';
    } else if (activeFilter === 'my') {
      title = 'Katıldığım Etkinlikler';
    }

    if (!clubId) {
      navigation.setOptions({title});
    }
  }, [activeFilter, navigation, clubId]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    fetchEvents(filter);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const dayEvents = calendarEvents[day.dateString] || [];
    setSelectedEvents(dayEvents);
    if (dayEvents.length > 0) {
      setModalVisible(true);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      setParticipation({
        eventId,
        action: 'join',
        processing: true,
      });

      setTimeout(() => {
        const updatedEvents = events.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              participationStatus: 'JOINED' as 'JOINED',
              currentParticipants: event.currentParticipants + 1,
            };
          }
          return event;
        });

        setEvents(updatedEvents);

        const updatedEvent = allEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          updatedEvent.participationStatus = 'JOINED';
          updatedEvent.currentParticipants += 1;
        }

        Alert.alert('Başarılı', 'Etkinliğe katılım talebiniz alındı.');
        setParticipation(null);
        setDetailModalVisible(false);

        // Olay listesini yenile
        fetchEvents(activeFilter);
      }, 500);
    } catch (error) {
      console.error('Etkinliğe katılırken hata:', error);
      Alert.alert('Hata', 'Etkinliğe katılırken bir sorun oluştu.');
      setParticipation(null);
      setDetailModalVisible(false);
    }
  };

  const handleDeclineEvent = async (eventId: string) => {
    try {
      if (!declineReason.trim()) {
        Alert.alert('Uyarı', 'Lütfen bir mazeret belirtin.');
        return;
      }

      setParticipation({
        eventId,
        action: 'leave',
        reason: declineReason,
        processing: true,
      });

      setTimeout(() => {
        const updatedEvents = events.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              participationStatus: 'NONE' as 'NONE',
              currentParticipants: Math.max(0, event.currentParticipants - 1),
            };
          }
          return event;
        });

        setEvents(updatedEvents);

        // Tüm mock verileri de güncelle
        const updatedEvent = allEvents.find(e => e.id === eventId);
        if (updatedEvent) {
          updatedEvent.participationStatus = 'NONE';
          updatedEvent.currentParticipants = Math.max(
            0,
            updatedEvent.currentParticipants - 1,
          );
        }

        Alert.alert('Bilgi', 'Etkinliğe katılmama talebiniz alındı.');
        setParticipation(null);
        setDeclineReason('');
        setDetailModalVisible(false);

        // Olay listesini yenile
        fetchEvents(activeFilter);
      }, 500);
    } catch (error) {
      console.error('Etkinliğe katılmama işlemi sırasında hata:', error);
      Alert.alert('Hata', 'İşlem sırasında bir sorun oluştu.');
      setParticipation(null);
      setDeclineReason('');
      setDetailModalVisible(false);
    }
  };

  const renderEventItem = ({item}: {item: Event}) => (
    <TouchableOpacity
      style={[styles.eventCard, {backgroundColor: colors.background}]}
      onPress={() => handleEventPress(item)}>
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, {color: colors.text}]}>
          {item.title}
        </Text>
        {item.participationStatus === 'JOINED' && (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={colors.primary}
          />
        )}
      </View>
      <Text style={[styles.eventDate, {color: COLORS.textSecondary}]}>
        {format(new Date(item.startDate), 'd MMMM yyyy', {locale: tr})}
      </Text>
      <Text style={[styles.eventLocation, {color: colors.text}]}>
        {item.location.city}, {item.location.district}
      </Text>
      <View style={styles.eventFooter}>
        <MaterialCommunityIcons
          name="account-group"
          size={20}
          color={colors.text}
        />
        <Text style={[styles.participantCount, {color: COLORS.textSecondary}]}>
          {item.currentParticipants}/{item.maxParticipants} Katılımcı
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title as TextStyle}>Etkinlikler</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            navigation.navigate(ROUTES.EVENT.CREATE_EVENT as never)
          }>
          <Text style={styles.createButtonText as TextStyle}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'upcoming' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange('upcoming')}>
          <Text
            style={[
              styles.filterText,
              {
                color:
                  activeFilter === 'upcoming' ? colors.primary : colors.text,
              },
            ]}>
            Yaklaşan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'past' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange('past')}>
          <Text
            style={[
              styles.filterText,
              {color: activeFilter === 'past' ? colors.primary : colors.text},
            ]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'my' && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterChange('my')}>
          <Text
            style={[
              styles.filterText,
              {color: activeFilter === 'my' ? colors.primary : colors.text},
            ]}>
            Katıldıklarım
          </Text>
        </TouchableOpacity>
      </View>

      {/* Görünüm Seçenekleri */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            viewMode === 'list' && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setViewMode('list')}>
          <Text
            style={[
              styles.tabText,
              {color: viewMode === 'list' ? 'white' : colors.text},
            ]}>
            Liste Görünümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            viewMode === 'calendar' && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setViewMode('calendar')}>
          <Text
            style={[
              styles.tabText,
              {color: viewMode === 'calendar' ? 'white' : colors.text},
            ]}>
            Takvim Görünümü
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.text}]}>
            Etkinlikler yükleniyor...
          </Text>
        </View>
      )}

      {!loading && viewMode === 'list' && (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: colors.text}]}>
                Etkinlik bulunamadı
              </Text>
            </View>
          }
        />
      )}

      {!loading && viewMode === 'calendar' && (
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: {
              marked: true,
              dotColor: colors.primary,
              selected: true,
              selectedColor: colors.primary,
            },
          }}
          theme={{
            todayTextColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            arrowColor: colors.primary,
          }}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, {backgroundColor: colors.background}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {selectedDate
                  ? format(new Date(selectedDate), 'd MMMM yyyy', {locale: tr})
                  : 'Etkinlikler'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {selectedEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => {
                    setModalVisible(false);
                    handleEventPress(event);
                  }}>
                  {renderEventItem({item: event})}
                </TouchableOpacity>
              ))}
              {selectedEvents.length === 0 && (
                <Text style={[styles.emptyText, {color: colors.text}]}>
                  Bu tarihte etkinlik bulunamadı
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, {backgroundColor: colors.background}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                Etkinlik Detayı
              </Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {selectedEvent && (
                <View>
                  <Text style={[styles.eventDetailTitle, {color: colors.text}]}>
                    {selectedEvent.title}
                  </Text>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.eventDetailText, {color: colors.text}]}>
                      {format(
                        new Date(selectedEvent.startDate),
                        'd MMMM yyyy',
                        {locale: tr},
                      )}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.eventDetailText, {color: colors.text}]}>
                      {selectedEvent.location.city},{' '}
                      {selectedEvent.location.district}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MaterialCommunityIcons
                      name="account-group"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.eventDetailText, {color: colors.text}]}>
                      {selectedEvent.currentParticipants}/
                      {selectedEvent.maxParticipants} Katılımcı
                    </Text>
                  </View>

                  {selectedEvent.description && (
                    <View style={styles.descriptionContainer}>
                      <Text
                        style={[styles.descriptionTitle, {color: colors.text}]}>
                        Açıklama
                      </Text>
                      <Text
                        style={[styles.descriptionText, {color: colors.text}]}>
                        {selectedEvent.description}
                      </Text>
                    </View>
                  )}

                  {selectedEvent.participationStatus !== 'JOINED' && (
                    <View style={styles.actionButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          {backgroundColor: colors.primary},
                        ]}
                        onPress={() => handleJoinEvent(selectedEvent.id)}
                        disabled={participation?.processing}>
                        {participation?.processing &&
                        participation.action === 'join' ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>
                              Katılıyorum
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          {backgroundColor: colors.notification},
                        ]}
                        onPress={() => {
                          // Alert.prompt Android'de çalışmıyor, doğrudan decline edelim
                          setDeclineReason('Katılamıyorum'); // Basit bir neden
                          handleDeclineEvent(selectedEvent.id);
                        }}
                        disabled={participation?.processing}>
                        {participation?.processing &&
                        participation.action === 'leave' ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={20}
                              color="white"
                            />
                            <Text style={styles.actionButtonText}>
                              Katılmıyorum
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedEvent.participationStatus === 'JOINED' && (
                    <View style={styles.participatingContainer}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.participatingText,
                          {color: colors.primary},
                        ]}>
                        Bu etkinliğe katılıyorsunuz
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.viewDetailButton,
                      {backgroundColor: colors.background},
                    ]}
                    onPress={() => {
                      setDetailModalVisible(false);
                      // Detay sayfasına yönlendirme düzeltmesi
                      try {
                        // @ts-ignore
                        navigation.navigate('EventDetail', {
                          eventId: selectedEvent.id,
                        });
                      } catch (error) {
                        console.error('Yönlendirme hatası:', error);
                        Alert.alert(
                          'Hata',
                          'Etkinlik detayları şu anda gösterilemiyor.',
                        );
                      }
                    }}>
                    <Text
                      style={[
                        styles.viewDetailButtonText,
                        {color: colors.text},
                      ]}>
                      Detayları Görüntüle
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
  } as TextStyle,
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
  },
  createButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  } as TextStyle,
  filters: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    marginRight: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xs,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  eventsList: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  eventTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
  } as TextStyle,
  eventDate: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  eventLocation: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  } as TextStyle,
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.spacing.sm,
  },
  participantCount: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: '60%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  eventDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  participatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  participatingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  viewDetailButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    textAlignVertical: 'top',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  tabText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as TextStyle,
});

export default EventsScreen;
