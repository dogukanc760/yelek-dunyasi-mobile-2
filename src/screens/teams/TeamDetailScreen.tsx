import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {Team, TeamMember} from '../../services/teamService';
import {teamService} from '../../services';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDetail'>;

const TeamDetailScreen = ({route, navigation}: Props) => {
  const {colors} = useTheme();
  const {teamId} = route.params;
  const {user} = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      setIsLoading(true);
      const teamData = await teamService.getTeamById(teamId);
      setTeam(teamData);
    } catch (error: any) {
      let errorMessage = 'Takım bilgileri yüklenirken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeamDetails();
    }, [teamId]),
  );

  const handleInviteMember = () => {
    navigation.navigate('InviteMember', {teamId});
  };

  const handleEditTeam = () => {
    if (team) {
      navigation.navigate('EditTeam', {team});
    }
  };

  const handleLeaveTeam = () => {
    setConfirmingLeave(true);
    Alert.alert(
      'Takımdan Ayrıl',
      'Bu takımdan ayrılmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => setConfirmingLeave(false),
        },
        {
          text: 'Ayrıl',
          style: 'destructive',
          onPress: confirmLeaveTeam,
        },
      ],
    );
  };

  const confirmLeaveTeam = async () => {
    try {
      await teamService.leaveTeam(teamId);
      Alert.alert('Başarılı', 'Takımdan ayrıldınız.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      setConfirmingLeave(false);
      let errorMessage = 'Takımdan ayrılırken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
    }
  };

  const handleDeleteTeam = () => {
    setConfirmingDelete(true);
    Alert.alert(
      'Takımı Sil',
      'Bu takımı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => setConfirmingDelete(false),
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: confirmDeleteTeam,
        },
      ],
    );
  };

  const confirmDeleteTeam = async () => {
    try {
      await teamService.deleteTeam(teamId);
      Alert.alert('Başarılı', 'Takım başarıyla silindi.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      setConfirmingDelete(false);
      let errorMessage = 'Takım silinirken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      'Üyeyi Çıkar',
      'Bu üyeyi takımdan çıkarmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: () => confirmRemoveMember(memberId),
        },
      ],
    );
  };

  const confirmRemoveMember = async (memberId: string) => {
    try {
      await teamService.removeMember(teamId, memberId);
      Alert.alert('Başarılı', 'Üye takımdan çıkarıldı.');
      fetchTeamDetails(); // Listeyi güncelle
    } catch (error: any) {
      let errorMessage = 'Üye çıkarılırken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
    }
  };

  const renderMemberItem = ({item}: {item: TeamMember}) => {
    const isCurrentUser = user?.id === item.userId;
    const isAdmin = item.role === 'admin' || item.role === 'owner';
    const canRemove =
      team?.members.some(
        m =>
          m.userId === user?.id && (m.role === 'admin' || m.role === 'owner'),
      ) && !isCurrentUser;

    return (
      <View style={[styles.memberItem, {backgroundColor: colors.card}]}>
        <View style={styles.memberInfo}>
          {item.profilePicture ? (
            <Image
              source={{uri: item.profilePicture}}
              style={styles.memberAvatar}
            />
          ) : (
            <View
              style={[
                styles.memberAvatarPlaceholder,
                {backgroundColor: colors.primary},
              ]}>
              <Text style={styles.memberAvatarPlaceholderText}>
                {item.firstName?.charAt(0) || ''}
                {item.lastName?.charAt(0) || ''}
              </Text>
            </View>
          )}
          <View style={styles.memberDetails}>
            <Text style={[styles.memberName, {color: colors.text}]}>
              {item.firstName} {item.lastName}
              {isCurrentUser && ' (Sen)'}
            </Text>
            <Text
              style={[
                styles.memberRole,
                {color: isAdmin ? colors.primary : colors.text},
              ]}>
              {item.role === 'owner'
                ? 'Kurucu'
                : item.role === 'admin'
                ? 'Yönetici'
                : 'Üye'}
            </Text>
          </View>
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveMember(item.userId)}>
            <MaterialCommunityIcons
              name="account-remove"
              size={24}
              color="red"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading || confirmingLeave || confirmingDelete) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          {backgroundColor: colors.background},
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          {confirmingLeave
            ? 'Takımdan ayrılınıyor...'
            : confirmingDelete
            ? 'Takım siliniyor...'
            : 'Takım bilgileri yükleniyor...'}
        </Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          {backgroundColor: colors.background},
        ]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={50}
          color={colors.text}
        />
        <Text style={[styles.errorText, {color: colors.text}]}>
          Takım bilgileri bulunamadı.
        </Text>
      </View>
    );
  }

  const isCurrentUserAdmin = team.members.some(
    member =>
      member.userId === user?.id &&
      (member.role === 'admin' || member.role === 'owner'),
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.headerContainer}>
        {team.logo ? (
          <Image source={{uri: team.logo}} style={styles.teamLogo} />
        ) : (
          <View
            style={[
              styles.teamLogoPlaceholder,
              {backgroundColor: colors.primary},
            ]}>
            <Text style={styles.teamLogoPlaceholderText}>
              {team.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.teamName, {color: colors.text}]}>{team.name}</Text>
        {team.description && (
          <Text style={[styles.teamDescription, {color: colors.text}]}>
            {team.description}
          </Text>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Üyeler
          </Text>
          {isCurrentUserAdmin && (
            <TouchableOpacity
              style={[styles.addButton, {backgroundColor: colors.primary}]}
              onPress={handleInviteMember}>
              <MaterialCommunityIcons
                name="account-plus"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.addButtonText}>Davet Et</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={team.members}
          keyExtractor={item => item.userId}
          renderItem={renderMemberItem}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.actionsContainer}>
        {isCurrentUserAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: colors.primary}]}
            onPress={handleEditTeam}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Takımı Düzenle</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: '#F44336'}]}
          onPress={isCurrentUserAdmin ? handleDeleteTeam : handleLeaveTeam}>
          <MaterialCommunityIcons
            name={isCurrentUserAdmin ? 'delete' : 'exit-to-app'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {isCurrentUserAdmin ? 'Takımı Sil' : 'Takımdan Ayrıl'}
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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  teamLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  teamLogoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default TeamDetailScreen;
