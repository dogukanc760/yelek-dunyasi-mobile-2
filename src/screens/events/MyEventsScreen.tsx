import React, {useState, useCallback, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useTheme, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Calendar, DateData} from 'react-native-calendars';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {Event} from '../../services/eventService';
import eventService from '../../services/eventService';
import {RootStackParamList} from '../../types/navigation';
import {useAuth} from '../../context/AuthContext';
import {COLORS, FONTS} from '../../constants';

type MyEventsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'list' | 'calendar';
type FilterType = 'past' | 'upcoming' | 'all';

interface Period {
  startingDay: boolean;
  endingDay: boolean;
  color: string;
}

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  dots?: Array<{color: string}>;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
  customStyles?: {
    container?: {
      backgroundColor?: string;
      borderWidth?: number;
      borderColor?: string;
      borderRadius?: number;
    };
  };
  splitColor?: boolean;
  periods?: Array<Period>;
  segments?: Array<{startAngle: number; endAngle: number; color: string}>;
}

// Tarih formatlama yardımcı fonksiyonu
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Tarih belirtilmemiş';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Geçersiz tarih';
    }
    return format(date, 'd MMMM yyyy', {locale: tr});
  } catch (error) {
    console.error('Tarih formatlanırken hata:', error);
    return 'Geçersiz tarih';
  }
};

