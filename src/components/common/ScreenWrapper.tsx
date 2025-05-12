import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import {useTheme} from '@react-navigation/native';

interface ScreenWrapperProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string; // Arka plan rengini dışarıdan alabilmek için
  withScrollView?: boolean; // İsteğe bağlı olarak ScrollView eklemek için (henüz eklemedim)
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  backgroundColor,
}) => {
  const {colors} = useTheme(); // Tema renklerini alıyoruz

  // Eğer dışarıdan bir backgroundColor gelmezse, tema arka plan rengini kullan
  const finalBackgroundColor = backgroundColor || colors.background;

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: finalBackgroundColor}, style]}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} // Veya temanıza göre ayarlayın
        backgroundColor={finalBackgroundColor}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Gerekirse header yüksekliği kadar offset eklenebilir
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ScreenWrapper;
