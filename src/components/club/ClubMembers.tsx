import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
};

type ClubMembersProps = {
  members: Member[];
  onMemberPress?: (memberId: string) => void;
  onViewAllPress?: () => void;
};

export const ClubMembers: React.FC<ClubMembersProps> = ({
  members,
  onMemberPress,
  onViewAllPress,
}) => {
  const { colors } = useTheme();

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => onMemberPress?.(item.id)}
    >
      <Image source={{ uri: item.profilePicture }} style={styles.memberPhoto} />
      <Text style={[styles.memberName, { color: colors.text }]}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={[styles.memberRole, { color: colors.text }]}>
        {item.role === 'ADMIN'
          ? 'Yönetici'
          : item.role === 'MODERATOR'
          ? 'Moderatör'
          : 'Üye'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Üyeler</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>
              Tümünü Gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={members.slice(0, 5)}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.membersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
  },
  membersList: {
    gap: 16,
  },
  memberItem: {
    alignItems: 'center',
    width: 80,
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
});
