import React, {useState, useLayoutEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  TextInput as PaperTextInput,
  Button,
  Switch,
  IconButton,
  Chip,
} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import EventService, {Event} from '../../services/eventService';
import {RouteProp} from '@react-navigation/native';
import {LocationSearch} from '../../components/search/LocationSearch';
import ScreenWrapper from '../../components/common/ScreenWrapper';

type EditEventScreenRouteProp = RouteProp<RootStackParamList, 'EditEvent'>;
type EditEventScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

interface EventWaypoint {
  locationName: string;
  latitude: string;
  longitude: string;
  description: string;
}

// calculateDistance fonksiyonunu burada tanımlayalım
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
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
};

export const EditEventScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<EditEventScreenNavigationProp>();
  const route = useRoute<EditEventScreenRouteProp>();
  const {eventData} = route.params;

  const [title, setTitle] = useState(eventData.title);
  const [description, setDescription] = useState(eventData.description);
  const [type, setType] = useState(eventData.type);
  const [startDate, setStartDate] = useState(new Date(eventData.startDate));
  const [endDate, setEndDate] = useState(
    eventData.endDate ? new Date(eventData.endDate) : null,
  );

  // Konum state'leri
  const [startLocation, setStartLocation] = useState<Location>({
    name: eventData.locationName || '',
    latitude: eventData.latitude ? Number(eventData.latitude) : 0,
    longitude: eventData.longitude ? Number(eventData.longitude) : 0,
  });

  const [endLocation, setEndLocation] = useState<Location>({
    name: eventData.destinationLocationName || '',
    latitude: eventData.destinationLatitude
      ? Number(eventData.destinationLatitude)
      : 0,
    longitude: eventData.destinationLongitude
      ? Number(eventData.destinationLongitude)
      : 0,
  });

  const [waypoints, setWaypoints] = useState<EventWaypoint[]>(() =>
    (eventData.waypoints || []).map(wp => ({
      locationName: wp.name || '',
      latitude: String(wp.latitude || 0),
      longitude: String(wp.longitude || 0),
      description: wp.description || '',
    })),
  );

  const [maxParticipants, setMaxParticipants] = useState(
    eventData.maxParticipants?.toString() || '',
  );
  const [isPrivate, setIsPrivate] = useState(eventData.isPrivate || false);

  // Etiket state'leri
  const [tags, setTags] = useState<string[]>(eventData.tags || []);
  const [currentTag, setCurrentTag] = useState('');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSelectionType, setLocationSelectionType] = useState<
    'start' | 'end' | 'waypoint'
  >('start');
  const [loading, setLoading] = useState(false);

  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const [distance, setDistance] = useState(eventData.distance || 0);
  const [travelLink, setTravelLink] = useState(eventData.travelLink || '');

  const [waypointDescription, setWaypointDescription] = useState('');
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<
    number | null
  >(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Etkinliği Düzenle',
    });
  }, [navigation]);

  const updateTravelLink = useCallback(() => {
    if (startLocation && endLocation) {
      let waypointsStr = '';
      if (waypoints.length > 0) {
        // Google Maps için waypoints formatı: lat,lng|lat,lng
        const waypointsCoords = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');

        waypointsStr = `&waypoints=${encodeURIComponent(waypointsCoords)}`;
      }

      const link = `https://www.google.com/maps/dir/?api=1&origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}${waypointsStr}&travelmode=driving`;

      let totalDistance = 0;
      let prevLocation = {
        latitude: Number(startLocation.latitude),
        longitude: Number(startLocation.longitude),
        name: startLocation.name,
      };

      waypoints.forEach(wp => {
        totalDistance += calculateDistance(
          Number(prevLocation.latitude),
          Number(prevLocation.longitude),
          Number(wp.latitude),
          Number(wp.longitude),
        );
        prevLocation = {
          latitude: Number(wp.latitude),
          longitude: Number(wp.longitude),
          name: wp.locationName,
        };
      });

      totalDistance += calculateDistance(
        Number(prevLocation.latitude),
        Number(prevLocation.longitude),
        Number(endLocation.latitude),
        Number(endLocation.longitude),
      );

      setTravelLink(link);
      setDistance(Math.round(totalDistance));
    }
  }, [startLocation, endLocation, waypoints]);

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!startLocation || !endLocation) {
        Alert.alert('Hata', 'Başlangıç ve varış noktaları seçilmelidir.');
        return;
      }

      updateTravelLink();
      await new Promise(resolve => setTimeout(resolve, 100));

      let defaultTravelLink = `https://www.google.com/maps/dir/?api=1&origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}`;

      if (waypoints.length > 0) {
        const waypointsCoords = waypoints
          .map(wp => `${wp.latitude},${wp.longitude}`)
          .join('|');
        defaultTravelLink += `&waypoints=${encodeURIComponent(
          waypointsCoords,
        )}`;
      }
      defaultTravelLink += '&travelmode=driving';

      const eventPayload: Partial<Event> = {
        title,
        description,
        type,
        scope: eventData.scope || 'club',
        clubId: eventData.clubId,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        locationName: startLocation.name,
        latitude: Number(startLocation.latitude),
        longitude: Number(startLocation.longitude),
        targetRanks: eventData.targetRanks
          ? typeof eventData.targetRanks === 'string'
            ? [eventData.targetRanks]
            : eventData.targetRanks
          : ['beginner'],
        destinationLocationName: endLocation.name,
        destinationLatitude: Number(endLocation.latitude),
        destinationLongitude: Number(endLocation.longitude),
        waypoints: waypoints.map(wp => ({
          name: wp.locationName,
          latitude: Number(wp.latitude),
          longitude: Number(wp.longitude),
          description: wp.description || '',
        })),
        maxParticipants: maxParticipants ? Number(maxParticipants) : 0,
        isPrivate,
        tags: tags || [],
        distance: Number(distance),
        travelLink: travelLink || defaultTravelLink,
      };

      console.log('Gönderilen veri:', JSON.stringify(eventPayload, null, 2));

      try {
        const response = await EventService.updateEvent(
          eventData.id,
          eventPayload,
        );
        if (response) {
          Alert.alert('Başarılı', 'Etkinlik başarıyla güncellendi');
          navigation.goBack();
        }
      } catch (error: any) {
        let errorMessage = 'Etkinlik güncellenirken bir hata oluştu';

        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          errorMessage = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join('\n')
            : error.response.data.errors;
        }

        console.error('Etkinlik güncelleme hatası:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        Alert.alert('Hata', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDatePickerVisible(false);
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(date);
    }
  };

  const handleEndDateConfirm = (date: Date) => {
    if (date < startDate) {
      Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden önce olamaz');
      return;
    }
    setEndDatePickerVisible(false);
    setEndDate(date);
  };

  const onLocationSelect = (selectedLocation: Location) => {
    switch (locationSelectionType) {
      case 'start':
        setStartLocation(selectedLocation);
        break;
      case 'end':
        setEndLocation(selectedLocation);
        break;
      case 'waypoint':
        const newWaypoint: EventWaypoint = {
          locationName: selectedLocation.name,
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
          description: '',
        };
        setWaypoints([...waypoints, newWaypoint]);
        break;
    }
    setShowLocationModal(false);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <PaperTextInput
          label="Etkinlik Başlığı"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />

        <PaperTextInput
          label="Açıklama"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.pickerContainer}>
          <Text style={[styles.label, {color: colors.text}]}>
            Etkinlik Türü
          </Text>
          <Picker
            selectedValue={type}
            onValueChange={itemValue => setType(itemValue)}
            style={[styles.picker, {color: colors.text}]}>
            <Picker.Item label="Sürüş" value="ride" />
            <Picker.Item label="Toplantı" value="meeting" />
          </Picker>
        </View>

        {/* Başlangıç Tarihi Seçici */}
        <View style={styles.dateContainer}>
          <Text style={[styles.label, {color: colors.text}]}>
            Başlangıç Tarihi
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setStartDatePickerVisible(true)}>
            <Text style={{color: colors.text}}>
              {format(startDate, 'd MMMM yyyy HH:mm', {locale: tr})}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="datetime"
          onConfirm={handleStartDateConfirm}
          onCancel={() => setStartDatePickerVisible(false)}
          date={startDate}
          locale="tr"
          confirmTextIOS="Tamam"
          cancelTextIOS="İptal"
          title="Başlangıç Tarihi Seç"
        />

        {/* Bitiş Tarihi Seçici */}
        <View style={styles.dateContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Bitiş Tarihi</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setEndDatePickerVisible(true)}>
            <Text style={{color: colors.text}}>
              {endDate
                ? format(endDate, 'd MMMM yyyy HH:mm', {locale: tr})
                : 'Seçilmedi'}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="datetime"
          onConfirm={handleEndDateConfirm}
          onCancel={() => setEndDatePickerVisible(false)}
          date={endDate || startDate}
          minimumDate={startDate}
          locale="tr"
          confirmTextIOS="Tamam"
          cancelTextIOS="İptal"
          title="Bitiş Tarihi Seç"
        />

        {/* Başlangıç Noktası */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            setLocationSelectionType('start');
            setShowLocationModal(true);
          }}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.label, {color: colors.text, marginLeft: 8}]}>
              Başlangıç Noktası
            </Text>
          </View>
          <Text style={{color: colors.text}}>
            {startLocation.name || 'Konum seçmek için dokunun'}
          </Text>
        </TouchableOpacity>

        {/* Ara Konumlar */}
        <View style={styles.waypointsContainer}>
          <View style={styles.waypointsHeader}>
            <Text style={[styles.label, {color: colors.text}]}>
              Ara Konumlar
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setLocationSelectionType('waypoint');
                setShowLocationModal(true);
              }}
              icon="plus"
              style={styles.addWaypointButton}>
              Ara Konum Ekle
            </Button>
          </View>

          {waypoints.map((waypoint, index) => (
            <View key={index} style={styles.waypointCard}>
              <View style={styles.waypointHeader}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.waypointName, {color: colors.text}]}>
                  {waypoint.locationName}
                </Text>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => removeWaypoint(index)}
                />
              </View>
              <Text style={[styles.waypointDescription, {color: colors.text}]}>
                {waypoint.description || 'Açıklama eklenmemiş'}
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedWaypointIndex(index);
                  setWaypointDescription(waypoint.description);
                  setShowLocationModal(true);
                  setLocationSelectionType('waypoint');
                }}
                style={styles.editWaypointButton}>
                Düzenle
              </Button>
            </View>
          ))}
        </View>

        {/* Varış Noktası */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            setLocationSelectionType('end');
            setShowLocationModal(true);
          }}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons
              name="flag"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.label, {color: colors.text, marginLeft: 8}]}>
              Varış Noktası
            </Text>
          </View>
          <Text style={{color: colors.text}}>
            {endLocation.name || 'Konum seçmek için dokunun'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showLocationModal}
          animationType="slide"
          onRequestClose={() => {
            setShowLocationModal(false);
            setWaypointDescription('');
            setSelectedWaypointIndex(null);
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {locationSelectionType === 'start'
                  ? 'Başlangıç Konumu Seç'
                  : locationSelectionType === 'end'
                  ? 'Varış Konumu Seç'
                  : selectedWaypointIndex !== null
                  ? 'Ara Konumu Düzenle'
                  : 'Ara Konum Ekle'}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setShowLocationModal(false);
                  setWaypointDescription('');
                  setSelectedWaypointIndex(null);
                }}
              />
            </View>

            {(locationSelectionType === 'start' ||
              locationSelectionType === 'end' ||
              selectedWaypointIndex === null) && (
              <LocationSearch
                onSelectLocation={selectedLocation => {
                  if (locationSelectionType === 'waypoint') {
                    const newWaypoint: EventWaypoint = {
                      locationName: selectedLocation.name,
                      latitude: selectedLocation.latitude.toString(),
                      longitude: selectedLocation.longitude.toString(),
                      description: '',
                    };
                    setWaypoints([...waypoints, newWaypoint]);
                    setSelectedWaypointIndex(waypoints.length);
                  } else {
                    onLocationSelect(selectedLocation);
                    setShowLocationModal(false);
                  }
                }}
                onClose={() => {
                  setShowLocationModal(false);
                  setWaypointDescription('');
                  setSelectedWaypointIndex(null);
                }}
                placeholder={
                  locationSelectionType === 'start'
                    ? 'Başlangıç konumunu ara...'
                    : locationSelectionType === 'end'
                    ? 'Varış konumunu ara...'
                    : 'Ara konum ara...'
                }
              />
            )}

            {locationSelectionType === 'waypoint' &&
              selectedWaypointIndex !== null && (
                <View style={styles.waypointDescriptionContainer}>
                  <Text style={[styles.label, {color: colors.text}]}>
                    Konum Açıklaması
                  </Text>
                  <PaperTextInput
                    mode="outlined"
                    value={waypointDescription}
                    onChangeText={setWaypointDescription}
                    placeholder="Örn: Mola noktası, Yakıt istasyonu"
                    multiline
                    numberOfLines={3}
                    style={styles.waypointDescriptionInput}
                  />
                  <View style={styles.modalButtons}>
                    <Button
                      mode="contained"
                      onPress={() => {
                        const updatedWaypoints = [...waypoints];
                        updatedWaypoints[selectedWaypointIndex] = {
                          ...updatedWaypoints[selectedWaypointIndex],
                          description: waypointDescription,
                        };
                        setWaypoints(updatedWaypoints);
                        setShowLocationModal(false);
                        setWaypointDescription('');
                        setSelectedWaypointIndex(null);
                      }}
                      style={styles.saveButton}>
                      Kaydet
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        if (selectedWaypointIndex === waypoints.length) {
                          // Yeni eklenen waypoint'i iptal et
                          setWaypoints(waypoints.slice(0, -1));
                        }
                        setShowLocationModal(false);
                        setWaypointDescription('');
                        setSelectedWaypointIndex(null);
                      }}
                      style={styles.cancelButton}>
                      İptal
                    </Button>
                  </View>
                </View>
              )}
          </View>
        </Modal>

        <PaperTextInput
          label="Maksimum Katılımcı Sayısı"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        {/* Etiketler */}
        <View style={styles.tagsContainer}>
          <Text style={[styles.label, {color: colors.text}]}>Etiketler</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.tagInputField, {color: colors.text}]}
              value={currentTag}
              onChangeText={setCurrentTag}
              placeholder="Etiket ekle"
              placeholderTextColor={COLORS.textSecondary}
              onSubmitEditing={addTag}
            />
            <IconButton icon="plus" size={20} onPress={addTag} />
          </View>
          <View style={styles.tagsList}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                onClose={() => removeTag(tag)}
                style={styles.tag}
                textStyle={{color: colors.text}}>
                {tag}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={[styles.label, {color: colors.text}]}>
            Özel Etkinlik
          </Text>
          <Switch value={isPrivate} onValueChange={setIsPrivate} />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}>
          Kaydet
        </Button>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    marginTop: 8,
  },
  label: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  locationButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  waypointsContainer: {
    marginBottom: 16,
  },
  waypointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addWaypointButton: {
    marginLeft: 8,
  },
  waypointCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  waypointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  waypointName: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginLeft: 8,
  },
  waypointDescription: {
    fontSize: 14,
    marginBottom: 12,
    color: COLORS.textSecondary,
  },
  editWaypointButton: {
    marginTop: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInputField: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  waypointDescriptionContainer: {
    padding: 16,
  },
  waypointDescriptionInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
});

export default EditEventScreen;
