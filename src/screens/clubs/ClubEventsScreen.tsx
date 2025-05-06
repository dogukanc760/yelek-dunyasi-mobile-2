import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {
  RouteProp,
  useRoute,
  useTheme,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';

type ClubEventsScreenRouteProp = RouteProp<RootStackParamList, 'ClubEvents'>;
type ClubEventsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const ClubEventsScreen = () => {
  const {colors} = useTheme();
  const route = useRoute<ClubEventsScreenRouteProp>();
  const navigation = useNavigation<ClubEventsScreenNavigationProp>();
  const {events} = route.params;

  const renderEventItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[styles.eventItem, {backgroundColor: colors.card}]}
      onPress={() =>
        navigation.navigate('EventDetail', {
          id: item.id,
        })
      }>
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, {color: colors.text}]}>
          {item.title}
        </Text>
        <View style={styles.eventType}>
          <MaterialCommunityIcons
            name={item.type === 'ride' ? 'motorbike' : 'calendar'}
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.eventTypeText, {color: colors.primary}]}>
            {item.type === 'ride' ? 'Sürüş' : 'Toplantı'}
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
          <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
            {format(new Date(item.startDate), 'd MMM yyyy', {locale: tr})}
          </Text>
        </View>
        <View style={styles.eventInfoItem}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
            {item.startLocation}
          </Text>
        </View>
        <View style={styles.eventInfoItem}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={[styles.eventInfoText, {color: COLORS.textSecondary}]}>
            {item.participantCount}/{item.capacity} katılımcı
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, {color: COLORS.textSecondary}]}>
            Henüz etkinlik bulunmuyor...
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
  eventItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontFamily: FONTS.FONT_FAMILY.medium,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
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
    marginTop: 24,
    fontStyle: 'italic',
  },
});
