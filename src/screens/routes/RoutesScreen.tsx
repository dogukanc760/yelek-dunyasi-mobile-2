import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
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
import {COLORS, SIZES} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Route} from '../../services/routeService';
import {mockPopularRoutes} from '../../data/mockRoutes';

type RoutesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutesScreenRouteProp = RouteProp<RootStackParamList, 'PopularRoutes'>;

const RoutesScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<RoutesScreenNavigationProp>();
  const route = useRoute<RoutesScreenRouteProp>();

  // Route parametrelerini al
  const routeSearchQuery = route.params?.searchQuery;
  const routeCityFilter = route.params?.cityFilter;
  const routeDifficultyFilter = route.params?.difficultyFilter;
  const routeTypeFilter = route.params?.typeFilter;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(routeSearchQuery || '');
  const [cityFilter, setCityFilter] = useState<string | null>(
    routeCityFilter || null,
  );
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(
    routeDifficultyFilter || null,
  );
  const [typeFilter, setTypeFilter] = useState<string | null>(
    routeTypeFilter || null,
  );
  const [showFilters, setShowFilters] = useState(false);

  // Mevcut tüm şehirleri, zorluk seviyelerini ve rota türlerini çıkar
  const allCities = [...new Set(mockPopularRoutes.map(route => route.city))];
  const allDifficulties = [
    ...new Set(mockPopularRoutes.map(route => route.difficulty)),
  ];
  const allTypes = [...new Set(mockPopularRoutes.map(route => route.type))];

  useEffect(() => {
    // Mock veri yükleme
    setTimeout(() => {
      setRoutes(mockPopularRoutes);
      setFilteredRoutes(mockPopularRoutes);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Route parametreleri değiştiğinde filtreleri güncelle
    if (routeSearchQuery) {
      setSearchQuery(routeSearchQuery);
    }

    if (routeCityFilter) {
      setCityFilter(routeCityFilter);
    }

    if (routeDifficultyFilter) {
      setDifficultyFilter(routeDifficultyFilter);
    }

    if (routeTypeFilter) {
      setTypeFilter(routeTypeFilter);
    }
  }, [
    routeSearchQuery,
    routeCityFilter,
    routeDifficultyFilter,
    routeTypeFilter,
  ]);

  useEffect(() => {
    // Filtreleme işlemi
    let result = routes;

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        route =>
          route.name.toLowerCase().includes(lowerQuery) ||
          route.description.toLowerCase().includes(lowerQuery),
      );
    }

    // Şehre göre filtrele
    if (cityFilter) {
      result = result.filter(route => route.city === cityFilter);
    }

    // Zorluk seviyesine göre filtrele
    if (difficultyFilter) {
      result = result.filter(route => route.difficulty === difficultyFilter);
    }

    // Rota türüne göre filtrele
    if (typeFilter) {
      result = result.filter(route => route.type === typeFilter);
    }

    setFilteredRoutes(result);

    // Başlığı güncelle
    let title = 'Popüler Rotalar';
    if (difficultyFilter) {
      title = `${getDifficultyText(difficultyFilter)} Rotalar`;
    } else if (typeFilter) {
      title = `${getTypeText(typeFilter)} Rotalar`;
    } else if (cityFilter) {
      title = `${cityFilter} Rotaları`;
    } else if (searchQuery) {
      title = `"${searchQuery}" için Sonuçlar`;
    }
    navigation.setOptions({title});
  }, [
    routes,
    searchQuery,
    cityFilter,
    difficultyFilter,
    typeFilter,
    navigation,
  ]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearFilters = () => {
    setCityFilter(null);
    setDifficultyFilter(null);
    setTypeFilter(null);
    setSearchQuery('');
  };

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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'ROAD':
        return 'Asfalt';
      case 'MOUNTAIN':
        return 'Dağ';
      case 'GRAVEL':
        return 'Çakıl';
      case 'URBAN':
        return 'Şehir İçi';
      case 'MIXED':
        return 'Karışık';
      default:
        return type;
    }
  };

  const renderRouteItem = ({item}: {item: Route}) => (
    <TouchableOpacity
      style={[styles.routeCard, {backgroundColor: colors.card}]}
      onPress={() => navigation.navigate('RouteDetail', {id: item.id})}>
      <Image source={{uri: item.imageUrl}} style={styles.routeImage} />
      <View style={styles.routeContent}>
        <Text style={[styles.routeName, {color: colors.text}]}>
          {item.name}
        </Text>

        <View style={styles.routeStats}>
          <View style={styles.routeStat}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={{color: colors.text}}>{item.distance} km</Text>
          </View>
          <View style={styles.routeStat}>
            <MaterialCommunityIcons
              name="trending-up"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={{color: colors.text}}>{item.elevation} m</Text>
          </View>
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.routeLocation}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.locationText, {color: colors.text}]}>
              {item.city}, {item.district}
            </Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              {
                backgroundColor: getDifficultyColor(item.difficulty),
              },
            ]}>
            <Text style={styles.difficultyText}>
              {getDifficultyText(item.difficulty)}
            </Text>
          </View>
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
          placeholder="Rota ara..."
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
            cityFilter || difficultyFilter || typeFilter
              ? colors.primary
              : COLORS.textSecondary
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
          Zorluk Seviyesi
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}>
          {allDifficulties.map((difficulty, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                difficultyFilter === difficulty && {
                  backgroundColor: getDifficultyColor(difficulty),
                },
              ]}
              onPress={() =>
                setDifficultyFilter(
                  difficultyFilter === difficulty ? null : difficulty,
                )
              }>
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      difficultyFilter === difficulty ? 'white' : colors.text,
                  },
                ]}>
                {getDifficultyText(difficulty)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, {color: colors.text}]}>
          Rota Türü
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}>
          {allTypes.map((type, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterChip,
                typeFilter === type && {backgroundColor: colors.primary},
              ]}
              onPress={() => setTypeFilter(typeFilter === type ? null : type)}>
              <Text
                style={[
                  styles.filterChipText,
                  {color: typeFilter === type ? 'white' : colors.text},
                ]}>
                {getTypeText(type)}
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
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      {renderHeader()}

      {showFilters && renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.text}]}>
            Rotalar yükleniyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRouteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.routesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={40}
                color={COLORS.textSecondary}
              />
              <Text style={[styles.emptyText, {color: colors.text}]}>
                {searchQuery || cityFilter || difficultyFilter || typeFilter
                  ? 'Arama kriterlerine uygun rota bulunamadı'
                  : 'Henüz rota bulunmuyor'}
              </Text>
              {(searchQuery ||
                cityFilter ||
                difficultyFilter ||
                typeFilter) && (
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
    </SafeAreaView>
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
    backgroundColor: COLORS.card,
  },
  filterChipText: {
    fontSize: 14,
  },
  clearFiltersButton: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  clearButton: {
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  routesList: {
    padding: SIZES.spacing.md,
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
    marginTop: 10,
  },
  routeCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  routeContent: {
    padding: 16,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RoutesScreen;