export const MyEventsScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<MyEventsScreenNavigationProp>();
  const {user} = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<{
    participatedEvents: {
      past: Event[];
      upcoming: Event[];
    };
    nonParticipatedEvents: Event[];
  }>({
    participatedEvents: {
      past: [],
      upcoming: [],
    },
    nonParticipatedEvents: [],
  });

  // Etkinlikleri getir
  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await eventService.getUserClubEvents(user.id);
      if (response.isSuccess && response.data.data) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Etkinlikler alınırken hata:', error);
      Alert.alert('Hata', 'Etkinlikler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Aktif filtreye göre etkinlikleri filtrele
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı

    const allEvents = [
      ...events.participatedEvents.past,
      ...events.participatedEvents.upcoming,
      ...events.nonParticipatedEvents,
    ];

    if (activeFilter === 'past') {
      // Bitiş tarihi bugünden önce olan etkinlikler
      return allEvents.filter(event => {
        const endDate = event.endDate
          ? new Date(event.endDate)
          : new Date(event.startDate);
        return endDate < today;
      });
    } else if (activeFilter === 'upcoming') {
      // Bitiş tarihi bugün veya sonrası olan etkinlikler
      return allEvents.filter(event => {
        const endDate = event.endDate
          ? new Date(event.endDate)
          : new Date(event.startDate);
        return endDate >= today;
      });
    }
    // Tüm etkinlikler için
    return allEvents;
  }, [events, activeFilter]);

  // Başlığı güncelle
  useEffect(() => {
    let title = 'Etkinliklerim';
    if (activeFilter === 'past') {
      title = 'Geçmiş Etkinliklerim';
    } else if (activeFilter === 'upcoming') {
      title = 'Yaklaşan Etkinliklerim';
    }
    navigation.setOptions({title});
  }, [activeFilter, navigation]);

  // Takvimde işaretlenecek günleri hazırla
  const markedDates = useMemo(() => {
    const dates: Record<string, MarkedDate> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı

    // Önce tüm tarihleri ve etkinlikleri grupla
    const dateEventMap: Record<string, Array<{isParticipated: boolean}>> = {};

    // Aktif filtreye göre gösterilecek etkinlikleri belirle
    let eventsToShow: Event[] = [];
    if (activeFilter === 'past') {
      // Bitiş tarihi bugünden önce olan etkinlikler
      eventsToShow = [
        ...events.participatedEvents.past,
        ...events.participatedEvents.upcoming,
        ...events.nonParticipatedEvents,
      ].filter(event => {
        const endDate = event.endDate
          ? new Date(event.endDate)
          : new Date(event.startDate);
        return endDate < today;
      });
    } else if (activeFilter === 'upcoming') {
      // Bitiş tarihi bugün veya sonrası olan etkinlikler
      eventsToShow = [
        ...events.participatedEvents.upcoming,
        ...events.nonParticipatedEvents,
      ].filter(event => {
        const endDate = event.endDate
          ? new Date(event.endDate)
          : new Date(event.startDate);
        return endDate >= today;
      });
    } else {
      eventsToShow = [
        ...events.participatedEvents.past,
        ...events.participatedEvents.upcoming,
        ...events.nonParticipatedEvents,
      ];
    }

    // Önce başlangıç ve bitiş günlerini topla
    eventsToShow.forEach(event => {
      const startDate = event.startDate.split('T')[0];
      const endDate = event.endDate ? event.endDate.split('T')[0] : startDate;
      const isParticipated = [
        ...events.participatedEvents.past,
        ...events.participatedEvents.upcoming,
      ].some(e => e.id === event.id);

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Başlangıç ve bitiş günlerini kaydet
      [startDate, endDate].forEach(dateStr => {
        if (!dateEventMap[dateStr]) {
          dateEventMap[dateStr] = [];
        }
        dateEventMap[dateStr].push({isParticipated});
      });

      // Her gün için period ekle
      for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
      ) {
        const dateStr = date.toISOString().split('T')[0];

        if (!dates[dateStr]) {
          dates[dateStr] = {
            periods: [],
          };
        }

        // Period ekle
        dates[dateStr].periods?.push({
          startingDay: date.getTime() === start.getTime(),
          endingDay: date.getTime() === end.getTime(),
          color: isParticipated ? '#007AFF80' : '#FF3B3080',
        });
      }
    });

    // Başlangıç ve bitiş günlerini işaretle
    Object.entries(dateEventMap).forEach(([dateStr, events]) => {
      if (events.length > 0) {
        const segments = events.length;
        const segmentAngle = 360 / segments;

        dates[dateStr].customStyles = {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: events[0].isParticipated ? '#007AFF' : '#FF3B30',
            borderRadius: 16,
          },
        };
        dates[dateStr].marked = true;
        dates[dateStr].segments = events.map((event, index) => ({
          startAngle: index * segmentAngle,
          endAngle: (index + 1) * segmentAngle,
          color: event.isParticipated ? '#007AFF20' : '#FF3B3020',
        }));
      }

      // Seçili gün için özel stil
      if (dateStr === selectedDate) {
        dates[dateStr].selected = true;
        dates[dateStr].selectedColor = events[0].isParticipated
          ? '#007AFF'
          : '#FF3B30';
        dates[dateStr].selectedTextColor = '#FFFFFF';
      }
    });

    return dates;
  }, [selectedDate, events, activeFilter]);

  // Seçilen güne ait etkinlikleri de filtreye göre göster
  const handleDayPress = useCallback(
    (day: DateData) => {
      setSelectedDate(day.dateString);

      // Seçilen gündeki tüm etkinlikleri bul
      let eventsToShow: Event[] = [];
      if (activeFilter === 'past') {
        eventsToShow = events.participatedEvents.past;
      } else if (activeFilter === 'upcoming') {
        eventsToShow = [
          ...events.participatedEvents.upcoming,
          ...events.nonParticipatedEvents,
        ];
      } else {
        eventsToShow = [
          ...events.participatedEvents.past,
          ...events.participatedEvents.upcoming,
          ...events.nonParticipatedEvents,
        ];
      }

      const selectedDayEvents = eventsToShow.filter(event => {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : startDate;
        const selectedDate = new Date(day.dateString);

        // Seçilen tarih, etkinliğin başlangıç ve bitiş tarihleri arasında mı kontrol et
        return selectedDate >= startDate && selectedDate <= endDate;
      });

      setSelectedEvents(selectedDayEvents);
      if (selectedDayEvents.length > 0) {
        setModalVisible(true);
      }
    },
    [events, activeFilter],
  );

  const handleEventDetail = (event: Event) => {
    try {
      navigation.navigate('EventDetail', {
        id: event.id,
      });
    } catch (error) {
      console.error('Yönlendirme hatası:', error);
      Alert.alert('Hata', 'Etkinlik detayları şu anda gösterilemiyor.');
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const isParticipatedEvent = (event: Event) => {
    return [
      ...events.participatedEvents.past,
      ...events.participatedEvents.upcoming,
    ].some(e => e.id === event.id);
  };

  const renderEventItem = ({item}: {item: Event}) => (
    <TouchableOpacity
      style={[styles.eventCard, {backgroundColor: colors.card}]}
      onPress={() => handleEventDetail(item)}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <Text
            style={[styles.eventTitle, {color: colors.text}]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.eventStatusContainer}>
            <View
              style={[
                styles.participationStatus,
                {
                  backgroundColor: isParticipatedEvent(item)
                    ? COLORS.primaryLight
                    : '#FFE5E5',
                },
              ]}>
              <Text
                style={[
                  styles.participationStatusText,
                  {
                    color: isParticipatedEvent(item)
                      ? COLORS.primary
                      : COLORS.error,
                  },
                ]}>
                {isParticipatedEvent(item) ? 'Katıldım' : 'Katılmadım'}
              </Text>
            </View>
            <View style={styles.eventTypeContainer}>
              <MaterialCommunityIcons
                name={item.type === 'ride' ? 'motorbike' : 'calendar'}
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.eventType, {color: colors.primary}]}>
                {item.type === 'ride' ? 'Sürüş' : 'Toplantı'}
              </Text>
            </View>
          </View>
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
            {formatDate(item.startDate)}
          </Text>
        </View>
        <View style={styles.eventLocationContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.eventLocation, {color: COLORS.textSecondary}]}>
            {item.startLocation || 'Konum belirtilmemiş'}
          </Text>
        </View>
      </View>
      <View style={styles.eventFooter}>
        <View style={styles.eventClubContainer}>
          <Image
            source={{
              uri: item.club?.logo || 'https://via.placeholder.com/40',
            }}
            style={styles.eventClubLogo}
          />
          <Text style={[styles.eventClubName, {color: colors.text}]}>
            {item.club?.name || 'Kulüp belirtilmemiş'}
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
            {item.currentParticipants}/{item.maxParticipants}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Custom Day Component
  const CustomDay = (props: any) => {
    const {date, marking, state, theme, onPress} = props;

    if (!date) return null;

    const isDisabled = state === 'disabled';
    const isToday = state === 'today';

    const renderSegments = () => {
      if (!marking?.segments) return null;

      return (
        <View style={styles.segmentsContainer}>
          {marking.segments.map((segment: any, index: number) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor: segment.color,
                  transform: [
                    {rotate: `${segment.startAngle}deg`},
                    {translateX: -16},
                    {translateY: -16},
                  ],
                  width: 32,
                  height: 32,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  borderTopRightRadius: 16,
                  borderBottomRightRadius:
                    segment.endAngle - segment.startAngle > 180 ? 16 : 0,
                  borderTopLeftRadius:
                    segment.endAngle - segment.startAngle > 180 ? 16 : 0,
                },
              ]}
            />
          ))}
        </View>
      );
    };

    return (
      <TouchableOpacity
        style={[styles.dayContainer]}
        onPress={() => onPress?.(date)}>
        {/* Period çizgileri */}
        {marking?.periods && marking.periods.length > 0 && (
          <View style={styles.periodContainer}>
            {marking.periods.map((period: Period, index: number) => (
              <View
                key={index}
                style={[
                  styles.periodLine,
                  {
                    backgroundColor: period.color,
                    marginTop: index * 12,
                  },
                  period.startingDay && styles.periodLineStart,
                  period.endingDay && styles.periodLineEnd,
                ]}
              />
            ))}
          </View>
        )}

        {/* Gün içeriği */}
        <View
          style={[
            styles.dayContent,
            marking?.customStyles?.container,
            marking?.selected && {
              backgroundColor: marking.selectedColor,
            },
          ]}>
          {renderSegments()}
          {/* Gün numarası */}
          <Text
            style={[
              styles.dayText,
              isDisabled && {color: theme?.textDisabledColor},
              isToday && {color: theme?.todayTextColor},
              marking?.selected && {color: '#FFFFFF'},
            ]}>
            {date.day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => handleFilterChange('all')}>
          <Text
            style={[
              styles.filterText,
              {color: activeFilter === 'all' ? colors.primary : colors.text},
            ]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'upcoming' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
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
            activeFilter === 'past' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
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
      </View>

      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'list' && styles.activeViewMode,
          ]}
          onPress={() => setViewMode('list')}>
          <View style={styles.viewModeContent}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={24}
              color={viewMode === 'list' ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.viewModeText,
                {color: viewMode === 'list' ? colors.primary : colors.text},
              ]}>
              Liste
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'calendar' && styles.activeViewMode,
          ]}
          onPress={() => setViewMode('calendar')}>
          <View style={styles.viewModeContent}>
            <MaterialCommunityIcons
              name="calendar-month"
              size={24}
              color={viewMode === 'calendar' ? colors.primary : colors.text}
            />
            <Text
              style={[
                styles.viewModeText,
                {color: viewMode === 'calendar' ? colors.primary : colors.text},
              ]}>
              Takvim
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={48}
                color={colors.text}
              />
              <Text style={[styles.emptyText, {color: colors.text}]}>
                Henüz etkinlik bulunmuyor
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            markingType="multi-period"
            theme={{
              todayTextColor: colors.primary,
              selectedDayBackgroundColor: colors.primary,
              arrowColor: colors.primary,
              textDayFontFamily: FONTS.FONT_FAMILY.medium,
              textMonthFontFamily: FONTS.FONT_FAMILY.bold,
              textDayHeaderFontFamily: FONTS.FONT_FAMILY.medium,
            }}
            dayComponent={CustomDay}
          />
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {selectedDate ? formatDate(selectedDate) : 'Seçilen Tarih'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedEvents}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    gap: 16,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  viewModeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  viewModeText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    marginLeft: 4,
  },
  activeViewMode: {
    backgroundColor: COLORS.primaryLight,
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  eventStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  participationStatusText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
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
    marginLeft: 4,
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 8,
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
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
  },
  eventClubLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  eventClubName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  eventParticipantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventParticipants: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
  },
  modalList: {
    paddingBottom: 16,
  },
  dayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 1,
  },
  dayContent: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  dayText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    color: '#000000',
    zIndex: 1,
  },
  customDayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  customDayHalf: {
    flex: 1,
    height: '100%',
  },
  periodContainer: {
    position: 'absolute',
    top: '50%',
    left: -20,
    right: -20,
    height: 24,
    justifyContent: 'center',
    zIndex: -1,
  },
  periodLine: {
    position: 'absolute',
    height: 4,
    left: 0,
    right: 0,
    borderRadius: 2,
    marginVertical: 4,
  },
  periodLineStart: {
    left: 30,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  periodLineEnd: {
    right: 30,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentsContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    overflow: 'hidden',
    borderRadius: 16,
  },
  segment: {
    position: 'absolute',
    transformOrigin: 'left center',
  },
});
