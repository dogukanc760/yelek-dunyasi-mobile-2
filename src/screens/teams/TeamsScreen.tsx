import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {Team} from '../../services/teamService';
import {teamService, fileService} from '../../services';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Teams'>;

const TeamsScreen = ({navigation}: Props) => {
  const {colors} = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('my');

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const [allTeamsData, myTeamsData] = await Promise.all([
        teamService.getTeams(),
        teamService.getMyTeams(),
      ]);

      setTeams(allTeamsData);
      setMyTeams(myTeamsData);
    } catch (error: any) {
      let errorMessage = 'Takımlar yüklenirken bir hata oluştu.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeams();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    navigation.navigate('CreateTeam');
  };

  const handleTeamPress = (team: Team) => {
    navigation.navigate('TeamDetail', {teamId: team.id});
  };

  const renderTeamItem = ({item}: {item: Team}) => (
    <TouchableOpacity
      style={[styles.teamCard, {backgroundColor: colors.card}]}
      onPress={() => handleTeamPress(item)}>
      <View style={styles.teamHeader}>
        {item.logo ? (
          <Image source={{uri: item.logo}} style={styles.teamLogo} />
        ) : (
          <View
            style={[styles.placeholderLogo, {backgroundColor: colors.primary}]}>
            <Text style={styles.placeholderText}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, {color: colors.text}]}>
            {item.name}
          </Text>
          <Text style={[styles.memberCount, {color: colors.text}]}>
            {item.members.length} Üye
          </Text>
        </View>
      </View>
      {item.description && (
        <Text
          style={[styles.teamDescription, {color: colors.text}]}
          numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          {backgroundColor: colors.background},
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          Takımlar yükleniyor...
        </Text>
      </View>
    );
  }

  const displayedTeams = activeTab === 'all' ? teams : myTeams;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'my' && [
              styles.activeTab,
              {borderBottomColor: colors.primary},
            ],
          ]}
          onPress={() => setActiveTab('my')}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'my' ? colors.primary : colors.text},
            ]}>
            Takımlarım
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'all' && [
              styles.activeTab,
              {borderBottomColor: colors.primary},
            ],
          ]}
          onPress={() => setActiveTab('all')}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'all' ? colors.primary : colors.text},
            ]}>
            Tüm Takımlar
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedTeams}
        keyExtractor={item => item.id}
        renderItem={renderTeamItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={50}
              color={colors.text}
            />
            <Text style={[styles.emptyText, {color: colors.text}]}>
              {activeTab === 'my'
                ? 'Henüz bir takıma üye değilsiniz.'
                : 'Henüz takım bulunmuyor.'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fabButton, {backgroundColor: colors.primary}]}
        onPress={handleCreateTeam}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  teamCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
  },
  teamDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

export default TeamsScreen;
