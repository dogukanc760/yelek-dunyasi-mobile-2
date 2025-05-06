import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useTheme,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, SIZES} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Route} from '../../services/routeService';
import {mockPopularRoutes} from '../../data/mockRoutes';

type RouteDetailScreenRouteProp = RouteProp<RootStackParamList, 'RouteDetail'>;
type RouteDetailScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Google Maps'e yönlendirme işlevi
const openInGoogleMaps = (routeData: Route) => {
  // Başlangıç ve bitiş noktalarını kontrol et
  if (!routeData.startPoint || !routeData.endPoint) {
    Alert.alert(
      'Rota Bulunamadı',
      'Bu rotanın başlangıç ve bitiş noktaları belirtilmemiş.',
    );
    return;
  }

  // RouteData bilgisini kontrol et
  if (!routeData.routeData) {
    Alert.alert(
      'Rota Verisi Bulunamadı',
      'Bu rota için navigasyon verileri bulunmuyor.',
    );
    return;
  }

  const {startPoint, endPoint, name, routeData: rData} = routeData;

  // Ara noktaları oluştur (waypoints)
  let waypointsStr = '';
  if (rData.waypoints && rData.waypoints.length > 0) {
    if (Platform.OS === 'android') {
      // Android için en fazla 10 waypoint destekleniyor
      const maxWaypoints = rData.waypoints.slice(0, 10);
      waypointsStr = `&waypoints=${maxWaypoints
        .map(
          (wp: {latitude: number; longitude: number}) =>
            `${wp.latitude},${wp.longitude}`,
        )
        .join('|')}`;
    } else {
      // iOS için ara noktalar direkt eklenemiyor, sadece başlangıç ve bitiş kullanılıyor
    }
  }

  const url = Platform.select({
    ios: `https://maps.apple.com/?saddr=${startPoint.latitude},${startPoint.longitude}&daddr=${endPoint.latitude},${endPoint.longitude}&dirflg=d`,
    android: `https://www.google.com/maps/dir/?api=1&origin=${
      startPoint.latitude
    },${startPoint.longitude}&destination=${endPoint.latitude},${
      endPoint.longitude
    }${waypointsStr}&travelmode=${rData.mode.toLowerCase()}&dir_action=navigate&name=${encodeURIComponent(
      name,
    )}`,
  });

  Linking.canOpenURL(url!)
    .then(supported => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Alert.alert(
          'Harita Uygulaması Açılamadı',
          'Cihazınızda harita uygulaması bulunamadı veya açılamadı.',
        );
      }
    })
    .catch(err => console.error('Haritalara yönlendirirken hata oluştu:', err));
};

const RouteDetailScreen: React.FC = () => {
  const {colors} = useTheme();
  const route = useRoute<RouteDetailScreenRouteProp>();
  const navigation = useNavigation<RouteDetailScreenNavigationProp>();
  const {id} = route.params;
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteDetail = async () => {
      try {
        setLoading(true);
        // Mock veri kullanıyoruz gerçek API'ye geçince değiştirilecek
        setTimeout(() => {
          const foundRoute = mockPopularRoutes.find(r => r.id === id);
          setRouteData(foundRoute || null);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Rota detayı alınırken hata:', error);
        setLoading(false);
      }
    };

    fetchRouteDetail();
  }, [id]);

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

  // Rotaya Git butonuna tıklama işlevi
  const handleNavigateToRoute = () => {
    if (routeData) {
      openInGoogleMaps(routeData);
    } else {
      Alert.alert('Rota Bulunamadı', 'Bu rotaya ait bilgiler bulunamadı.');
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          Rota bilgileri yükleniyor...
        </Text>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={40}
          color={COLORS.error}
        />
        <Text style={[styles.errorText, {color: colors.text}]}>
          Rota bulunamadı
        </Text>
        <TouchableOpacity
          style={[styles.backButton, {backgroundColor: colors.primary}]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView>
        <Image source={{uri: routeData.imageUrl}} style={styles.routeImage} />

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={[styles.routeName, {color: colors.text}]}>
              {routeData.name}
            </Text>
            <View
              style={[
                styles.difficultyBadge,
                {backgroundColor: getDifficultyColor(routeData.difficulty)},
              ]}>
              <Text style={styles.difficultyText}>
                {getDifficultyText(routeData.difficulty)}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statValue, {color: colors.text}]}>
                {routeData.distance} km
              </Text>
              <Text style={[styles.statLabel, {color: COLORS.textSecondary}]}>
                Mesafe
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="trending-up"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statValue, {color: colors.text}]}>
                {routeData.elevation} m
              </Text>
              <Text style={[styles.statLabel, {color: COLORS.textSecondary}]}>
                Tırmanış
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statValue, {color: colors.text}]}>
                {Math.round(routeData.estimatedDuration / 60)} saat
              </Text>
              <Text style={[styles.statLabel, {color: COLORS.textSecondary}]}>
                Süre
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Rota Bilgileri
            </Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, {color: colors.text}]}>
                {routeData.city}, {routeData.district}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="bike"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, {color: colors.text}]}>
                {routeData.type}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="road-variant"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoText, {color: colors.text}]}>
                {routeData.type}
              </Text>
            </View>
          </View>

          {routeData.description && (
            <View style={styles.detailSection}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Açıklama
              </Text>
              <Text style={[styles.description, {color: colors.text}]}>
                {routeData.description}
              </Text>
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, {backgroundColor: colors.primary}]}
              onPress={handleNavigateToRoute}>
              <MaterialCommunityIcons
                name="navigation-variant"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Rotaya Git</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  borderWidth: 1,
                },
              ]}>
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.actionButtonText, {color: colors.primary}]}>
                Paylaş
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  difficultyText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SIZES.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  detailSection: {
    marginBottom: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  infoText: {
    fontSize: 16,
    marginLeft: SIZES.spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.md,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
});

export default RouteDetailScreen;
