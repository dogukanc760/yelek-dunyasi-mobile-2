import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, styles} from '../../styles/styles';

const ManageClubScreen = () => {
  const navigation = useNavigation();
  const [clubId, setClubId] = useState('');

  const handleEventManagement = () => {
    navigation.navigate('ClubEvents', {clubId: clubId});
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.menuItem, {backgroundColor: colors.card}]}
        onPress={handleEventManagement}>
        <MaterialCommunityIcons
          name="calendar-multiple"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.menuItemText, {color: colors.text}]}>
          Etkinlik Yönetimi
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ManageClubScreen;
