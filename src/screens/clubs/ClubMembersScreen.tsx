import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
} from 'react-native';
import {RouteProp, useRoute, useTheme, Theme} from '@react-navigation/native';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import clubService from '../../services/clubService';

interface CustomTheme extends Theme {
  colors: Theme['colors'] & {
    error: string;
  };
}

interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  rank: string;
  status: string;
  totalKilometers: number;
  customNickname: string | null;
  canCreateEvent: boolean;
  canManageMembers: boolean;
  canManageCity: boolean;
  canSendAnnouncement: boolean;
  canAddProduct: boolean;
  canManageClub: boolean;
  canRemoveMember: boolean;
  hangaroundStartDate: string | null;
  prospectStartDate: string | null;
  memberStartDate: string | null;
  canManageEvents: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

type ClubMembersScreenRouteProp = RouteProp<RootStackParamList, 'ClubMembers'>;

interface EditableMemberFields {
  rank: string;
  status: string;
  totalKilometers: number;
  customNickname: string | null;
  canCreateEvent: boolean;
  canManageMembers: boolean;
  canManageCity: boolean;
  canSendAnnouncement: boolean;
  canAddProduct: boolean;
  canManageClub: boolean;
  canRemoveMember: boolean;
  canManageEvents: boolean;
}

const RANK_OPTIONS = [
  {value: 'general_president', label: 'GENEL BAŞKAN'},
  {value: 'general_vice_president', label: 'GENEL BAŞKAN YARDIMCISI'},
  {value: 'general_secretary', label: 'GENEL SEKRETER'},
  {value: 'general_road_captain', label: 'GENEL YOL KAPTANI'},
  {value: 'general_coordinator', label: 'GENEL KOORDİNATÖR'},
  {value: 'general_treasurer', label: 'GENEL SAYMAN'},
  {value: 'general_discipline', label: 'GENEL DİSİPLİN'},
  {value: 'general_lawyer', label: 'GENEL HUKUK DANIŞMANI'},
  {value: 'city_president', label: 'ŞEHİR BAŞKANI'},
  {value: 'city_vice_president', label: 'ŞEHİR BAŞKAN YARDIMCISI'},
  {value: 'city_secretary', label: 'ŞEHİR SEKRETERİ'},
  {value: 'city_road_captain', label: 'ŞEHİR YOL KAPTANI'},
  {value: 'city_coordinator', label: 'ŞEHİR KOORDİNATÖRÜ'},
  {value: 'city_treasurer', label: 'ŞEHİR SAYMANI'},
  {value: 'city_discipline', label: 'ŞEHİR DİSİPLİN'},
  {value: 'city_coach', label: 'ŞEHİR EĞİTMENİ'},
  {value: 'member', label: 'ÜYE'},
  {value: 'prospect', label: 'ADAY'},
];

const getRankLabel = (rank: string): string => {
  const rankMap: {[key: string]: string} = {
    general_president: 'GENEL BAŞKAN',
    general_vice_president: 'GENEL BAŞKAN YARDIMCISI',
    general_secretary: 'GENEL SEKRETER',
    general_road_captain: 'GENEL YOL KAPTANI',
    general_coordinator: 'GENEL KOORDİNATÖR',
    general_treasurer: 'GENEL SAYMAN',
    general_discipline: 'GENEL DİSİPLİN',
    general_lawyer: 'GENEL HUKUK DANIŞMANI',
    city_president: 'ŞEHİR BAŞKANI',
    city_vice_president: 'ŞEHİR BAŞKAN YARDIMCISI',
    city_secretary: 'ŞEHİR SEKRETERİ',
    city_road_captain: 'ŞEHİR YOL KAPTANI',
    city_coordinator: 'ŞEHİR KOORDİNATÖRÜ',
    city_treasurer: 'ŞEHİR SAYMANI',
    city_discipline: 'ŞEHİR DİSİPLİN',
    city_coach: 'ŞEHİR EĞİTMENİ',
    member: 'ÜYE',
    prospect: 'ADAY',
  };
  return rankMap[rank] || rank;
};

