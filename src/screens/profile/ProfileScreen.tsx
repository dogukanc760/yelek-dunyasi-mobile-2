import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextStyle,
  ImageStyle,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, ROUTES } from '../../constants';
import { useAuthStore } from '../../store';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, getUserProfile, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserProfile();
    setRefreshing(false);
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleEditProfile = () => {
    navigation.navigate(ROUTES.PROFILE.EDIT_PROFILE as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profil Başlık */}
        <View style={styles.headerContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require('../../../assets/default-avatar.png')
              }
              style={styles.profileImage as ImageStyle}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName as TextStyle}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileUsername as TextStyle}>
              {user?.nickname || '@sürücü'}
            </Text>
            <Text style={styles.profileLocation as TextStyle}>
              {user?.city} {user?.district && `, ${user.district}`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText as TextStyle}>
              Profili Düzenle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Motosiklet Bilgileri */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle as TextStyle}>
            Motosiklet Bilgileri
          </Text>
          <View style={styles.motorcycleInfo}>
            <Text style={styles.infoLabel as TextStyle}>Marka</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.motorcycleBrand || '-'}
            </Text>
          </View>
          <View style={styles.motorcycleInfo}>
            <Text style={styles.infoLabel as TextStyle}>Model</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.motorcycleModel || '-'}
            </Text>
          </View>
          <View style={styles.motorcycleInfo}>
            <Text style={styles.infoLabel as TextStyle}>Motor Hacmi</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.motorcycleCc ? `${user.motorcycleCc} cc` : '-'}
            </Text>
          </View>
        </View>

        {/* Kişisel Bilgiler */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle as TextStyle}>Kişisel Bilgiler</Text>
          <View style={styles.personalInfo}>
            <Text style={styles.infoLabel as TextStyle}>Kan Grubu</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.bloodType || '-'}
            </Text>
          </View>
          <View style={styles.personalInfo}>
            <Text style={styles.infoLabel as TextStyle}>Kıyafet Bedeni</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.clothingSize || '-'}
            </Text>
          </View>
          <View style={styles.personalInfo}>
            <Text style={styles.infoLabel as TextStyle}>Ehliyet Tipi</Text>
            <Text style={styles.infoValue as TextStyle}>
              {user?.driverLicenseType || '-'}
            </Text>
          </View>
        </View>

        {/* Ayarlar ve Çıkış */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() =>
              navigation.navigate(ROUTES.PROFILE.SETTINGS as never)
            }
          >
            <Text style={styles.settingsButtonText as TextStyle}>Ayarlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText as TextStyle}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  headerContainer: {
    marginBottom: SIZES.spacing.xl,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: SIZES.spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  } as ImageStyle,
  profileInfo: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  profileName: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  } as TextStyle,
  profileUsername: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  } as TextStyle,
  profileLocation: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  editButton: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.spacing.md,
  },
  editButtonText: {
    ...FONTS.button,
    color: COLORS.white,
  } as TextStyle,
  sectionContainer: {
    marginBottom: SIZES.spacing.xl,
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.md,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  } as TextStyle,
  motorcycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.sm,
  },
  personalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.sm,
  },
  infoLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  } as TextStyle,
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
  } as TextStyle,
  buttonContainer: {
    marginTop: SIZES.spacing.xl,
  },
  settingsButton: {
    backgroundColor: COLORS.background,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  settingsButtonText: {
    ...FONTS.body1,
    color: COLORS.text,
  } as TextStyle,
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...FONTS.body1,
    color: COLORS.white,
  } as TextStyle,
});

export default ProfileScreen;
