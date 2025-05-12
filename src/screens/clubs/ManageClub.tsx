import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RouteProp} from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ManageClubScreenRouteProp = RouteProp<RootStackParamList, 'ManageClub'>;

const ManageClub = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ManageClubScreenRouteProp>();
  const {clubId, permissions} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Kulüp Yönetimi',
    });
  }, [navigation]);

  const handleApplicationsPress = () => {
    if (!permissions.canManageMembers) {
      Alert.alert('Hata', 'Bu işlem için yetkiniz bulunmamaktadır.');
      return;
    }

    try {
      navigation.navigate('ClubApplications', {
        clubId,
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Hata',
        'Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
      );
    }
  };

  const renderManagementOption = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    isEnabled: boolean,
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.card,
            opacity: isEnabled ? 1 : 0.5,
          },
        ]}
        onPress={() => {
          if (isEnabled) {
            onPress();
          }
        }}
        disabled={!isEnabled}>
        <View style={styles.optionHeader}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isEnabled ? colors.primary : colors.text}
          />
          <Text style={[styles.optionTitle, {color: colors.text}]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.optionDescription, {color: COLORS.textSecondary}]}>
          {description}
        </Text>
        {!isEnabled && (
          <Text style={styles.disabledText}>Bu özellik için yetkiniz yok</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      {renderManagementOption(
        'account-clock',
        'Gelenn Başvurular',
        'Kulübe katılmak isteyen üyelerin başvurularını yönet',
        handleApplicationsPress,
        permissions.canManageMembers,
      )}

      {renderManagementOption(
        'calendar-plus',
        'Etkinlik Oluştur',
        'Yeni bir etkinlik veya sürüş planla',
        () => {
          if (!permissions.canCreateEvent) {
            Alert.alert('Hata', 'Bu işlem için yetkiniz bulunmamaktadır.');
            return;
          }

          try {
            navigation.navigate('CreateEvent', {clubId});
          } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert(
              'Hata',
              'Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
            );
          }
        },
        permissions.canCreateEvent,
      )}

      {renderManagementOption(
        'account-group',
        'Üye Yönetimi',
        'Üyeleri görüntüle, yönet ve düzenle',
        () => navigation.navigate('ClubMembers', {clubId}),
        permissions.canManageMembers,
      )}

      {renderManagementOption(
        'bullhorn',
        'Duyuru Yap',
        'Kulüp üyelerine duyuru gönder',
        () => {
          if (permissions.canSendAnnouncement) {
            navigation.navigate('CreateClubAnnouncementScreen', {clubId});
          } else {
            Alert.alert('Hata', 'Bu işlem için yetkiniz bulunmamaktadır.');
          }
        },
        permissions.canSendAnnouncement,
      )}

      {renderManagementOption(
        'calendar-check',
        'Etkinlik Yönetimi',
        'Mevcut etkinlikleri düzenle ve yönet',
        () => navigation.navigate('ClubEvents', {clubId}),
        permissions.canManageEvents,
      )}

      {/*{renderManagementOption(
        'account-remove',
        'Üye Çıkar',
        'Kulüpten üye çıkar',
        () => {
          // TODO: Üye çıkarma modalını göster
        },
        permissions.canRemoveMember,
      )}*/}

      {renderManagementOption(
        'cog',
        'Kulüp Ayarları',
        'Kulüp bilgilerini ve ayarlarını düzenle',
        () => navigation.navigate('EditClub', {clubId}),
        permissions.canManageClub,
      )}

      {/*{permissions.canManageCity &&
        renderManagementOption(
          'city',
          'Şehir Yönetimi',
          'Kulübün şehir yapılanmasını yönet',
          () => {
            // TODO: Şehir yönetimi sayfasına yönlendir
          },
          true,
        )}*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
    marginLeft: 12,
  },
  optionDescription: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    marginTop: 4,
  },
  disabledText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ManageClub;
