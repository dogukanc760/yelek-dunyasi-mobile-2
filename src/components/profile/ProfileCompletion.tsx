import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type MissingField =
  | 'nickname'
  | 'phoneNumber'
  | 'city'
  | 'district'
  | 'motorcycleBrand'
  | 'motorcycleModel'
  | 'motorcycleCc'
  | 'bloodType'
  | 'clothingSize'
  | 'driverLicenseType'
  | 'emergencyContactName'
  | 'emergencyContactRelation'
  | 'emergencyContactPhone';

type ProfileCompletionProps = {
  progress: number;
  missingFields: MissingField[];
  onComplete: () => void;
};

const fieldLabels: Record<MissingField, string> = {
  nickname: 'Kullanıcı Adı',
  phoneNumber: 'Telefon Numarası',
  city: 'Şehir',
  district: 'İlçe',
  motorcycleBrand: 'Motosiklet Markası',
  motorcycleModel: 'Motosiklet Modeli',
  motorcycleCc: 'Motor Hacmi',
  bloodType: 'Kan Grubu',
  clothingSize: 'Kıyafet Bedeni',
  driverLicenseType: 'Ehliyet Tipi',
  emergencyContactName: 'Acil Durum Kişisi',
  emergencyContactRelation: 'Acil Durum Kişisi İlişkisi',
  emergencyContactPhone: 'Acil Durum Telefonu',
};

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  progress,
  missingFields,
  onComplete,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Profil Tamamlama
        </Text>
        <Text style={[styles.progress, { color: colors.text }]}>
          %{progress}
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Eksik Bilgiler
        </Text>
        {missingFields.map((field) => (
          <View key={field} style={styles.missingField}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.fieldText, { color: colors.text }]}>
              {fieldLabels[field]}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onComplete}
      >
        <Text style={styles.buttonText}>Profili Tamamla</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  progress: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  missingField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldText: {
    fontSize: 16,
    marginLeft: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
