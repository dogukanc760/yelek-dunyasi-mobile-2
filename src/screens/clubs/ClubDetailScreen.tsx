import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useTheme,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, FONTS} from '../../constants';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import clubService from '../../services/clubService';
import {useAuth} from '../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

type ClubDetailRouteProp = RouteProp<RootStackParamList, 'ClubDetail'>;
type ClubNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ClubPermissions {
  canCreateEvent: boolean;
  canManageMembers: boolean;
  canManageCity: boolean;
  canSendAnnouncement: boolean;
  canAddProduct: boolean;
  canManageClub: boolean;
  canRemoveMember: boolean;
  canManageEvents: boolean;
}

export const ClubDetailScreen = () => {
  const route = useRoute<ClubDetailRouteProp>();
  const navigation = useNavigation<ClubNavigationProp>();
  const {colors} = useTheme();
  const {user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<any>(null);
  const [userPermissions, setUserPermissions] =
    useState<ClubPermissions | null>(null);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [applicationNote, setApplicationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clubService.getClubById(route.params.id);
      setClub(response);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Kulüp bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [route.params.id]);

  useEffect(() => {
    fetchClubDetails();
  }, [fetchClubDetails]);

  useEffect(() => {
    if (club?.members && user?.id) {
      const currentMember = club.members.find(
        (member: any) => member.userId === user.id,
      );
      if (currentMember) {
        const permissions: ClubPermissions = {
          canCreateEvent: currentMember.canCreateEvent || false,
          canManageMembers: currentMember.canManageMembers || false,
          canManageCity: currentMember.canManageCity || false,
          canSendAnnouncement: currentMember.canSendAnnouncement || false,
          canAddProduct: currentMember.canAddProduct || false,
          canManageClub: currentMember.canManageClub || false,
          canRemoveMember: currentMember.canRemoveMember || false,
          canManageEvents: currentMember.canManageEvents || false,
        };
        setUserPermissions(permissions);
      }
    }
  }, [club?.members, user?.id]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 10}}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const hasAnyPermission = userPermissions
    ? Object.values(userPermissions).some(permission => permission)
    : false;

  const isUserMember = club?.members?.some(
    (member: any) => member.userId === user?.id,
  );

  const hasExistingApplication = React.useMemo(() => {
    if (!club?.applications || !user?.id) return false;

    console.log('Checking applications:', {
      applications: club.applications,
      userId: user.id,
    });

    return club.applications.some((application: any) => {
      const hasApplication =
        application.userId === user.id && application.status === 'PENDING';
      console.log('Application check:', {
        applicationUserId: application.userId,
        currentUserId: user.id,
        status: application.status,
        hasApplication,
      });
      return hasApplication;
    });
  }, [club?.applications, user?.id]);

  useEffect(() => {
    console.log('Club data:', club);
    console.log('Current user:', user);
    console.log('Has existing application:', hasExistingApplication);
  }, [club, user, hasExistingApplication]);

  const handleJoinOrApply = () => {
    if (!club || !user) return;
    setApplicationModalVisible(true);
  };

  const handleSubmitApplication = async () => {
    if (!club || !user) return;

    // Private kulüpler için not zorunlu, public için opsiyonel
    if (club.type === 'private' && !applicationNote.trim()) return;

    try {
      setIsSubmitting(true);
      await clubService.submitApplication(
        club.id,
        // Public kulüpler için not boşsa varsayılan bir mesaj gönder
        club.type === 'public' && !applicationNote.trim()
          ? 'Kulübe katılmak istiyorum.'
          : applicationNote,
      );
      setApplicationModalVisible(false);
      setApplicationNote('');
      // Başarılı mesajı göster
      Alert.alert(
        'Başarılı',
        club.type === 'public'
          ? 'Kulübe başarıyla katıldınız!'
          : 'Başvurunuz başarıyla gönderildi!',
      );
      // Kulüp detaylarını yenile
      fetchClubDetails();
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İşlem sırasında bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{color: colors.text, marginTop: 10}}>
          Kulüp bilgileri yükleniyor...
        </Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={50}
          color={COLORS.error}
        />
        <Text style={{color: colors.text, marginTop: 10}}>
          Kulüp bulunamadı
        </Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Image
        source={{uri: club.cover}}
        style={styles.coverImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={styles.gradient}
      />
      {hasAnyPermission && userPermissions && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() =>
            navigation.navigate('ManageClub', {
              clubId: club.id,
              permissions: userPermissions,
            })
          }>
          <MaterialCommunityIcons name="cog" size={20} color={COLORS.white} />
          <Text style={styles.manageButtonText}>Yönetim</Text>
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        <Image source={{uri: club.logo}} style={styles.logo} />
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{club.name}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.memberCount}>
              <MaterialCommunityIcons
                name="account-group"
                size={12}
                color={COLORS.white}
              />
              <Text style={styles.statText}>{club.memberCount} üye</Text>
            </View>
            {club.isOfficial && (
              <View style={styles.badge}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={12}
                  color={COLORS.white}
                />
                <Text style={styles.badgeText}>Resmi Kulüp</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={[styles.section, {backgroundColor: colors.card}]}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>Hakkında</Text>
      <Text style={[styles.description, {color: colors.text}]}>
        {club.description}
      </Text>
    </View>
  );

  const renderAdmins = () => (
    <View style={[styles.section, {backgroundColor: colors.card}]}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        Yöneticiler
      </Text>
      <View style={styles.adminList}>
        {club.founder ? (
          <View style={styles.adminItem}>
            <Image
              source={{
                uri:
                  club.founder.profilePicture ||
                  'https://png.pngitem.com/pimgs/s/649-6490124_katie-notopoulos-katienotopoulos-i-write-about-tech-round.png',
              }}
              style={styles.adminAvatar}
            />
            <View style={styles.adminInfo}>
              <Text style={[styles.adminName, {color: colors.text}]}>
                {`${club.founder.firstName} ${club.founder.lastName}`}
              </Text>
              <Text style={[styles.adminRole, {color: COLORS.textSecondary}]}>
                Kurucu
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
            Henüz yönetici bulunmuyor...
          </Text>
        )}
      </View>
    </View>
  );

  const handleMembersPress = () => {
    try {
      if (!club?.id) return;
      navigation.navigate('ClubMembers', {
        clubId: club.id,
      });
    } catch (error) {
      console.error('Üyeler navigasyon hatası:', error);
    }
  };

  const handleAnnouncementsPress = () => {
    try {
      if (!club?.id) return;
      navigation.navigate('ClubAnnouncements', {
        club: club,
      });
    } catch (error) {
      console.error('Duyurular navigasyon hatası:', error);
    }
  };

  const handleEventsPress = () => {
    try {
      if (!club?.id) return;
      navigation.navigate('ClubEvents', {
        clubId: club.id,
        events: club.events || [],
      });
    } catch (error) {
      console.error('Etkinlikler navigasyon hatası:', error);
    }
  };

  const renderMembers = () => (
    <View style={[styles.section, {backgroundColor: colors.card}]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Üyeler</Text>
        <TouchableOpacity
          onPress={handleMembersPress}
          style={styles.seeAllButton}>
          <Text style={{color: colors.primary}}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.membersList}>
        {club.members && club.members.length > 0 ? (
          club.members.slice(0, 3).map((member: any) => (
            <View key={member.id} style={styles.memberItem}>
              <Image
                source={{
                  uri:
                    member.user.profilePicture ||
                    'https://png.pngitem.com/pimgs/s/649-6490124_katie-notopoulos-katienotopoulos-i-write-about-tech-round.png',
                }}
                style={styles.memberAvatar}
              />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, {color: colors.text}]}>
                  {`${member.user.firstName} ${member.user.lastName}`}
                </Text>
                <Text
                  style={[styles.memberRole, {color: COLORS.textSecondary}]}>
                  {member.rank === 'admin' ? 'Yönetici' : 'Üye'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
            Henüz üye bulunmuyor...
          </Text>
        )}
      </View>
    </View>
  );

  const renderAnnouncements = () => (
    <View style={[styles.section, {backgroundColor: colors.card}]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Duyurular
        </Text>
        <TouchableOpacity
          onPress={handleAnnouncementsPress}
          style={styles.seeAllButton}>
          <Text style={{color: colors.primary}}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
      {club.announcements && club.announcements.length > 0 ? (
        club.announcements.slice(0, 3).map((announcement: any) => (
          <TouchableOpacity
            key={announcement.id}
            style={styles.announcementItem}
            onPress={() =>
              navigation.navigate('AnnouncementDetail', {
                id: announcement.id,
              })
            }>
            <View style={styles.announcementHeader}>
              <Text style={[styles.announcementTitle, {color: colors.text}]}>
                {announcement.title}
              </Text>
              <Text
                style={[
                  styles.announcementDate,
                  {color: COLORS.textSecondary},
                ]}>
                {format(new Date(announcement.createdAt), 'd MMM yyyy', {
                  locale: tr,
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.announcementContent,
                {color: COLORS.textSecondary},
              ]}
              numberOfLines={2}>
              {announcement.content}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
          Henüz duyuru bulunmuyor...
        </Text>
      )}
    </View>
  );

  const renderEvents = () => (
    <View style={[styles.section, {backgroundColor: colors.card}]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Etkinlikler
        </Text>
        <TouchableOpacity
          onPress={handleEventsPress}
          style={styles.seeAllButton}>
          <Text style={{color: colors.primary}}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>
      {club.events && club.events.length > 0 ? (
        club.events.slice(0, 3).map((event: any) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventItem}
            onPress={() =>
              navigation.navigate('EventDetail', {
                id: event.id,
              })
            }>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, {color: colors.text}]}>
                {event.title}
              </Text>
              <View style={styles.eventType}>
                <MaterialCommunityIcons
                  name={event.type === 'ride' ? 'motorbike' : 'calendar'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.eventTypeText, {color: colors.primary}]}>
                  {event.type === 'ride' ? 'Sürüş' : 'Toplantı'}
                </Text>
              </View>
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventInfoItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text
                  style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
                  {format(new Date(event.startDate), 'd MMM yyyy', {
                    locale: tr,
                  })}
                </Text>
              </View>
              <View style={styles.eventInfoItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text
                  style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
                  {event.location}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
          Henüz etkinlik bulunmuyor...
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {renderHeader()}
        {renderDescription()}
        {renderAdmins()}
        {renderMembers()}
        {renderAnnouncements()}
        {renderEvents()}

        {!isUserMember && club && (
          <TouchableOpacity
            style={[
              styles.joinButton,
              {
                backgroundColor:
                  hasExistingApplication || isSubmitting
                    ? COLORS.textSecondary
                    : COLORS.primary,
              },
            ]}
            onPress={handleJoinOrApply}
            disabled={hasExistingApplication || isSubmitting}>
            <Text style={styles.joinButtonText}>
              {isSubmitting
                ? 'İşlem yapılıyor...'
                : hasExistingApplication
                ? 'Başvuruldu'
                : club.type === 'public'
                ? 'Katıl'
                : 'Başvur'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={applicationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setApplicationModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              {club?.type === 'public' ? 'Kulübe Katıl' : 'Kulüp Başvurusu'}
            </Text>
            <Text style={[styles.modalSubtitle, {color: colors.text}]}>
              {club?.type === 'public'
                ? 'Kulübe katılmak için bir tanıtım mesajı yazabilirsiniz:'
                : 'Kulübe katılmak için başvuru mesajınızı yazın:'}
            </Text>
            <TextInput
              style={[
                styles.applicationInput,
                {color: colors.text, borderColor: colors.border},
              ]}
              placeholder={
                club?.type === 'public'
                  ? 'Kendinizi kısaca tanıtın (isteğe bağlı)...'
                  : 'Başvuru mesajınızı yazın...'
              }
              placeholderTextColor={colors.text}
              multiline
              value={applicationNote}
              onChangeText={setApplicationNote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setApplicationModalVisible(false)}>
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  {
                    opacity:
                      isSubmitting ||
                      (club?.type === 'private' && !applicationNote.trim())
                        ? 0.5
                        : 1,
                  },
                ]}
                onPress={handleSubmitApplication}
                disabled={
                  isSubmitting ||
                  (club?.type === 'private' && !applicationNote.trim())
                }>
                <Text style={styles.modalButtonText}>
                  {isSubmitting
                    ? 'Gönderiliyor...'
                    : club?.type === 'public'
                    ? 'Katıl'
                    : 'Başvur'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'relative',
    height: 112,
    marginBottom: 30,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.white,
    marginRight: 10,
  },
  clubInfo: {
    flex: 1,
    marginBottom: 5,
  },
  clubName: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 15,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statText: {
    marginLeft: 4,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 10,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  badgeText: {
    marginLeft: 4,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 10,
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  section: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    position: 'relative',
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    fontSize: 18,
  },
  seeAllButton: {
    padding: 8,
    marginLeft: 8,
  },
  description: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  adminList: {
    marginTop: 8,
  },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  adminInfo: {
    marginLeft: 12,
  },
  adminName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
  },
  adminRole: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  memberRole: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  announcementTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    flex: 1,
  },
  announcementDate: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
  },
  announcementContent: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  eventItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    flex: 1,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 12,
    marginLeft: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfoText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 12,
    marginLeft: 4,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
    fontStyle: 'italic',
  },
  manageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  manageButtonText: {
    color: COLORS.white,
    marginLeft: 4,
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 14,
  },
  joinButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  applicationInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 12,
    textAlign: 'center',
  },
});
