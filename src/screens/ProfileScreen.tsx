import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {useAuth} from '../context/AuthContext';
import {UserProfile} from '../services/userService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '@react-navigation/native';

// Mock profil verisi
const mockUserProfile: UserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'kullanici@gmail.com',
  firstName: 'Doğukan',
  lastName: 'Canerler',
  nickname: 'Gergedan',
  phoneNumber: '+905551234567',
  city: 'İzmir',
  district: 'Karşıyaka',
  motorcycleBrand: 'Harley Davidson',
  motorcycleModel: 'Road Glide CVO',
  motorcycleCc: 1500,
  profilePicture: 'http://ornek.com/resim.jpg',
  bloodType: 'A+',
  clothingSize: 'XL',
  driverLicenseType: 'A2',
  emergencyContactName: 'Mehmet Yılmaz',
  emergencyContactRelation: 'Kardeş',
  emergencyContactPhone: '+905551234568',
  isEmailVerified: true,
  isPhoneVerified: true,
  hasProfilePicture: true,
  isActive: true,
  role: {
    id: 2,
    name: 'user',
  },
  status: {
    id: 1,
    name: 'active',
  },
  // Kulüp üyelikleri eklendi
  clubMemberships: [
    {
      clubId: '550e8400-e29b-41d4-a716-446655440001',
      clubName: 'TürkRiders CC Izmir',
      clubLogo:
        'https://turkriders.org/wp-content/uploads/2019/07/Trcc-Logo-1024x674.png',
      clubCity: 'İzmir',
      rank: 'admin',
      rankDescription: 'Yol Kaptanı',
      status: 'active',
      permissions: {
        canCreateEvent: true,
        canManageMembers: true,
        canManageCity: true,
        canSendAnnouncement: true,
        canAddProduct: true,
        canManageClub: true,
        canRemoveMember: true,
        canManageEvents: true,
      },
    },
  ],
};

const ProfileScreen = () => {
  const {colors} = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {logout} = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      setError(null);
      setLoading(true);

      // Mock veriyi kullanarak simulasyon yapıyoruz
      setTimeout(() => {
        setUserProfile(mockUserProfile);
        setLoading(false);
      }, 1000); // 1 saniye yükleme efekti gösteriyoruz
    } catch (err) {
      console.error('Profil bilgileri alınırken hata:', err);
      setError(null); // Mock data kullandığımız için hatayı gizliyoruz
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Mock veriyi kullanarak simulasyon yapıyoruz
      setTimeout(() => {
        setUserProfile(mockUserProfile);
        setRefreshing(false);
      }, 1000); // 1 saniye refresh efekti gösteriyoruz
    } catch (error) {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Alert.alert('Hata', 'Çıkış işlemi sırasında bir hata oluştu.');
    }
  };

  if (loading && !userProfile) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          Profil bilgileri yükleniyor...
        </Text>
      </View>
    );
  }

  if (error && !userProfile) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <MaterialCommunityIcons name="alert-circle" size={50} color="red" />
        <Text style={[styles.errorText, {color: colors.text}]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, {backgroundColor: colors.primary}]}
          onPress={fetchUserProfile}>
          <Text style={[styles.retryButtonText, {color: colors.background}]}>
            Tekrar Dene
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Kullanıcının adını ve soyadını birleştir
  const fullName = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
    : 'Kullanıcı Adı';

  // Kullanıcının nickname veya email bilgisini göster
  const subTitle = userProfile
    ? userProfile.nickname || userProfile.email
    : 'kullanici@email.com';

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        {userProfile &&
        userProfile.hasProfilePicture &&
        userProfile.profilePicture ? (
          <MaterialCommunityIcons
            name="account-circle"
            size={100}
            color={colors.primary}
          />
        ) : (
          <MaterialCommunityIcons
            name="account-circle"
            size={100}
            color={colors.text}
          />
        )}
        <Text style={[styles.name, {color: colors.text}]}>{fullName}</Text>
        <Text style={[styles.email, {color: colors.text}]}>{subTitle}</Text>
      </View>

      <View style={styles.infoContainer}>
        {userProfile?.motorcycleBrand && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="motorbike"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.infoText, {color: colors.text}]}>
              {`${userProfile.motorcycleBrand} ${
                userProfile.motorcycleModel || ''
              } ${
                userProfile.motorcycleCc ? `${userProfile.motorcycleCc}cc` : ''
              }`}
            </Text>
          </View>
        )}

        {userProfile?.city && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.infoText, {color: colors.text}]}>
              {`${userProfile.city}${
                userProfile.district ? `, ${userProfile.district}` : ''
              }`}
            </Text>
          </View>
        )}

        {userProfile?.phoneNumber && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color={colors.text}
            />
            <Text style={[styles.infoText, {color: colors.text}]}>
              {userProfile.phoneNumber}
            </Text>
          </View>
        )}

        {/* Kulüp bilgisi eklendi */}
        {userProfile?.clubMemberships &&
          userProfile.clubMemberships.length > 0 && (
            <View style={styles.infoItem}>
              {userProfile.clubMemberships[0].clubLogo ? (
                <Image
                  source={{uri: userProfile.clubMemberships[0].clubLogo}}
                  style={styles.clubLogo}
                  resizeMode="contain"
                />
              ) : (
                <MaterialCommunityIcons
                  name="shield-account"
                  size={20}
                  color={colors.text}
                />
              )}
              <Text style={[styles.infoText, {color: colors.text}]}>
                {`${userProfile.clubMemberships[0].clubName} - ${userProfile.clubMemberships[0].rankDescription}`}
              </Text>
            </View>
          )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, {borderBottomColor: colors.border}]}
          onPress={() => navigation.navigate('EditProfile')}>
          <MaterialCommunityIcons
            name="account-edit"
            size={24}
            color={colors.text}
          />
          <Text style={[styles.buttonText, {color: colors.text}]}>
            Profili Düzenle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {borderBottomColor: colors.border}]}
          onPress={() => navigation.navigate('Settings')}>
          <MaterialCommunityIcons name="cog" size={24} color={colors.text} />
          <Text style={[styles.buttonText, {color: colors.text}]}>Ayarlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {borderBottomColor: colors.border}]}
          onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={colors.text} />
          <Text style={[styles.buttonText, {color: colors.text}]}>
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    marginTop: 5,
  },
  infoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  buttonsContainer: {
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  clubLogo: {
    width: 70,
    height: 70,
    marginRight: 2,
  },
});

export default ProfileScreen;
