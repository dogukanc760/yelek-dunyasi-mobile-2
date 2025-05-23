import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  useTheme,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../constants/theme';
import {Club} from '../../services/clubService';
import clubService from '../../services/clubService';

type ClubsListScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
type ClubsListScreenRouteProp = RouteProp<
  RootStackParamList,
  'ClubsListScreen'
>;

export const ClubsListScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<ClubsListScreenNavigationProp>();
  const route = useRoute<ClubsListScreenRouteProp>();

  // Route parametrelerini al
  const routeCategoryId = route.params?.categoryId;
  const routeTagId = route.params?.tagId;
  const routeSearchQuery = route.params?.searchQuery;

  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery || '');
  const [cityFilter, setCityFilter] = useState<string | null>(
    routeCategoryId || null,
  );
  const [tagFilter, setTagFilter] = useState<string | null>(routeTagId || null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mevcut tüm şehirleri ve etiketleri çıkar
  const allCities = [...new Set(clubs.map(club => club.city))];
  const allTags = [...new Set(clubs.flatMap(club => club.tags))];

  const fetchClubs = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) {
          setPage(1);
          setHasMore(true);
        }

        if (!hasMore && !isRefreshing) return;

        const currentPage = isRefreshing ? 1 : page;
        const response = await clubService.getClubs({
          page: currentPage,
          limit: 10,
          city: cityFilter || undefined,
          search: searchQuery || undefined,
          tags: tagFilter ? [tagFilter] : undefined,
          categoryId: routeCategoryId,
          tagId: routeTagId,
        });

        const clubsArr = Array.isArray(response.data) ? response.data : [];
        if (isRefreshing) {
          setClubs(clubsArr);
        } else {
          setClubs(prev => [...prev, ...clubsArr]);
        }

        setHasMore(clubsArr.length === 10);
        setPage(currentPage + 1);
      } catch (error) {
        console.error('Kulüpler yüklenirken hata:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      hasMore,
      cityFilter,
      searchQuery,
      tagFilter,
      routeCategoryId,
      routeTagId,
    ],
  );

  useEffect(() => {
    fetchClubs(true);
  }, [fetchClubs]);

  useEffect(() => {
    // Route parametreleri değiştiğinde filtreleri güncelle
    if (routeCategoryId) {
      setCityFilter(routeCategoryId);
    }

    if (routeTagId) {
      setTagFilter(routeTagId);
    }

    if (routeSearchQuery) {
      setSearchQuery(routeSearchQuery);
    }
  }, [routeCategoryId, routeTagId, routeSearchQuery]);

  useEffect(() => {
    // Başlığı güncelle
    let title = 'Kulüpler';
    if (tagFilter) {
      title = `${tagFilter} Kulüpleri`;
    } else if (cityFilter) {
      title = `${cityFilter} Kulüpleri`;
    } else if (searchQuery) {
      title = `"${searchQuery}" için Sonuçlar`;
    }
    navigation.setOptions({title});
  }, [clubs, searchQuery, cityFilter, tagFilter, navigation]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
    setHasMore(true);
    fetchClubs(true);
  };

  const clearFilters = () => {
    setCityFilter(null);
    setTagFilter(null);
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
    fetchClubs(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchClubs();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClubs(true);
  };

  const renderClubCard = ({item}: {item: Club}) => (
    <TouchableOpacity
      style={[styles.clubCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('ClubDetail', {id: item.id})}>
      <View style={styles.clubHeader}>
        <Image
          source={{
            uri:
              'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
              item.logo.replace('/public', ''),
          }}
          style={styles.clubLogo}
        />
        <View style={styles.clubInfo}>
          <Text style={[styles.clubName, {color: colors.text}]}>
            {item.name}
          </Text>
          <View style={styles.clubLocation}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text
              style={[styles.clubLocationText, {color: COLORS.textSecondary}]}>
              {item.city}
              {item.district ? `, ${item.district}` : ''}
            </Text>
          </View>
        </View>
        {item.isJoined && (
          <View style={styles.joinedBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={colors.primary}
            />
          </View>
        )}
      </View>
      <Text
        style={[styles.clubDescription, {color: colors.text}]}
        numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.clubFooter}>
        <View style={styles.memberCount}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.memberCountText, {color: COLORS.textSecondary}]}>
            {item.memberCount} üye
          </Text>
        </View>
        <View style={styles.tagsContainer}>
          {(item.tags || []).slice(0, 2).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, {backgroundColor: colors.background}]}>
              <Text style={{color: COLORS.textSecondary, fontSize: 12}}>
                {tag}
              </Text>
            </View>
          ))}
          {Array.isArray(item.tags) && item.tags.length > 2 && (
            <Text style={[styles.moreTag, {color: COLORS.textSecondary}]}>
              +{item.tags.length - 2}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={COLORS.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, {color: colors.text}]}
          placeholder="Kulüp ara..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.filterButton, {backgroundColor: colors.card}]}
        onPress={() => setShowFilters(!showFilters)}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={24}
          color={
            cityFilter || tagFilter ? colors.primary : COLORS.textSecondary
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersContainer, {backgroundColor: colors.card}]}>
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, {color: colors.text}]}>Şehir</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}>
          <TouchableOpacity
            style={[styles.filterChip, !cityFilter && styles.filterChipActive]}
            onPress={() => setCityFilter(null)}>
            <Text
              style={[
                styles.filterChipText,
                !cityFilter && styles.filterChipTextActive,
              ]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {allCities.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                city === cityFilter && styles.filterChipActive,
              ]}
              onPress={() => setCityFilter(city === cityFilter ? null : city)}>
              <Text
                style={[
                  styles.filterChipText,
                  city === cityFilter && styles.filterChipTextActive,
                ]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, {color: colors.text}]}>
          Etiketler
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}>
          <TouchableOpacity
            style={[styles.filterChip, !tagFilter && styles.filterChipActive]}
            onPress={() => setTagFilter(null)}>
            <Text
              style={[
                styles.filterChipText,
                !tagFilter && styles.filterChipTextActive,
              ]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {allTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                tag === tagFilter && styles.filterChipActive,
              ]}
              onPress={() => setTagFilter(tag === tagFilter ? null : tag)}>
              <Text
                style={[
                  styles.filterChipText,
                  tag === tagFilter && styles.filterChipTextActive,
                ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {(cityFilter || tagFilter) && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={clearFilters}>
          <Text style={[styles.clearFiltersText, {color: colors.primary}]}>
            Filtreleri Temizle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {renderHeader()}
      {showFilters && renderFilters()}
      <FlatList
        data={clubs}
        renderItem={renderClubCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="account-group"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={[styles.emptyText, {color: colors.text}]}>
                Kulüp bulunamadı
              </Text>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  listContainer: {
    padding: 16,
  },
  clubCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  clubLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubLocationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  joinedBadge: {
    marginLeft: 8,
  },
  clubDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  moreTag: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginTop: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default ClubsListScreen;
