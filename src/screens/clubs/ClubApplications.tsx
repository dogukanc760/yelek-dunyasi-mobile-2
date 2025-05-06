import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RouteProp} from '@react-navigation/native';
import axios from 'axios';
import {API_URL} from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ApplicationStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  district: string;
  driverLicenseType: string;
  clothingSize: string;
  bloodType: string;
  motorcycleBrand: string;
  motorcycleModel: string;
  motorcycleCc: number;
  profileImageUrl: string | null;
  profilePicture: string;
  gender: string | null;
  birthDate: string | null;
  profession: string | null;
  otherClubMemberships: Array<{
    clubId: string;
    clubName: string;
    memberStatus: string; // 'active' | 'inactive'
    memberRank: string;
    joinDate: string;
  }>;
  otherClubApplications: Array<{
    clubId: string;
    clubName: string;
    status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
    applicationDate: string;
  }>;
  __entity: string;
}

interface Application {
  id: string;
  clubId: string;
  userId: string;
  applicationNote: string;
  status: ApplicationStatus;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  otherClubMemberships?: Array<{
    clubId: string;
    clubName: string;
    memberStatus: string;
    memberRank: string;
    joinDate: string;
  }>;
  otherClubApplications?: Array<{
    clubId: string;
    clubName: string;
    status: string;
    applicationDate: string;
  }>;
}

type ClubApplicationsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;
type ClubApplicationsScreenRouteProp = RouteProp<
  RootStackParamList,
  'ClubApplications'
>;

