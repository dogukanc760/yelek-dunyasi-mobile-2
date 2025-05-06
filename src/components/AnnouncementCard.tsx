import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTheme } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AnnouncementCardProps = {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  id,
  clubId,
  clubName,
  clubLogo,
  title,
  content,
  image,
  createdAt,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() =>
        navigation.navigate('AnnouncementDetail', { announcementId: id })
      }
    >
      <TouchableOpacity
        style={styles.clubContainer}
        onPress={() => navigation.navigate('ClubDetail', { clubId })}
      >
        <Image source={{ uri: clubLogo }} style={styles.clubLogo} />
        <View style={styles.clubInfo}>
          <Text style={[styles.clubName, { color: colors.text }]}>
            {clubName}
          </Text>
          <Text style={[styles.date, { color: colors.text }]}>
            {format(new Date(createdAt), 'dd MMMM yyyy', { locale: tr })}
          </Text>
        </View>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.announcementImage} />
      )}

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text
          style={[styles.content, { color: colors.text }]}
          numberOfLines={3}
        >
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clubInfo: {
    marginLeft: 12,
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  announcementImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});
