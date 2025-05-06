import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useTheme,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';

type ClubAnnouncementsScreenRouteProp = RouteProp<
  RootStackParamList,
  'ClubAnnouncements'
>;
type ClubAnnouncementsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const ClubAnnouncementsScreen = () => {
  const {colors} = useTheme();
  const route = useRoute<ClubAnnouncementsScreenRouteProp>();
  const navigation = useNavigation<ClubAnnouncementsScreenNavigationProp>();
  const {club} = route.params;

  const [loading] = useState(false);
  const announcements = club.announcements || [];

  const renderAnnouncementItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[styles.announcementItem, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('AnnouncementDetail', {
          id: item.id,
        })
      }>
      <View style={styles.announcementHeader}>
        <Text style={[styles.announcementTitle, {color: colors.text}]}>
          {item.title}
        </Text>
        <Text style={[styles.announcementDate, {color: COLORS.textSecondary}]}>
          {format(new Date(item.createdAt), 'd MMM yyyy', {locale: tr})}
        </Text>
      </View>
      <Text
        style={[styles.announcementContent, {color: COLORS.textSecondary}]}
        numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={announcements}
        renderItem={renderAnnouncementItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
            Henüz duyuru bulunmuyor...
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  announcementItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
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
  emptyText: {
    fontFamily: FONTS.FONT_FAMILY.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
