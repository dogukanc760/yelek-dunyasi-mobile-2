import React, {useState, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, SIZES} from '../../constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  TextInput as PaperTextInput,
  Button,
  Switch,
  IconButton,
} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import apiClient from '../../services/api';
import {RouteProp} from '@react-navigation/native';
import {LocationSearch} from '../../components/search/LocationSearch';
import ScreenWrapper from '../../components/common/ScreenWrapper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CreateEventScreenRouteProp = RouteProp<RootStackParamList, 'CreateEvent'>;

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface City {
  id: string;
  clubId: string;
  cityId: string;
  city: {
    id: string;
    name: string;
  };
}

interface WayPoint {
  location: Location;
  description: string;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startLocation: Location | null;
  endLocation: Location | null;
  waypoints: WayPoint[];
  maxParticipants: string;
  isPrivate: boolean;
  tags: string[];
  selectedCityId: string;
  distance: number;
  travelLink: string;
  type?: 'training' | 'general';
  scope?: 'club' | 'public';
  targetRanks?: string[];
}

// LocationSelectionModal bileşenini ana bileşenin dışına çıkaralım
interface LocationSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectingStartLocation: boolean;
  onSelectLocation: (location: Location) => void;
}

const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
  visible,
  onClose,
  selectingStartLocation,
  onSelectLocation,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{flex: 1, backgroundColor: COLORS.background}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SIZES.spacing.md,
            paddingVertical: SIZES.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}>
          <Text style={{fontSize: 18, fontWeight: '600', color: COLORS.text}}>
            {selectingStartLocation
              ? 'Başlangıç Konumu Seç'
              : 'Varış Konumu Seç'}
          </Text>
          <IconButton icon="close" onPress={onClose} iconColor={COLORS.text} />
        </View>
        <View style={{flex: 1, paddingTop: SIZES.spacing.md}}>
          <LocationSearch
            placeholder={
              selectingStartLocation
                ? 'Başlangıç konumunu ara...'
                : 'Varış konumunu ara...'
            }
            onSelectLocation={onSelectLocation}
            onClose={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

// WayPoint Modal bileşeni
interface WayPointModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (waypoint: WayPoint) => void;
}

