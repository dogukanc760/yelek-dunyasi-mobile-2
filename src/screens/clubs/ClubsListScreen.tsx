import React, {useState, useEffect} from 'react';
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
import {COLORS, SIZES} from '../../constants';
import {Club} from '../../services/clubService';
import {mockClubs} from '../../data/mockClubs';

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
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery || '');
  const [cityFilter, setCityFilter] = useState<string | null>(
    routeCategoryId || null,
  );
  const [tagFilter, setTagFilter] = useState<string | null>(routeTagId || null);
  const [showFilters, setShowFilters] = useState(false);

  // Mevcut tüm şehirleri ve etiketleri çıkar
  const allCities = [...new Set(mockClubs.map(club => club.city))];
  const allTags = [...new Set(mockClubs.flatMap(club => club.tags))];

  useEffect(() => {
    // Mock veri yükleme
    setLoading(true);
    setTimeout(() => {
      setClubs(mockClubs);
      setFilteredClubs(mockClubs);
      setLoading(false);
    }, 500);
  }, []);

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
    // Filtreleme işlemi
    let result = clubs;

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        club =>
          club.name.toLowerCase().includes(lowerQuery) ||
          club.description.toLowerCase().includes(lowerQuery),
      );
    }

    // Şehre göre filtrele
    if (cityFilter) {
      result = result.filter(club => club.city === cityFilter);
    }

    // Etikete göre filtrele
    if (tagFilter) {
      result = result.filter(club => club.tags.includes(tagFilter));
    }

    setFilteredClubs(result);

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
  };

  const clearFilters = () => {
    setCityFilter(null);
    setTagFilter(null);
    setSearchQuery('');
  };

  const renderClubCard = ({item}: {item: Club}) => (
    <TouchableOpacity
      style={[styles.clubCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('ClubDetail', {id: item.id})}>
      <View style={styles.clubHeader}>
        <Image source={{uri: item.logoUrl}} style={styles.clubLogo} />
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
          {item.tags.slice(0, 2).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, {backgroundColor: colors.background}]}>
              <Text style={{color: COLORS.textSecondary, fontSize: 12}}>
                {tag}
              </Text>
            </View>
          ))}
          {item.tags.length > 2 && (
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
          {allCities.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                cityFilter === city && {backgroundColor: colors.primary},
              ]}
              onPress={() => setCityFilter(cityFilter === city ? null : city)}>
              <Text
                style={[
                  styles.filterChipText,
                  {color: cityFilter === city ? 'white' : colors.text},
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
          {allTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                tagFilter === tag && {backgroundColor: colors.primary},
              ]}
              onPress={() => setTagFilter(tagFilter === tag ? null : tag)}>
              <Text
                style={[
                  styles.filterChipText,
                  {color: tagFilter === tag ? 'white' : colors.text},
                ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={clearFilters}>
        <Text style={{color: colors.primary, fontWeight: '500'}}>
          Tüm Filtreleri Temizle
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {renderHeader()}

      {showFilters && renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{color: colors.text, marginTop: 10}}>
            Kulüpler yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClubs}
          renderItem={renderClubCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={50}
                color={COLORS.textSecondary}
              />
              <Text style={[styles.emptyText, {color: colors.text}]}>
                {searchQuery || cityFilter || tagFilter
                  ? 'Arama kriterlerine uygun kulüp bulunamadı'
                  : 'Henüz kulüp bulunmuyor'}
              </Text>
              {(searchQuery || cityFilter || tagFilter) && (
                <TouchableOpacity
                  onPress={clearFilters}
                  style={styles.clearButton}>
                  <Text style={{color: colors.primary}}>
                    Filtreleri Temizle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: 8,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.spacing.sm,
    fontSize: 16,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  filtersContainer: {
    padding: SIZES.spacing.md,
    marginHorizontal: SIZES.spacing.md,
    borderRadius: 8,
    marginBottom: SIZES.spacing.md,
  },
  filterSection: {
    marginBottom: SIZES.spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.sm,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: SIZES.spacing.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  filterChipText: {
    fontSize: 14,
  },
  clearFiltersButton: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  listContainer: {
    padding: SIZES.spacing.md,
  },
  clubCard: {
    borderRadius: 8,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  clubLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  clubInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  clubName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  clubLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubLocationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  joinedBadge: {
    padding: 4,
  },
  clubDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SIZES.spacing.md,
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
    marginLeft: 4,
  },
  moreTag: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  clearButton: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
  },
});
