import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {GOOGLE_PLACES_API_KEY} from '@env';
import {COLORS} from '../../constants';
import MapView, {Marker} from 'react-native-maps';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  placeholder?: string;
  onSelectLocation: (location: Location) => void;
  onClose: () => void;
  initialValue?: string;
}

interface PlaceResult {
  description: string;
  place_id: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder = 'Konum ara...',
  onSelectLocation,
  onClose,
  initialValue = '',
}) => {
  const [searchText, setSearchText] = useState(initialValue);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [showMap, setShowMap] = useState(false);

  const searchPlaces = async (text: string) => {
    if (!text || text.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
          `input=${encodeURIComponent(text)}` +
          `&components=country:tr` +
          `&language=tr` +
          `&types=establishment|geocode` +
          `&key=${GOOGLE_PLACES_API_KEY}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log('Places API Response:', data);

      if (data.status === 'OK' && data.predictions) {
        setResults(data.predictions);
      } else if (data.status === 'ZERO_RESULTS') {
        setResults([]);
        setError('Sonuç bulunamadı');
      } else {
        console.error('Places API Error:', data.status, data.error_message);
        setError('Arama yapılırken bir hata oluştu');
        setResults([]);
      }
    } catch (error) {
      console.error('Yer arama hatası:', error);
      setError('Bağlantı hatası oluştu');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (result: PlaceResult) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
          `place_id=${result.place_id}` +
          `&fields=geometry,formatted_address,name` +
          `&language=tr` +
          `&key=${GOOGLE_PLACES_API_KEY}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log('Place Details API Response:', data);

      if (data.status === 'OK' && data.result) {
        const location: Location = {
          name: data.result.formatted_address || result.description,
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
        };
        console.log('Selected Location:', location);
        setSelectedLocation(location);
        setShowMap(true);
        setResults([]);
      } else {
        console.error(
          'Place Details API Error:',
          data.status,
          data.error_message,
        );
        setError('Konum detayları alınamadı');
      }
    } catch (error) {
      console.error('Konum detayları hatası:', error);
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setSearchText(selectedLocation.name);
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, {backgroundColor: COLORS.card}]}>
        <MaterialCommunityIcons
          name="map-marker-search"
          size={24}
          color={COLORS.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, {color: COLORS.text}]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text + '80'}
          value={searchText}
          onChangeText={text => {
            setSearchText(text);
            searchPlaces(text);
          }}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              setResults([]);
              setError(null);
            }}
            style={styles.clearButton}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, {color: COLORS.error}]}>{error}</Text>
      )}

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          color={COLORS.primary}
          size="small"
        />
      ) : (
        results.length > 0 && (
          <View style={[styles.resultsList, {backgroundColor: COLORS.card}]}>
            {results.map(result => (
              <TouchableOpacity
                key={result.place_id}
                style={styles.resultItem}
                onPress={() => handleSelectPlace(result)}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color={COLORS.text}
                  style={styles.resultIcon}
                />
                <Text style={[styles.resultText, {color: COLORS.text}]}>
                  {result.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      )}

      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: COLORS.text}]}>
              Konumu Onayla
            </Text>
            <TouchableOpacity
              onPress={() => setShowMap(false)}
              style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>

          {selectedLocation && (
            <>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                region={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                toolbarEnabled={true}
                mapType="standard"
                provider="google">
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title={selectedLocation.name}
                  description="Seçilen Konum"
                  pinColor="red"
                />
              </MapView>

              <View style={styles.locationInfo}>
                <View style={styles.locationDetails}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={24}
                    color={COLORS.primary}
                    style={styles.locationIcon}
                  />
                  <Text style={[styles.locationName, {color: COLORS.text}]}>
                    {selectedLocation.name}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    {backgroundColor: COLORS.primary},
                  ]}
                  onPress={handleConfirmLocation}>
                  <Text style={styles.confirmButtonText}>Konumu Onayla</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  loading: {
    marginTop: 12,
  },
  resultsList: {
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultIcon: {
    marginRight: 8,
  },
  resultText: {
    fontSize: 14,
    flex: 1,
  },
  errorText: {
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInfo: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationName: {
    fontSize: 16,
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: '70%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
