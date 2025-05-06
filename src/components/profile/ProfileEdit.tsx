import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type ProfileEditProps = {
  initialValues: {
    name: string;
    username: string;
    bio?: string;
    avatarUrl: string;
  };
  onSave: (values: {
    name: string;
    username: string;
    bio?: string;
    avatarUrl: string;
  }) => void;
  onCancel: () => void;
  onAvatarPress: () => void;
};

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  initialValues,
  onSave,
  onCancel,
  onAvatarPress,
}) => {
  const { colors } = useTheme();
  const [values, setValues] = useState(initialValues);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress}>
        <Image source={{ uri: values.avatarUrl }} style={styles.avatar} />
        <View
          style={[
            styles.editIconContainer,
            { backgroundColor: colors.primary },
          ]}
        >
          <MaterialCommunityIcons name="camera" size={16} color="white" />
        </View>
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Ad Soyad</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={values.name}
            onChangeText={(text) => setValues({ ...values, name: text })}
            placeholder="Ad Soyad"
            placeholderTextColor={colors.text + '80'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Kullanıcı Adı
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={values.username}
            onChangeText={(text) => setValues({ ...values, username: text })}
            placeholder="Kullanıcı Adı"
            placeholderTextColor={colors.text + '80'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Biyografi</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={values.bio}
            onChangeText={(text) => setValues({ ...values, bio: text })}
            placeholder="Biyografi"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => onSave(values)}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