const WayPointModal: React.FC<WayPointModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (selectedLocation) {
      onSave({
        location: selectedLocation,
        description,
      });
      setSelectedLocation(null);
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{flex: 1, backgroundColor: COLORS.background}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SIZES.spacing.md,
            paddingVertical: SIZES.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}>
          <Text style={{fontSize: 18, fontWeight: '600', color: COLORS.text}}>
            Ara Konum Ekle
          </Text>
          <IconButton icon="close" onPress={onClose} iconColor={COLORS.text} />
        </View>
        <View style={{flex: 1, paddingTop: SIZES.spacing.md}}>
          <LocationSearch
            placeholder="Ara konum ara..."
            onSelectLocation={setSelectedLocation}
            onClose={onClose}
          />
          {selectedLocation && (
            <View style={{padding: SIZES.spacing.md}}>
              <PaperTextInput
                label="Konum Açıklaması"
                value={description}
                onChangeText={setDescription}
                placeholder="Örn: Mola noktası, Yakıt istasyonu"
                style={{marginBottom: SIZES.spacing.md}}
              />
              <Button
                mode="contained"
                onPress={handleSave}
                style={{marginTop: SIZES.spacing.sm}}
                disabled={!description.trim()}>
                Kaydet
              </Button>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const CreateEventScreen: React.FC = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CreateEventScreenRouteProp>();
  const clubId = route.params?.clubId;
  const [loading, setLoading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectingStartLocation, setSelectingStartLocation] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [waypointModalVisible, setWaypointModalVisible] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    startLocation: null,
    endLocation: null,
    waypoints: [],
    maxParticipants: '10',
    isPrivate: false,
    tags: [],
    selectedCityId: '',
    distance: 0,
    travelLink: '',
    type: clubId ? 'training' : 'general',
    scope: clubId ? 'club' : 'public',
    targetRanks: [],
  });

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Etkinlik Oluştur',
    });
  }, [navigation]);

  const fetchCities = useCallback(async () => {
    if (!clubId) return;

    try {
      const response = await apiClient.get(`/api/v1/clubs/${clubId}/cities`);
      console.log('Şehirler yüklendi:', response.data);
      setCities(response.data.data);
      if (response.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          selectedCityId: response.data.data[0].id,
        }));
      }
    } catch (error) {
      console.error('Şehir yükleme hatası:', error);
      Alert.alert('Hata', 'Şehir bilgileri alınamadı.');
    }
  }, [clubId]);

  React.useEffect(() => {
    if (clubId) {
      fetchCities();
    }
  }, [fetchCities, clubId]);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Dünya'nın yarıçapı (km)
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const updateTravelLink = useCallback(() => {
    const {startLocation, endLocation, waypoints} = formData;
    if (startLocation && endLocation) {
      let waypointsStr = '';
      if (waypoints.length > 0) {
        console.log('Mevcut waypoints:', waypoints);

        // Waypoint koordinatlarını oluştur
        const waypointsCoords = waypoints
          .map(wp => `${wp.location.latitude},${wp.location.longitude}`)
          .join('|');

        console.log('Birleştirilmiş waypoints:', waypointsCoords);

        // URL encode işlemi
        const encodedWaypoints = encodeURIComponent(waypointsCoords);
        console.log('URL encoded waypoints:', encodedWaypoints);

        waypointsStr = `&waypoints=${encodedWaypoints}`;
        console.log('Final waypoints string:', waypointsStr);
      }

      const link = `https://www.google.com/maps/dir/?api=1&origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}${waypointsStr}`;

      console.log('Oluşturulan final URL:', link);

      // Toplam mesafeyi hesapla
      let totalDistance = 0;
      let prevLocation = startLocation;

      // Ara konumlar arası mesafeleri hesapla
      waypoints.forEach((wp, index) => {
        console.log(`Waypoint ${index + 1}:`, wp.location);
        totalDistance += calculateDistance(
          prevLocation.latitude,
          prevLocation.longitude,
          wp.location.latitude,
          wp.location.longitude,
        );
        prevLocation = wp.location;
      });

      // Son konum ile bitiş noktası arası mesafeyi hesapla
      totalDistance += calculateDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        endLocation.latitude,
        endLocation.longitude,
      );

      setFormData(prev => ({
        ...prev,
        travelLink: link,
        distance: Math.round(totalDistance),
      }));
    }
  }, [formData, calculateDistance]);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const togglePrivate = () => {
    setFormData(prev => ({...prev, isPrivate: !prev.isPrivate}));
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title) {
      Alert.alert('Hata', 'Lütfen etkinlik başlığı girin.');
      return false;
    }
    if (!formData.description) {
      Alert.alert('Hata', 'Lütfen etkinlik açıklaması girin.');
      return false;
    }
    if (clubId && !formData.selectedCityId) {
      Alert.alert('Hata', 'Lütfen şehir seçin.');
      return false;
    }
    if (!formData.startLocation || !formData.endLocation) {
      Alert.alert('Hata', 'Başlangıç ve bitiş konumlarını seçmelisiniz.');
      return false;
    }
    if (!formData.travelLink) {
      Alert.alert(
        'Hata',
        'Rota bilgisi oluşturulamadı. Lütfen konumları tekrar seçin.',
      );
      return false;
    }
    if (
      isNaN(parseInt(formData.maxParticipants)) ||
      parseInt(formData.maxParticipants) <= 0
    ) {
      Alert.alert('Hata', 'Lütfen geçerli bir katılımcı sayısı girin.');
      return false;
    }
    if (formData.endDate <= formData.startDate) {
      Alert.alert(
        'Hata',
        'Bitiş tarihi, başlangıç tarihinden sonra olmalıdır.',
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Submit butonuna tıklandı');

    // Son bir kez travelLink'i güncelle
    updateTravelLink();

    if (!validateForm()) {
      console.log('Form validasyonu başarısız');
      return;
    }

    setLoading(true);
    console.log('Event oluşturma başladı');

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        scope: formData.scope,
        clubId: clubId || undefined,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        locationName: formData.startLocation?.name,
        latitude: formData.startLocation?.latitude,
        longitude: formData.startLocation?.longitude,
        destinationLocationName: formData.endLocation?.name,
        destinationLatitude: formData.endLocation?.latitude,
        destinationLongitude: formData.endLocation?.longitude,
        waypoints: formData.waypoints.map(wp => ({
          name: wp.location.name,
          latitude: wp.location.latitude,
          longitude: wp.location.longitude,
          description: wp.description,
        })),
        maxParticipants: parseInt(formData.maxParticipants),
        isPrivate: formData.isPrivate,
        tags: formData.tags,
        clubCityId: clubId ? formData.selectedCityId : undefined,
        distance: formData.distance,
        travelLink: formData.travelLink,
        targetRanks: formData.targetRanks,
      };

      console.log(
        'API isteği gönderiliyor:',
        JSON.stringify(eventData, null, 2),
      );
      const response = await apiClient.post('/api/v1/events', eventData);
      console.log('API yanıtı:', JSON.stringify(response.data, null, 2));

      if (response.data.isSuccess) {
        Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu.');
        navigation.goBack();
      } else {
        Alert.alert('Hata', response.data.message || 'Etkinlik oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Etkinlik oluşturma hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert(
        'Hata',
        error.response?.data?.message ||
          'Etkinlik oluşturulurken bir hata oluştu.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Ara konum ekleme fonksiyonu
  const addWaypoint = (waypoint: WayPoint) => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, waypoint],
    }));
    updateTravelLink();
  };

  // Ara konum silme fonksiyonu
  const removeWaypoint = useCallback(
    (index: number) => {
      setFormData(prev => ({
        ...prev,
        waypoints: prev.waypoints.filter((_, i) => i !== index),
      }));
      updateTravelLink();
    },
    [updateTravelLink],
  );

  const renderWaypoint = ({item, index}: {item: WayPoint; index: number}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.card,
          padding: SIZES.spacing.sm,
          marginVertical: 4,
          borderRadius: 8,
        }}>
        <View style={{flex: 1}}>
          <Text style={{color: COLORS.text, fontWeight: '500'}}>
            {item.location.name}
          </Text>
          <Text style={{color: COLORS.textSecondary, fontSize: 12}}>
            {item.description}
          </Text>
        </View>
        <IconButton
          icon="delete"
          onPress={() => removeWaypoint(index)}
          iconColor={COLORS.error}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper backgroundColor={colors.background}>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          {/* Başlık */}
          <PaperTextInput
            label="Etkinlik Başlığı"
            value={formData.title}
            onChangeText={value => handleInputChange('title', value)}
            style={styles.input}
          />

          {/* Açıklama */}
          <PaperTextInput
            label="Açıklama"
            value={formData.description}
            onChangeText={value => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          {clubId && (
            <>
              {/* Şehir Seçimi */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.selectedCityId}
                  onValueChange={value =>
                    handleInputChange('selectedCityId', value)
                  }>
                  {cities.map(city => (
                    <Picker.Item
                      key={city.id}
                      label={city.city.name}
                      value={city.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* Başlangıç Konumu */}
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => {
                  setSelectingStartLocation(true);
                  setLocationModalVisible(true);
                }}>
                <View style={styles.routePointContainer}>
                  <View style={styles.routePointBadge}>
                    <MaterialCommunityIcons
                      name="flag-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.routePointContent}>
                    <View style={styles.locationContentWrapper}>
                      <Text style={styles.label}>Başlangıç Noktası</Text>
                      <Text
                        style={[styles.locationText, {color: colors.text}]}
                        numberOfLines={2}>
                        {formData.startLocation
                          ? formData.startLocation.name
                          : 'Konum seçmek için dokunun'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Ara Konumlar Bölümü */}
              <View style={styles.waypointsSection}>
                <Text style={styles.label}>Ara Konumlar</Text>
                <Button
                  mode="outlined"
                  onPress={() => setWaypointModalVisible(true)}
                  style={styles.addWaypointButton}
                  icon="plus">
                  Ara Konum Ekle
                </Button>

                {formData.waypoints.length > 0 && (
                  <FlatList
                    data={formData.waypoints}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderWaypoint}
                    scrollEnabled={false}
                    style={{marginTop: SIZES.spacing.sm}}
                  />
                )}
              </View>

              {/* Varış Konumu */}
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => {
                  setSelectingStartLocation(false);
                  setLocationModalVisible(true);
                }}>
                <View style={styles.routePointContainer}>
                  <View style={styles.routePointBadge}>
                    <MaterialCommunityIcons
                      name="flag-checkered"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.routePointContent}>
                    <View style={styles.locationContentWrapper}>
                      <Text style={styles.label}>Varış Noktası</Text>
                      <Text
                        style={[styles.locationText, {color: colors.text}]}
                        numberOfLines={2}>
                        {formData.endLocation
                          ? formData.endLocation.name
                          : 'Konum seçmek için dokunun'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {formData.distance > 0 && (
                <Text style={styles.distanceText}>
                  Toplam Mesafe: {formData.distance} km
                </Text>
              )}
            </>
          )}

          {/* Tarih Seçimi */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.label}>Başlangıç Tarihi</Text>
            <Text style={[styles.dateText, {color: colors.text}]}>
              {format(formData.startDate, 'dd MMMM yyyy HH:mm', {locale: tr})}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="date"
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (event.type === 'set' && date) {
                  handleInputChange('startDate', date);
                  setShowStartTimePicker(true);
                }
              }}
            />
          )}

          {Platform.OS === 'android' && showStartTimePicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="time"
              onChange={(event, date) => {
                setShowStartTimePicker(false);
                if (event.type === 'set' && date) {
                  const newDate = new Date(formData.startDate);
                  newDate.setHours(date.getHours());
                  newDate.setMinutes(date.getMinutes());
                  handleInputChange('startDate', newDate);
                }
              }}
            />
          )}

          {Platform.OS === 'ios' && showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate}
              mode="datetime"
              display="spinner"
              onChange={(event, date) => {
                if (date) {
                  handleInputChange('startDate', date);
                }
              }}
            />
          )}

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.label}>Bitiş Tarihi</Text>
            <Text style={[styles.dateText, {color: colors.text}]}>
              {format(formData.endDate, 'dd MMMM yyyy HH:mm', {locale: tr})}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'android' && showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="date"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (event.type === 'set' && date) {
                  handleInputChange('endDate', date);
                  setShowEndTimePicker(true);
                }
              }}
            />
          )}

          {Platform.OS === 'android' && showEndTimePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="time"
              onChange={(event, date) => {
                setShowEndTimePicker(false);
                if (event.type === 'set' && date) {
                  const newDate = new Date(formData.endDate);
                  newDate.setHours(date.getHours());
                  newDate.setMinutes(date.getMinutes());
                  handleInputChange('endDate', newDate);
                }
              }}
            />
          )}

          {Platform.OS === 'ios' && showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate}
              mode="datetime"
              display="spinner"
              minimumDate={formData.startDate}
              onChange={(event, date) => {
                if (date) {
                  handleInputChange('endDate', date);
                }
              }}
            />
          )}

          {/* Katılımcı Sayısı */}
          <PaperTextInput
            label="Maksimum Katılımcı Sayısı"
            value={formData.maxParticipants}
            onChangeText={value => handleInputChange('maxParticipants', value)}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Etiketler */}
          <View style={styles.tagSection}>
            <Text style={styles.label}>Etiketler</Text>
            <View style={styles.tagInputContainer}>
              <PaperTextInput
                style={styles.tagInput}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder="Etiket ekle"
              />
              <TouchableOpacity style={styles.tagButton} onPress={addTag}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <MaterialCommunityIcons
                      name="close"
                      size={18}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Gizlilik */}
          <View style={styles.privacySection}>
            <Text style={styles.label}>Gizlilik</Text>
            <View style={styles.privacyToggle}>
              <Switch
                value={formData.isPrivate}
                onValueChange={togglePrivate}
              />
              <Text style={[styles.privacyText, {color: colors.text}]}>
                {formData.isPrivate ? 'Özel Etkinlik' : 'Herkese Açık'}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}>
            Etkinlik Oluştur
          </Button>
        </View>

        <LocationSelectionModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          selectingStartLocation={selectingStartLocation}
          onSelectLocation={location => {
            setFormData(prev => ({
              ...prev,
              [selectingStartLocation ? 'startLocation' : 'endLocation']:
                location,
            }));
            updateTravelLink();
            setLocationModalVisible(false);
          }}
        />

        <WayPointModal
          visible={waypointModalVisible}
          onClose={() => setWaypointModalVisible(false)}
          onSave={addWaypoint}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: SIZES.spacing.md,
  },
  input: {
    marginBottom: SIZES.spacing.md,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  locationButton: {
    marginBottom: SIZES.spacing.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  locationContentWrapper: {
    flex: 1,
    marginRight: SIZES.spacing.sm,
  },
  locationText: {
    fontSize: 14,
    flexWrap: 'wrap',
  },
  datePickerButton: {
    marginBottom: SIZES.spacing.md,
  },
  dateText: {
    fontSize: 16,
    marginTop: 4,
  },
  tagSection: {
    marginBottom: SIZES.spacing.md,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 4,
  },
  privacySection: {
    marginBottom: SIZES.spacing.md,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    marginLeft: 8,
  },
  submitButton: {
    marginTop: SIZES.spacing.lg,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    paddingTop: SIZES.spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalButton: {
    color: COLORS.primary,
    fontSize: 16,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 8,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.background,
  },
  resultsList: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultText: {
    color: COLORS.text,
    fontSize: 16,
  },
  loading: {
    marginTop: 20,
  },
  waypointsSection: {
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  addWaypointButton: {
    marginBottom: SIZES.spacing.sm,
  },
  waypointItem: {
    marginBottom: SIZES.spacing.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  waypointDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  waypointForm: {
    padding: SIZES.spacing.md,
  },
  waypointInput: {
    marginBottom: SIZES.spacing.md,
  },
  waypointButton: {
    marginTop: SIZES.spacing.sm,
  },
  routePointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  routePointBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routePointContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeConnector: {
    position: 'absolute',
    left: 16,
    top: 40,
    bottom: -8,
    width: 2,
    backgroundColor: COLORS.border,
  },
  waypointNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  waypointsList: {
    paddingVertical: SIZES.spacing.sm,
  },
  bottomButtonContainer: {
    padding: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateEventScreen;
