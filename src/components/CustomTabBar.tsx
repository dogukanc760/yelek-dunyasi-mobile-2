import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TAB_HEIGHT = 64;
const CURVE_HEIGHT = 22;
const CURVE_RADIUS = 32;
const ICON_SIZE = 26;
const ICON_SIZE_ACTIVE = 32;
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const icons = [
  {name: 'home', label: 'AnaSayfa'},
  {name: 'account-multiple', label: 'Sosyal'},
  {name: 'store', label: 'Pazar'},
  {name: 'bell', label: 'Bildirimler'},
  {name: 'account', label: 'Profil'},
];

const CustomTabBar = ({state, descriptors, navigation}) => {
  const tabWidth = SCREEN_WIDTH / state.routes.length;
  const focusedIndex = state.index;
  const curveCenter = tabWidth * focusedIndex + tabWidth / 2;

  // Venmo tarzı, minimal ve yumuşak curve
  const getCurvePath = () => {
    const left = curveCenter - CURVE_RADIUS * 1.4;
    const right = curveCenter + CURVE_RADIUS * 1.4;
    return `
      M0,0 
      H${left}
      Q${curveCenter},${CURVE_HEIGHT * 2} ${right},0
      H${SCREEN_WIDTH}
      V${TAB_HEIGHT}
      H0
      Z
    `;
  };

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={TAB_HEIGHT} style={styles.svg}>
        <Path d={getCurvePath()} fill="#fff" stroke="#e0e0e0" strokeWidth={1} />
      </Svg>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;
          const iconName = icons[index]?.name || 'circle';

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          // Seçili tab için curve'in içinde, hafif büyük ve sade ikon
          if (isFocused) {
            return (
              <View
                key={route.key}
                style={[
                  styles.tabButton,
                  styles.activeTab,
                  index === 2 && styles.centerTab,
                ]}>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onPress}
                  style={styles.curveIconWrapper}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons
                    name={iconName}
                    color={'#1976d2'}
                    size={ICON_SIZE_ACTIVE}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    color: '#1976d2',
                    fontWeight: 'bold',
                    fontSize: 12,
                    marginTop: 2,
                  }}>
                  {label}
                </Text>
              </View>
            );
          }

          // Diğer tablar için düz ikon
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              onPress={onPress}
              style={[styles.tabButton, index === 2 && styles.centerTab]}
              activeOpacity={0.8}>
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name={iconName}
                  color={'#888'}
                  size={ICON_SIZE}
                />
              </View>
              <Text
                style={{
                  color: '#888',
                  fontWeight: 'normal',
                  fontSize: 12,
                  marginTop: 2,
                }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: TAB_HEIGHT,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tabRow: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
    zIndex: 1,
  },
  activeTab: {
    transform: [{translateY: -CURVE_HEIGHT}],
    zIndex: 3,
  },
  centerTab: {
    zIndex: 2,
  },
  iconWrapper: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 4,
    marginBottom: 2,
  },
  curveIconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1976d2',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomTabBar;