export const ClubApplicationsScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<ClubApplicationsScreenNavigationProp>();
  const route = useRoute<ClubApplicationsScreenRouteProp>();
  const {clubId} = route.params;

  console.log('ClubApplicationsScreen - Mounted');
  console.log('ClubApplicationsScreen - clubId:', clubId);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus>('ALL');

  // Modal states
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApplications = useCallback(
    async (status?: ApplicationStatus) => {
      if (!clubId) {
        setError("Kulüp ID'si bulunamadı");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
          setLoading(false);
          return;
        }

        const url =
          status && status !== 'ALL'
            ? `${API_URL}/api/v1/clubs/${clubId}/applications?status=${status}`
            : `${API_URL}/api/v1/clubs/${clubId}/applications`;

        console.log('API isteği yapılıyor:', url);

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('API Yanıtı:', JSON.stringify(response.data, null, 2));

        if (response.data.isSuccess && response.data.data) {
          const applications = response.data.data.applications.map(
            (app: any) => ({
              ...app,
              otherClubMemberships: app.otherClubMemberships || [],
              otherClubApplications: app.otherClubApplications || [],
            }),
          );

          if (Array.isArray(applications)) {
            setApplications(applications);
            console.log('Uygulamalar set edildi:', applications.length, 'adet');
            console.log(
              'İlk başvuru örneği:',
              JSON.stringify(applications[0], null, 2),
            );
          } else {
            console.error(
              'API yanıtındaki applications bir dizi değil:',
              response.data.data,
            );
            setError('Veri formatında hata oluştu');
          }
        } else {
          setError(
            'Başvurular yüklenirken bir hata oluştu: ' +
              (response.data.message || 'Bilinmeyen hata'),
          );
        }
      } catch (err) {
        console.error('API Hatası:', err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              'Başvurular yüklenirken bir hata oluştu',
          );
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    },
    [clubId],
  );

  useEffect(() => {
    console.log('Selected status changed:', selectedStatus);
    fetchApplications(selectedStatus);
  }, [selectedStatus, fetchApplications]);

  const handleApplicationPress = (application: Application) => {
    console.log(
      'Seçilen başvuru detayları:',
      JSON.stringify(application, null, 2),
    );
    console.log('Diğer kulüp üyelikleri:', application.otherClubMemberships);
    console.log('Diğer kulüp başvuruları:', application.otherClubApplications);
    setSelectedApplication(application);
    setResponseText(application.responseNote || '');
    setIsModalVisible(true);
  };

  const handleApplicationResponse = async (
    newStatus: 'APPROVED' | 'REJECTED',
  ) => {
    if (!selectedApplication || isProcessing) return;

    try {
      setIsProcessing(true);
      const token = await AsyncStorage.getItem('auth_token');

      // Debug logları
      console.log('İstek detayları:', {
        endpoint: `${API_URL}/api/v1/clubs/applications/${selectedApplication.id}/respond`,
        applicationId: selectedApplication.id,
        status: newStatus,
        responseNote: responseText,
      });

      const response = await axios.patch(
        `${API_URL}/api/v1/clubs/applications/${selectedApplication.id}/respond`,
        {
          status: newStatus,
          responseNote: responseText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.isSuccess) {
        // Başvuru listesini güncelle
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === selectedApplication.id
              ? {...app, status: newStatus, responseNote: responseText}
              : app,
          ),
        );
        setIsModalVisible(false);
      } else {
        setError('İşlem başarısız oldu: ' + response.data.message);
      }
    } catch (err) {
      console.error('Application response error:', err);
      if (axios.isAxiosError(err)) {
        console.error('Hata detayları:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
        });
        setError(
          `İşlem sırasında bir hata oluştu: ${err.response?.status} - ${
            err.response?.data?.message || err.message
          }`,
        );
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusFilter = () => (
    <View style={styles.filterContainer}>
      {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as ApplicationStatus[]).map(
        status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedStatus === status ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setSelectedStatus(status)}>
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedStatus === status ? COLORS.white : colors.text,
                },
              ]}>
              {status === 'ALL'
                ? 'Tümü'
                : status === 'PENDING'
                ? 'Bekleyen'
                : status === 'APPROVED'
                ? 'Onaylanan'
                : 'Reddedilen'}
            </Text>
          </TouchableOpacity>
        ),
      )}
    </View>
  );

  const ApplicationModal = () => {
    if (!selectedApplication) return null;

    const user = selectedApplication.user;
    const hasProfileImage = user.profilePicture || user.profileImageUrl;

    return (
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Profil Bilgileri */}
              <View style={styles.userProfile}>
                <Image
                  source={
                    hasProfileImage
                      ? {uri: user.profilePicture || user.profileImageUrl}
                      : require('../../assets/default-avatar.png')
                  }
                  style={styles.profileImage}
                />
                <Text style={[styles.mainTitle, {color: colors.text}]}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={[styles.subTitle, {color: colors.text}]}>
                  {user.email}
                </Text>

                <View style={styles.userInfoSection}>
                  {/* İletişim Bilgileri */}
                  <Text style={[styles.userInfoTitle, {color: colors.text}]}>
                    📱 İletişim Bilgileri
                  </Text>
                  <Text style={[styles.userInfoValue, {color: colors.text}]}>
                    {user.phoneNumber && user.phoneNumber !== ''
                      ? user.phoneNumber
                      : 'Telefon numarası belirtilmemiş'}
                  </Text>

                  {/* Konum Bilgileri */}
                  <Text style={[styles.userInfoTitle, {color: colors.text}]}>
                    📍 Konum Bilgileri
                  </Text>
                  <Text style={[styles.userInfoValue, {color: colors.text}]}>
                    {user.city && user.city !== ''
                      ? `${user.city}${
                          user.district ? ` / ${user.district}` : ''
                        }`
                      : 'Konum bilgisi belirtilmemiş'}
                  </Text>

                  {/* Motosiklet Bilgileri */}
                  <Text style={[styles.userInfoTitle, {color: colors.text}]}>
                    🏍️ Motosiklet Bilgileri
                  </Text>
                  <Text style={[styles.userInfoValue, {color: colors.text}]}>
                    {user.motorcycleBrand && user.motorcycleBrand !== ''
                      ? `${user.motorcycleBrand} ${user.motorcycleModel} (${user.motorcycleCc}cc)`
                      : 'Motosiklet bilgisi belirtilmemiş'}
                  </Text>

                  {/* Ehliyet Bilgisi */}
                  <Text style={[styles.userInfoTitle, {color: colors.text}]}>
                    🪪 Ehliyet Bilgisi
                  </Text>
                  <Text
                    style={[
                      styles.userInfoValue,
                      {color: colors.text, marginBottom: 0},
                    ]}>
                    {user.driverLicenseType && user.driverLicenseType !== ''
                      ? `${user.driverLicenseType} Sınıfı`
                      : 'Ehliyet bilgisi belirtilmemiş'}
                  </Text>
                </View>
              </View>

              {/* Diğer Kulüp Üyelikleri */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  🏍️ Diğer Kulüp Üyelikleri
                </Text>
                {user.otherClubMemberships &&
                user.otherClubMemberships.length > 0 ? (
                  user.otherClubMemberships.map((membership, index) => (
                    <View
                      key={`membership-${index}`}
                      style={styles.membershipCard}>
                      <Text style={[styles.clubName, {color: colors.text}]}>
                        {membership.clubName}
                      </Text>
                      <View style={styles.membershipDetails}>
                        <Text
                          style={[styles.membershipInfo, {color: colors.text}]}>
                          Durum:{' '}
                          {membership.memberStatus.toLowerCase() === 'active'
                            ? '✅ Aktif'
                            : '❌ Pasif'}
                        </Text>
                        <Text
                          style={[styles.membershipInfo, {color: colors.text}]}>
                          Rol: {membership.memberRank}
                        </Text>
                        <Text
                          style={[styles.membershipInfo, {color: colors.text}]}>
                          Katılım:{' '}
                          {new Date(membership.joinDate).toLocaleDateString(
                            'tr-TR',
                          )}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyStateText, {color: colors.text}]}>
                    Başka bir kulübe üyeliği yok.
                  </Text>
                )}
              </View>

              {/* Diğer Kulüp Başvuruları */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  📝 Diğer Kulüp Başvuruları
                </Text>
                {user.otherClubApplications &&
                user.otherClubApplications.length > 0 ? (
                  user.otherClubApplications.map((application, index) => (
                    <View
                      key={`application-${index}`}
                      style={styles.applicationCard}>
                      <Text style={[styles.clubName, {color: colors.text}]}>
                        {application.clubName}
                      </Text>
                      <View style={styles.applicationDetails}>
                        <Text
                          style={[
                            styles.applicationInfo,
                            {color: colors.text},
                          ]}>
                          Durum:{' '}
                          {application.status.toUpperCase() === 'PENDING'
                            ? '⏳ Beklemede'
                            : application.status.toUpperCase() === 'APPROVED'
                            ? '✅ Onaylandı'
                            : '❌ Reddedildi'}
                        </Text>
                        <Text
                          style={[
                            styles.applicationInfo,
                            {color: colors.text},
                          ]}>
                          Başvuru:{' '}
                          {new Date(
                            application.applicationDate,
                          ).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyStateText, {color: colors.text}]}>
                    Başka bir kulübe başvurmamış.
                  </Text>
                )}
              </View>

              {/* Mevcut Başvuru Detayları */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  📋 Başvuru Detayları
                </Text>
                <Text style={[styles.applicationNote, {color: colors.text}]}>
                  {selectedApplication.applicationNote ||
                    'Başvuru notu belirtilmemiş'}
                </Text>
              </View>
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
              <View style={styles.bottomSection}>
                <View style={styles.responseSection}>
                  <Text style={[styles.sectionTitle, {color: colors.text}]}>
                    ✍️ Yanıt
                  </Text>
                  <TextInput
                    style={[
                      styles.responseInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                    value={responseText}
                    onChangeText={setResponseText}
                    multiline
                    placeholder="Yanıtınızı buraya yazın..."
                    placeholderTextColor={COLORS.textSecondary}
                    editable={selectedApplication.status === 'PENDING'}
                  />
                </View>

                <View style={styles.actionButtons}>
                  {selectedApplication.status === 'PENDING' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApplicationResponse('APPROVED')}
                        disabled={isProcessing}>
                        <Text style={styles.actionButtonText}>
                          {isProcessing ? 'İşleniyor...' : 'Onayla'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleApplicationResponse('REJECTED')}
                        disabled={isProcessing}>
                        <Text style={styles.actionButtonText}>
                          {isProcessing ? 'İşleniyor...' : 'Reddet'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={[
                        styles.actionButton,
                        selectedApplication.status === 'APPROVED'
                          ? styles.approveButton
                          : styles.rejectButton,
                        styles.disabledButton,
                      ]}>
                      <Text style={styles.actionButtonText}>
                        {selectedApplication.status === 'APPROVED'
                          ? '✅ Onaylandı'
                          : '❌ Reddedildi'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    );
  };

  const ApplicationCard = ({application}: {application: Application}) => (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: colors.card}]}
      onPress={() => handleApplicationPress(application)}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, {color: colors.text}]}>
            {application.user.firstName} {application.user.lastName}
          </Text>
          <Text style={[styles.userEmail, {color: COLORS.textSecondary}]}>
            {application.user.email}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                application.status === 'PENDING'
                  ? COLORS.warning
                  : application.status === 'APPROVED'
                  ? COLORS.success
                  : COLORS.error,
            },
          ]}>
          <Text style={styles.statusText}>
            {application.status === 'PENDING'
              ? 'Bekliyor'
              : application.status === 'APPROVED'
              ? 'Onaylandı'
              : 'Reddedildi'}
          </Text>
        </View>
      </View>
      <Text style={[styles.note, {color: colors.text}]} numberOfLines={2}>
        {application.applicationNote}
      </Text>
      <Text style={[styles.date, {color: COLORS.textSecondary}]}>
        Başvuru Tarihi:{' '}
        {new Date(application.createdAt).toLocaleDateString('tr-TR')}
      </Text>
    </TouchableOpacity>
  );

  console.log('Render - Applications:', applications);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, {color: colors.text}]}>
          Gelen Başvurular
        </Text>
      </View>

      <StatusFilter />

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color={colors.primary}
        />
      ) : error ? (
        <Text style={[styles.errorText, {color: COLORS.error}]}>{error}</Text>
      ) : Array.isArray(applications) && applications.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {applications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.emptyText, {color: colors.text}]}>
          Henüz başvuru bulunmuyor.
        </Text>
      )}

      <ApplicationModal />
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
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 1,
  },
  filterText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  note: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    padding: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '85%',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  bottomSection: {
    paddingTop: 15,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: COLORS.white,
  },
  responseSection: {
    marginBottom: 15,
  },
  responseInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 8,
  },
  userProfile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: COLORS.backgroundSecondary,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 5,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 16,
    color: COLORS.text,
  },
  applicationNote: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: Platform.OS === 'ios' ? 0 : 15,
    gap: 15,
    paddingHorizontal: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  membershipCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applicationCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubName: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 8,
    color: COLORS.text,
  },
  membershipDetails: {
    gap: 8,
  },
  applicationDetails: {
    gap: 8,
  },
  membershipInfo: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    color: COLORS.textSecondary,
  },
  applicationInfo: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    color: COLORS.textSecondary,
  },
  userInfoSection: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoTitle: {
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 16,
    paddingTop: 3,
    color: COLORS.text,
  },
  userInfoValue: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
});

export default ClubApplicationsScreen;
