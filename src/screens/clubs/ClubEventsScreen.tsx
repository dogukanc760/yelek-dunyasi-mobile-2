import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useTheme,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format, compareDesc} from 'date-fns';
import {tr} from 'date-fns/locale';
import EventService from '../../services/eventService';

type ClubEventsScreenRouteProp = RouteProp<RootStackParamList, 'ClubEvents'>;
type ClubEventsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const ClubEventsScreen = () => {
  const {colors} = useTheme();
  const route = useRoute<ClubEventsScreenRouteProp>();
  const navigation = useNavigation<ClubEventsScreenNavigationProp>();
  const {clubId} = route.params;

  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtreleme state'leri
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Sıralama state'i
  const [sortBy, setSortBy] = useState<string>('date');

  const eventTypes = [
    {id: 'ride', label: 'Sürüş'},
    {id: 'meeting', label: 'Toplantı'},
  ];

  const eventStatuses = [
    {id: 'draft', label: 'Taslak'},
    {id: 'planned', label: 'Planlandı'},
    {id: 'active', label: 'Aktif'},
    {id: 'completed', label: 'Tamamlandı'},
    {id: 'cancelled', label: 'İptal Edildi'},
  ];

  const sortOptions = [
    {id: 'date', label: 'Tarihe Göre', icon: 'calendar'},
    {id: 'title', label: 'İsme Göre', icon: 'sort-alphabetical-ascending'},
    {
      id: 'participants',
      label: 'Katılımcı Sayısına Göre',
      icon: 'account-group',
    },
    {id: 'status', label: 'Duruma Göre', icon: 'format-list-checks'},
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await EventService.getClubEventsForManagement(
          clubId,
          'ALL',
          1,
          10,
        );
        console.log('API Response:', response);
        console.log('Response data:', response.data);

        if (response.isSuccess && Array.isArray(response.data)) {
          setEvents(response.data);
          setFilteredEvents(response.data);
        } else if (response.isSuccess && Array.isArray(response.data?.data)) {
          setEvents(response.data.data);
          setFilteredEvents(response.data.data);
        } else {
          console.error('Unexpected data format:', response);
          setEvents([]);
          setFilteredEvents([]);
        }

        setError(null);
      } catch (err) {
        console.error('Etkinlikler yüklenirken hata detayı:', err);
        setError('Etkinlikler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [clubId]);

  // Sıralama fonksiyonu
  const sortEvents = useCallback(
    (eventsToSort: any[]) => {
      return [...eventsToSort].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return compareDesc(new Date(a.startDate), new Date(b.startDate));
          case 'title':
            return a.title.localeCompare(b.title, 'tr');
          case 'participants':
            return b.participantCount - a.participantCount;
          case 'status':
            return a.status.localeCompare(b.status, 'tr');
          default:
            return 0;
        }
      });
    },
    [sortBy],
  );

  // Filtreleme fonksiyonu güncellendi
  useEffect(() => {
    const filterAndSortEvents = () => {
      let filtered = [...events];

      // Metin araması
      if (searchText) {
        filtered = filtered.filter(event =>
          event.title.toLowerCase().includes(searchText.toLowerCase()),
        );
      }

      // Tür filtresi
      if (selectedType) {
        filtered = filtered.filter(event => event.type === selectedType);
      }

      // Durum filtresi
      if (selectedStatus) {
        filtered = filtered.filter(event => event.status === selectedStatus);
      }

      // Sıralama
      filtered = sortEvents(filtered);

      setFilteredEvents(filtered);
    };

    filterAndSortEvents();
  }, [searchText, selectedType, selectedStatus, events, sortEvents]);

  const renderFilterChip = (
    id: string | null,
    label: string,
    isSelected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? colors.primary : colors.card,
        },
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.filterChipText,
          {color: isSelected ? COLORS.white : colors.text},
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={[styles.filterTitle, {color: colors.text}]}>Sıralama</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              {
                backgroundColor:
                  sortBy === option.id ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setSortBy(option.id)}>
            <MaterialCommunityIcons
              name={option.icon}
              size={16}
              color={sortBy === option.id ? COLORS.white : colors.text}
            />
            <Text
              style={[
                styles.sortChipText,
                {color: sortBy === option.id ? COLORS.white : colors.text},
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TextInput
        style={[
          styles.searchInput,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Etkinlik ara..."
        placeholderTextColor={COLORS.textSecondary}
        value={searchText}
        onChangeText={setSearchText}
      />

      {renderSortOptions()}

      <Text style={[styles.filterTitle, {color: colors.text}]}>Tür</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}>
        {renderFilterChip(null, 'Tümü', !selectedType, () =>
          setSelectedType(null),
        )}
        {eventTypes.map(type =>
          renderFilterChip(type.id, type.label, selectedType === type.id, () =>
            setSelectedType(type.id),
          ),
        )}
      </ScrollView>

      <Text style={[styles.filterTitle, {color: colors.text}]}>Durum</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}>
        {renderFilterChip(null, 'Tümü', !selectedStatus, () =>
          setSelectedStatus(null),
        )}
        {eventStatuses.map(status =>
          renderFilterChip(
            status.id,
            status.label,
            selectedStatus === status.id,
            () => setSelectedStatus(status.id),
          ),
        )}
      </ScrollView>
    </View>
  );

  const renderEventItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[styles.eventItem, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('EventDetail', {
          id: item.id,
        })
      }>
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, {color: colors.text}]}>
          {item.title}
        </Text>
        <View style={styles.eventType}>
          <MaterialCommunityIcons
            name={item.type === 'ride' ? 'motorbike' : 'calendar-clock'}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.eventTypeText, {color: colors.primary}]}>
            {item.type === 'ride' ? 'Sürüş' : 'Toplantı'}
          </Text>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <View style={styles.eventInfoItem}>
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
            {format(new Date(item.startDate), 'd MMM yyyy', {locale: tr})}
          </Text>
        </View>
        {item.locationName && (
          <View style={styles.eventInfoItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
              {item.locationName}
            </Text>
          </View>
        )}
        <View style={styles.eventInfoItem}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
            {item.participantCount}/{item.maxParticipants || '∞'} katılımcı
          </Text>
        </View>
        {item.status && (
          <View
            style={[
              styles.statusContainer,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        )}
      </View>
      {item.description && (
        <Text
          style={[styles.description, {color: COLORS.textSecondary}]}
          numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'rgba(156, 163, 175, 0.2)';
      case 'planned':
        return 'rgba(59, 130, 246, 0.2)';
      case 'active':
        return 'rgba(34, 197, 94, 0.2)';
      case 'completed':
        return 'rgba(139, 92, 246, 0.2)';
      case 'cancelled':
        return 'rgba(239, 68, 68, 0.2)';
      default:
        return 'rgba(156, 163, 175, 0.2)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Taslak';
      case 'planned':
        return 'Planlandı';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={[styles.emptyText, {color: colors.text}]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={[styles.errorText, {color: COLORS.error}]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {renderFilters()}
      <Text style={[styles.debugText, {color: colors.text}]}>
        Toplam Etkinlik: {filteredEvents.length}
      </Text>
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
            {searchText || selectedType || selectedStatus
              ? 'Filtrelenen sonuç bulunamadı...'
              : 'Henüz etkinlik bulunmuyor...'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    marginLeft: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfoText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    marginLeft: 4,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
  errorText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    marginTop: 8,
  },
  debugText: {
    padding: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  filtersContainer: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  filterTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
  },
  sortContainer: {
    marginVertical: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sortChipText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    marginLeft: 4,
  },
});

export default ClubEventsScreen;