export const ClubMembersScreen = () => {
  const {colors} = useTheme() as CustomTheme;
  const route = useRoute<ClubMembersScreenRouteProp>();
  const {clubId} = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedMember, setEditedMember] = useState<EditableMemberFields | null>(
    null,
  );
  const [showRankSelector, setShowRankSelector] = useState(false);
  const [showKilometerAdd, setShowKilometerAdd] = useState(false);
  const [additionalKilometers, setAdditionalKilometers] = useState('0');
  const [searchText, setSearchText] = useState('');
  const [filterRank, setFilterRank] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [minKm, setMinKm] = useState('');
  const [maxKm, setMaxKm] = useState('');
  const [showRankFilter, setShowRankFilter] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Ad soyad araması
      const fullName =
        `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
      const searchMatch =
        !searchText || fullName.includes(searchText.toLowerCase());

      // Rütbe filtresi
      const rankMatch = !filterRank || member.rank === filterRank;

      // Kilometre filtresi
      const kmMatch =
        (!minKm || member.totalKilometers >= parseInt(minKm)) &&
        (!maxKm || member.totalKilometers <= parseInt(maxKm));

      return searchMatch && rankMatch && kmMatch;
    });
  }, [members, searchText, filterRank, minKm, maxKm]);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clubService.getClubMembers(clubId);

      if (!response.isSuccess || !response.data) {
        throw new Error('Üyeler yüklenirken bir hata oluştu');
      }

      setMembers(response.data);
    } catch (error) {
      console.error('Üyeler yüklenirken hata:', error);
      setError(
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleMemberPress = (member: ClubMember) => {
    setSelectedMember(member);
    setEditedMember({
      rank: member.rank,
      status: member.status,
      totalKilometers: member.totalKilometers,
      customNickname: member.customNickname,
      canCreateEvent: member.canCreateEvent,
      canManageMembers: member.canManageMembers,
      canManageCity: member.canManageCity,
      canSendAnnouncement: member.canSendAnnouncement,
      canAddProduct: member.canAddProduct,
      canManageClub: member.canManageClub,
      canRemoveMember: member.canRemoveMember,
      canManageEvents: member.canManageEvents,
    });
    setModalVisible(true);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      // TODO: API entegrasyonu yapılacak
      Alert.alert(
        'Üye Çıkarma',
        'Bu üyeyi kulüpten çıkarmak istediğinize emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Çıkar',
            style: 'destructive',
            onPress: async () => {
              setModalVisible(false);
              // TODO: API çağrısı yapılacak
              Alert.alert('Başarılı', 'Üye kulüpten çıkarıldı');
              fetchMembers();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Hata', 'Üye çıkarılırken bir hata oluştu');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedMember || !editedMember) return;

    try {
      /* 
      Örnek CURL isteği:
      curl -X PUT 'https://api.example.com/v1/clubs/{clubId}/members/{memberId}' \
      -H 'Authorization: Bearer {token}' \
      -H 'Content-Type: application/json' \
      -d '{
        "rank": "general_president",
        "status": "active",
        "totalKilometers": 150,
        "customNickname": "Road King",
        "canCreateEvent": true,
        "canManageMembers": true,
        "canManageCity": true,
        "canSendAnnouncement": true,
        "canAddProduct": true,
        "canManageClub": true,
        "canRemoveMember": true,
        "canManageEvents": true
      }'
      */

      const response = await clubService.updateClubMember(
        clubId,
        selectedMember.id,
        {
          rank: editedMember.rank,
          status: editedMember.status,
          totalKilometers: editedMember.totalKilometers,
          customNickname: editedMember.customNickname,
          canCreateEvent: editedMember.canCreateEvent,
          canManageMembers: editedMember.canManageMembers,
          canManageCity: editedMember.canManageCity,
          canSendAnnouncement: editedMember.canSendAnnouncement,
          canAddProduct: editedMember.canAddProduct,
          canManageClub: editedMember.canManageClub,
          canRemoveMember: editedMember.canRemoveMember,
          canManageEvents: editedMember.canManageEvents,
        },
      );

      if (!response.isSuccess) {
        throw new Error(response.errors?.[0] || 'Güncelleme başarısız oldu');
      }

      Alert.alert('Başarılı', 'Üye bilgileri güncellendi');
      setModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error('Üye güncellenirken hata:', error);
      Alert.alert(
        'Hata',
        error instanceof Error
          ? error.message
          : 'Üye bilgileri güncellenirken bir hata oluştu',
        [{text: 'Tamam'}],
      );
    }
  };

  const handleKilometerAdd = () => {
    if (editedMember && !isNaN(Number(additionalKilometers))) {
      const newTotal =
        editedMember.totalKilometers + Number(additionalKilometers);
      setEditedMember(prev =>
        prev ? {...prev, totalKilometers: newTotal} : null,
      );
      setAdditionalKilometers('0');
      setShowKilometerAdd(false);
    }
  };

  const renderPermissionSwitch = (
    label: string,
    field: keyof EditableMemberFields,
  ) => (
    <View style={styles.switchContainer}>
      <Text style={[styles.switchLabel, {color: colors.text}]}>{label}</Text>
      <Switch
        value={editedMember?.[field] as boolean}
        onValueChange={value =>
          setEditedMember(prev => (prev ? {...prev, [field]: value} : null))
        }
      />
    </View>
  );

  const renderMemberItem = ({item}: {item: ClubMember}) => (
    <TouchableOpacity
      style={[styles.memberItem, {backgroundColor: colors.card}]}
      onPress={() => handleMemberPress(item)}>
      <Image
        source={{
          uri: item.user.profilePicture || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, {color: colors.text}]}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Text style={[styles.memberRole, {color: COLORS.textSecondary}]}>
          {getRankLabel(item.rank)} •{' '}
          {item.status === 'active' ? 'Aktif' : 'Pasif'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRankSelector = () => (
    <Modal
      visible={showRankSelector}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRankSelector(false)}>
      <View style={styles.rankSelectorOverlay}>
        <View
          style={[styles.rankSelectorContent, {backgroundColor: colors.card}]}>
          <View style={styles.rankSelectorHeader}>
            <Text style={[styles.rankSelectorTitle, {color: colors.text}]}>
              Görev Seç
            </Text>
            <TouchableOpacity
              onPress={() => setShowRankSelector(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={RANK_OPTIONS}
            keyExtractor={item => item.value}
            style={styles.rankSelectorList}
            showsVerticalScrollIndicator={true}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={[
                  styles.rankOption,
                  editedMember?.rank === item.value &&
                    styles.rankOptionSelected,
                  index === RANK_OPTIONS.length - 1 && styles.lastRankOption,
                ]}
                onPress={() => {
                  setEditedMember(prev =>
                    prev ? {...prev, rank: item.value} : null,
                  );
                  setShowRankSelector(false);
                }}>
                <Text
                  style={[
                    styles.rankOptionText,
                    {color: colors.text},
                    editedMember?.rank === item.value &&
                      styles.rankOptionTextSelected,
                  ]}>
                  {item.label}
                </Text>
                {editedMember?.rank === item.value && (
                  <Text style={styles.rankOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
          {selectedMember && editedMember && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  Üye Detayı
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Image
                source={{
                  uri:
                    selectedMember.user.profilePicture ||
                    'https://via.placeholder.com/100',
                }}
                style={styles.modalAvatar}
              />

              <Text style={[styles.modalName, {color: colors.text}]}>
                {selectedMember.user.firstName} {selectedMember.user.lastName}
              </Text>

              <View style={styles.infoContainer}>
                <Text style={[styles.infoLabel, {color: COLORS.textSecondary}]}>
                  E-posta
                </Text>
                <Text style={[styles.infoValue, {color: colors.text}]}>
                  {selectedMember.user.email}
                </Text>

                <Text style={[styles.infoLabel, {color: COLORS.textSecondary}]}>
                  Görev
                </Text>
                <TouchableOpacity
                  style={[styles.selectButton, {borderColor: colors.border}]}
                  onPress={() => setShowRankSelector(true)}>
                  <Text style={[styles.selectButtonText, {color: colors.text}]}>
                    {RANK_OPTIONS.find(
                      option => option.value === editedMember.rank,
                    )?.label || 'Görev Seçiniz'}
                  </Text>
                  <Text style={styles.selectButtonIcon}>▼</Text>
                </TouchableOpacity>

                <Text style={[styles.infoLabel, {color: COLORS.textSecondary}]}>
                  Durum
                </Text>
                <View style={styles.radioContainer}>
                  <Pressable
                    style={[
                      styles.radioButton,
                      editedMember.status === 'active' &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() =>
                      setEditedMember(prev =>
                        prev ? {...prev, status: 'active'} : null,
                      )
                    }>
                    <View
                      style={[
                        styles.radioCircle,
                        editedMember.status === 'active' &&
                          styles.radioCircleSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.radioLabel,
                        {color: colors.text},
                        editedMember.status === 'active' &&
                          styles.radioLabelSelected,
                      ]}>
                      Aktif
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.radioButton,
                      editedMember.status === 'passive' &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() =>
                      setEditedMember(prev =>
                        prev ? {...prev, status: 'passive'} : null,
                      )
                    }>
                    <View
                      style={[
                        styles.radioCircle,
                        editedMember.status === 'passive' &&
                          styles.radioCircleSelected,
                      ]}
                    />
                    <Text
                      style={[
                        styles.radioLabel,
                        {color: colors.text},
                        editedMember.status === 'passive' &&
                          styles.radioLabelSelected,
                      ]}>
                      Pasif
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.infoLabel, {color: COLORS.textSecondary}]}>
                  Toplam Kilometre
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {color: colors.text, borderColor: colors.border},
                  ]}
                  value={editedMember.totalKilometers.toString()}
                  keyboardType="numeric"
                  editable={false}
                  onChangeText={text =>
                    setEditedMember(prev =>
                      prev
                        ? {...prev, totalKilometers: parseInt(text) || 0}
                        : null,
                    )
                  }
                />

                <View style={styles.kilometerAddContainer}>
                  <View style={styles.checkboxContainer}>
                    <Switch
                      value={showKilometerAdd}
                      onValueChange={setShowKilometerAdd}
                    />
                    <Text style={[styles.checkboxLabel, {color: colors.text}]}>
                      Kilometre Ekle
                    </Text>
                  </View>

                  {showKilometerAdd && (
                    <View style={styles.kilometerInputContainer}>
                      <TextInput
                        style={[
                          styles.kilometerInput,
                          {color: colors.text, borderColor: colors.border},
                        ]}
                        value={additionalKilometers}
                        onChangeText={setAdditionalKilometers}
                        keyboardType="numeric"
                        placeholder="Eklenecek KM"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                      <TouchableOpacity
                        style={styles.kilometerAddButton}
                        onPress={handleKilometerAdd}>
                        <Text style={styles.kilometerAddButtonText}>Ekle</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Text style={[styles.infoLabel, {color: COLORS.textSecondary}]}>
                  Özel Takma Ad
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {color: colors.text, borderColor: colors.border},
                  ]}
                  value={editedMember.customNickname || ''}
                  onChangeText={text =>
                    setEditedMember(prev =>
                      prev ? {...prev, customNickname: text} : null,
                    )
                  }
                />

                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  İzinler
                </Text>
                {renderPermissionSwitch(
                  'Etkinlik Oluşturabilir',
                  'canCreateEvent',
                )}
                {renderPermissionSwitch(
                  'Üyeleri Yönetebilir',
                  'canManageMembers',
                )}
                {renderPermissionSwitch(
                  'Şehirleri Yönetebilir',
                  'canManageCity',
                )}
                {renderPermissionSwitch(
                  'Duyuru Gönderebilir',
                  'canSendAnnouncement',
                )}
                {renderPermissionSwitch('Ürün Ekleyebilir', 'canAddProduct')}
                {renderPermissionSwitch('Kulübü Yönetebilir', 'canManageClub')}
                {renderPermissionSwitch('Üye Çıkarabilir', 'canRemoveMember')}
                {renderPermissionSwitch(
                  'Etkinlikleri Yönetebilir',
                  'canManageEvents',
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveChanges}>
                  <Text style={styles.actionButtonText}>
                    Değişiklikleri Kaydet
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={handleRemoveMember}>
                  <Text style={styles.actionButtonText}>Üyeyi Çıkar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderRankFilterModal = () => (
    <Modal
      visible={showRankFilter}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRankFilter(false)}>
      <View style={styles.modalOverlay}>
        <View
          style={[styles.rankFilterContent, {backgroundColor: colors.card}]}>
          <View style={styles.rankFilterHeader}>
            <Text style={[styles.rankFilterTitle, {color: colors.text}]}>
              Görev Filtresi
            </Text>
            <TouchableOpacity
              onPress={() => setShowRankFilter(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={[{value: null, label: 'Tüm Görevler'}, ...RANK_OPTIONS]}
            style={styles.rankFilterList}
            showsVerticalScrollIndicator={true}
            keyExtractor={item => item.value || 'all'}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.rankFilterOption,
                  filterRank === item.value && styles.rankFilterOptionSelected,
                ]}
                onPress={() => {
                  setFilterRank(item.value);
                  setShowRankFilter(false);
                }}>
                <Text
                  style={[
                    styles.rankFilterOptionText,
                    {color: colors.text},
                    filterRank === item.value &&
                      styles.rankFilterOptionTextSelected,
                  ]}>
                  {item.label}
                </Text>
                {filterRank === item.value && (
                  <Text style={styles.rankFilterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.filterContent, {backgroundColor: colors.card}]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, {color: colors.text}]}>
              Filtreleme
            </Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScrollView}>
            <Text style={[styles.filterLabel, {color: COLORS.textSecondary}]}>
              Görev
            </Text>
            <TouchableOpacity
              style={[styles.selectButton, {borderColor: colors.border}]}
              onPress={() => {
                setShowRankFilter(true);
              }}>
              <Text style={[styles.selectButtonText, {color: colors.text}]}>
                {filterRank ? getRankLabel(filterRank) : 'Tüm Görevler'}
              </Text>
              <Text style={styles.selectButtonIcon}>▼</Text>
            </TouchableOpacity>

            <Text style={[styles.filterLabel, {color: COLORS.textSecondary}]}>
              Kilometre Aralığı
            </Text>
            <View style={styles.kmRangeContainer}>
              <TextInput
                style={[
                  styles.kmInput,
                  {color: colors.text, borderColor: colors.border},
                ]}
                value={minKm}
                onChangeText={setMinKm}
                placeholder="Min KM"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={{color: colors.text}}>-</Text>
              <TextInput
                style={[
                  styles.kmInput,
                  {color: colors.text, borderColor: colors.border},
                ]}
                value={maxKm}
                onChangeText={setMaxKm}
                placeholder="Max KM"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setFilterRank(null);
                setMinKm('');
                setMaxKm('');
                setShowFilters(false);
              }}>
              <Text style={styles.clearFiltersText}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {loading ? (
        <View style={[styles.container, styles.centerContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, {color: colors.text}]}>
            Üyeler yükleniyor...
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.container, styles.centerContainer]}>
          <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMembers}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : members.length === 0 ? (
        <View style={[styles.container, styles.centerContainer]}>
          <Text style={[styles.emptyText, {color: colors.text}]}>
            Henüz üye bulunmuyor...
          </Text>
        </View>
      ) : (
        <>
          <View
            style={[styles.searchContainer, {backgroundColor: colors.card}]}>
            <TextInput
              style={[
                styles.searchInput,
                {color: colors.text, borderColor: colors.border},
              ]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Ad Soyad Ara..."
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}>
              <Text style={styles.filterButtonText}>Filtrele</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.headerContainer, {backgroundColor: colors.card}]}>
            <Text style={[styles.headerText, {color: colors.text}]}>
              Toplam Üye: {filteredMembers.length}
            </Text>
          </View>

          <FlatList
            data={filteredMembers}
            renderItem={renderMemberItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onRefresh={fetchMembers}
            refreshing={loading}
          />
          {renderModal()}
          {renderRankSelector()}
          {renderFilters()}
          {renderRankFilterModal()}
        </>
      )}
    </View>
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
  listContent: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    marginBottom: 4,
  },
  memberRole: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  headerContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  removeButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  modalScrollView: {
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.bold,
    marginTop: 16,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    flex: 1,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radioButtonSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  radioLabelSelected: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    color: COLORS.primary,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    flex: 1,
  },
  selectButtonIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  rankSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  rankSelectorContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    paddingBottom: 0,
  },
  rankSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  rankSelectorTitle: {
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  rankSelectorList: {
    width: '100%',
    paddingBottom: 20,
  },
  rankOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRankOption: {
    borderBottomWidth: 0,
  },
  rankOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  rankOptionText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  rankOptionTextSelected: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  rankOptionCheck: {
    color: COLORS.primary,
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  kilometerAddContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  kilometerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  kilometerInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 16,
  },
  kilometerAddButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kilometerAddButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  filterContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 8,
  },
  filterScrollView: {
    width: '100%',
  },
  kmRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  kmInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.error,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  clearFiltersText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  memberKm: {
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginTop: 2,
  },
  rankFilterContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    paddingBottom: 0,
  },
  rankFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  rankFilterTitle: {
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  rankFilterList: {
    width: '100%',
    paddingBottom: 20,
  },
  rankFilterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankFilterOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  rankFilterOptionText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
  },
  rankFilterOptionTextSelected: {
    fontFamily: FONTS.FONT_FAMILY.bold,
    color: COLORS.primary,
  },
  rankFilterOptionCheck: {
    color: COLORS.primary,
    fontSize: 20,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
} as const);
