import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Route} from '../../services/routeService';
import {COLORS, SIZES} from '../../constants';
import {RootStackParamList} from '../../types/navigation';

type HomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface PopularRouteSectionProps {
  isLoading: boolean;
  popularRoutes: Route[];
  onSeeAllPress?: () => void;
  onRoutePress: (routeId: string) => void;
}

export const PopularRouteSection: React.FC<PopularRouteSectionProps> = ({
  isLoading,
  popularRoutes,
  onSeeAllPress,
  onRoutePress,
}) => {
  const {colors} = useTheme();
  const navigation = useNavigation<HomeNavigationProp>();

  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      navigation.navigate('PopularRoutes', {});
    }
  };

  const renderRouteCard = (route: Route) => (
    <TouchableOpacity
      key={route.id}
      style={[styles.routeCard, {backgroundColor: colors.card}]}
      onPress={() => onRoutePress(route.id)}>
      <Image source={{uri: route.imageUrl}} style={styles.routeImage} />
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
            <Text style={{...styles.routeStatText, color: colors.text}}>
              {route.distance} km
            </Text>
          </View>
          <View style={styles.routeStat}>
            <MaterialCommunityIcons
              name="bike"
              size={14}
              color={COLORS.textSecondary}
            />
            <Text style={{...styles.routeStatText, color: colors.text}}>
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

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={{...styles.sectionTitle, color: colors.text}}>
          Popüler Rotalar
        </Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={handleSeeAllPress}>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={24}
            color={COLORS.primary}
          />
          <Text style={{...styles.emptyText, color: COLORS.textSecondary}}>
            Rotalar yükleniyor...
          </Text>
        </View>
      ) : popularRoutes.length === 0 ? (
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
          {popularRoutes.map(route => renderRouteCard(route))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: SIZES.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  routesContainer: {
    paddingLeft: SIZES.spacing.md,
    paddingRight: SIZES.spacing.sm,
  },
  routeCard: {
    width: 240,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeImage: {
    width: '100%',
    height: 120,
  },
  routeContent: {
    padding: SIZES.spacing.sm,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  routeStats: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  routeStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  routeDifficulty: {
    marginTop: 2,
  },
  routeDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: SIZES.spacing.sm,
  },
});
