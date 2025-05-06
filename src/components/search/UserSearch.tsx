import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  profilePicture: string;
  city: string;
  district: string;
  motorcycleBrand: string;
  motorcycleModel: string;
};

type UserSearchProps = {
  onUserPress: (userId: string) => void;
  onSearch: (query: string) => Promise<User[]>;
};

export const UserSearch: React.FC<UserSearchProps> = ({
  onUserPress,
  onSearch,
}) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (text: string) => {
    setQuery(text);
    setError(null);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await onSearch(text);
      setResults(searchResults);
    } catch (err) {
      setError('Arama sırasında bir hata oluştu');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.card }]}
      onPress={() => onUserPress(item.id)}
    >
      <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colors.text }]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.nickname, { color: colors.text }]}>
            @{item.nickname}
          </Text>
        </View>
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={colors.text}
          />
          <Text style={[styles.location, { color: colors.text }]}>
            {item.city}, {item.district}
          </Text>
        </View>
        <View style={styles.motorcycleContainer}>
          <MaterialCommunityIcons
            name="motorcycle"
            size={16}
            color={colors.text}
          />
          <Text style={[styles.motorcycle, { color: colors.text }]}>
            {item.motorcycleBrand} {item.motorcycleModel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <MaterialCommunityIcons
          name="magnify"
          size={24}
          color={colors.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="İsim, kullanıcı adı veya şehir ara..."
          placeholderTextColor={colors.text + '80'}
          value={query}
          onChangeText={handleSearch}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loader}
          />
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
      )}

      {query.length > 0 && results.length === 0 && !loading && !error && (
        <Text style={[styles.noResults, { color: colors.text }]}>
          Sonuç bulunamadı
        </Text>
      )}

      <FlatList
        data={results}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loader: {
    marginLeft: 8,
  },
  error: {
    margin: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  noResults: {
    margin: 16,
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.6,
  },
  list: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nameContainer: {
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  nickname: {
    fontSize: 14,
    opacity: 0.8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.8,
  },
  motorcycleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  motorcycle: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.8,
  },
});
