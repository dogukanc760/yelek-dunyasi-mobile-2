import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../types/navigation';
import announcementService from '../../services/announcementService';
import {COLORS, FONTS} from '../../constants';

type CreateClubAnnouncementNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateClubAnnouncementScreen'
>;
type CreateClubAnnouncementRouteProp = RouteProp<
  RootStackParamList,
  'CreateClubAnnouncementScreen'
>;

const CreateClubAnnouncementScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<CreateClubAnnouncementNavProp>();
  const route = useRoute<CreateClubAnnouncementRouteProp>();
  const {clubId} = route.params;
  console.log(
    '[CreateClubAnnouncementScreen] Received clubId from route params:',
    clubId,
  );

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL'); // Default priority
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Yeni Duyuru Oluştur',
    });
  }, [navigation]);

  const handleCreateAnnouncement = async () => {
    console.log(
      '[CreateClubAnnouncementScreen] clubId before API call:',
      clubId,
    );
    if (!title.trim() || !content.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik alanları boş bırakılamaz.');
      return;
    }
    const validPriorities = ['NORMAL', 'YUKSEK', 'ACIL'];
    if (!validPriorities.includes(priority.trim().toUpperCase())) {
      Alert.alert(
        'Hata',
        `Geçersiz öncelik. Lütfen şunlardan birini girin: ${validPriorities.join(
          ', ',
        )}`,
      );
      return;
    }

    setIsLoading(true);
    try {
      await announcementService.createClubAnnouncement(clubId, {
        title: title.trim(),
        content: content.trim(),
        priority: priority.trim().toUpperCase(),
      });
      Alert.alert('Başarılı', 'Duyuru başarıyla oluşturuldu.', [
        {text: 'Tamam', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      console.error('Duyuru oluşturma hatası:', error);
      Alert.alert(
        'Hata',
        error.response?.data?.message ||
          'Duyuru oluşturulurken bir hata oluştu.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Basit bir Picker alternatifi için TouchableOpacity listesi
  const priorityOptions = ['NORMAL', 'YUKSEK', 'ACIL'];

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.label, {color: colors.text}]}>Başlık</Text>
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Duyuru başlığını girin..."
        placeholderTextColor={COLORS.textSecondary}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <Text style={[styles.label, {color: colors.text}]}>İçerik</Text>
      <TextInput
        style={[
          styles.input,
          styles.multilineInput,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        placeholder="Duyuru içeriğini yazın..."
        placeholderTextColor={COLORS.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline={true}
        numberOfLines={6}
        textAlignVertical="top"
      />

      <Text style={[styles.label, {color: colors.text}]}>Öncelik</Text>
      <View style={styles.priorityContainer}>
        {priorityOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  priority === option ? colors.primary : colors.card,
                borderColor:
                  priority === option ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setPriority(option)}>
            <Text
              style={[
                styles.priorityButtonText,
                {
                  color: priority === option ? COLORS.white : colors.text,
                },
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 
      Alternatif Öncelik TextInput'u:
      <TextInput
        style={[styles.input, {backgroundColor: colors.card, color: colors.text}]}
        placeholder="Örn: NORMAL, HIGH, URGENT"
        placeholderTextColor={colors.textSecondary}
        value={priority}
        onChangeText={setPriority}
        autoCapitalize="characters"
      />
      <Text style={[styles.hint, {color: colors.textSecondary}]}>
        Geçerli değerler: NORMAL, HIGH, URGENT
      </Text> 
      */}

      <TouchableOpacity
        style={[
          styles.submitButton,
          {backgroundColor: isLoading ? COLORS.lightGray : colors.primary},
        ]}
        onPress={handleCreateAnnouncement}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>Duyuru Oluştur</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 8,
    opacity: 0.9,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multilineInput: {
    height: 120,
    paddingTop: 15,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  priorityButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.medium,
  },
  hint: {
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
    opacity: 0.7,
    marginBottom: 20,
    marginTop: -15,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
});

export default CreateClubAnnouncementScreen;
