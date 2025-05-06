import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

type Photo = {
  id: string;
  url: string;
};

type ClubGalleryProps = {
  photos: Photo[];
  onPhotoPress?: (photoId: string) => void;
};

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

export const ClubGallery: React.FC<ClubGalleryProps> = ({
  photos,
  onPhotoPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.grid}>
        {photos.slice(0, 6).map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoContainer}
            onPress={() => onPhotoPress?.(photo.id)}
          >
            <Image source={{ uri: photo.url }} style={styles.photo} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
