import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PrivacyScreen = () => {
  const {colors} = useTheme();
  const [profileVisibility, setProfileVisibility] = useState('public'); // 'public', 'friends', 'private'
  const [locationSharing, setLocationSharing] = useState(false);
  const [activitySharing, setActivitySharing] = useState(true);
  const [photoTagging, setPhotoTagging] = useState(true);
  const [accountFinding, setAccountFinding] = useState(true);

  const renderVisibilityOption = (
    option: string,
    title: string,
    description: string,
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.visibilityOption,
          profileVisibility === option && styles.activeOption,
        ]}
        onPress={() => setProfileVisibility(option)}>
        <View style={styles.optionHeader}>
          <MaterialCommunityIcons
            name={
              option === 'public'
                ? 'earth'
                : option === 'friends'
                ? 'account-group'
                : 'lock'
            }
            size={24}
            color={profileVisibility === option ? colors.primary : colors.text}
          />
          <Text
            style={[
              styles.optionTitle,
              {
                color:
                  profileVisibility === option ? colors.primary : colors.text,
              },
            ]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.optionDescription, {color: colors.text}]}>
          {description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Profil Görünürlüğü
        </Text>
        <Text style={[styles.sectionDescription, {color: colors.text}]}>
          Profilinizin kimler tarafından görüntülenebileceğini seçin:
        </Text>

        {renderVisibilityOption(
          'public',
          'Herkese Açık',
          'Profiliniz herkes tarafından görüntülenebilir.',
        )}

        {renderVisibilityOption(
          'friends',
          'Sadece Arkadaşlar',
          'Profiliniz sadece arkadaşlarınız tarafından görüntülenebilir.',
        )}

        {renderVisibilityOption(
          'private',
          'Gizli',
          'Profiliniz sadece sizin tarafınızdan görüntülenebilir.',
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Gizlilik Seçenekleri
        </Text>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <View>
            <Text style={[styles.settingText, {color: colors.text}]}>
              Konum Paylaşımı
            </Text>
            <Text style={[styles.settingDescription, {color: colors.text}]}>
              Etkinlikler sırasında konumunuzu paylaşın
            </Text>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={locationSharing ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <View>
            <Text style={[styles.settingText, {color: colors.text}]}>
              Aktivite Paylaşımı
            </Text>
            <Text style={[styles.settingDescription, {color: colors.text}]}>
              Bisiklet sürüşlerinizi ve etkinliklerinizi paylaşın
            </Text>
          </View>
          <Switch
            value={activitySharing}
            onValueChange={setActivitySharing}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={activitySharing ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <View>
            <Text style={[styles.settingText, {color: colors.text}]}>
              Fotoğraf Etiketleme
            </Text>
            <Text style={[styles.settingDescription, {color: colors.text}]}>
              Başkalarının sizi fotoğraflarda etiketlemesine izin verin
            </Text>
          </View>
          <Switch
            value={photoTagging}
            onValueChange={setPhotoTagging}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={photoTagging ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={[styles.settingItem, {borderBottomColor: colors.border}]}>
          <View>
            <Text style={[styles.settingText, {color: colors.text}]}>
              Hesap Bulunabilirliği
            </Text>
            <Text style={[styles.settingDescription, {color: colors.text}]}>
              Diğer kullanıcıların sizi aramalarda bulabilmesine izin verin
            </Text>
          </View>
          <Switch
            value={accountFinding}
            onValueChange={setAccountFinding}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={accountFinding ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.dataRequestButton}>
          <Text style={[styles.dataRequestText, {color: colors.primary}]}>
            Verilerimi İndir
          </Text>
        </TouchableOpacity>
        <Text style={[styles.infoText, {color: colors.text}]}>
          Not: Gizlilik ayarlarını değiştirdiğinizde, değişiklikler otomatik
          olarak kaydedilir.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  visibilityOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  activeOption: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  optionDescription: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  dataRequestButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataRequestText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default PrivacyScreen;
