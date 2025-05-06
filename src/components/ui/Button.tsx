import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  // Düğme stilini belirleme
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};

    // Varyant Stilleri
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.primary,
          borderWidth: 0,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.secondary,
          borderWidth: 0,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
        break;
      case 'text':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
        break;
    }

    // Boyut Stilleri
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SIZES.spacing.xs,
          paddingHorizontal: SIZES.spacing.md,
          borderRadius: SIZES.radius.sm,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SIZES.spacing.sm,
          paddingHorizontal: SIZES.spacing.lg,
          borderRadius: SIZES.radius.md,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SIZES.spacing.md,
          paddingHorizontal: SIZES.spacing.xl,
          borderRadius: SIZES.radius.md,
        };
        break;
    }

    // Tam genişlik
    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    // Devre dışı bırakma
    if (disabled) {
      buttonStyle.opacity = 0.6;
    }

    return buttonStyle;
  };

  // Metin stilini belirleme
  const getTextStyle = () => {
    let style: TextStyle = {};

    switch (variant) {
      case 'primary':
      case 'secondary':
        style = {
          color: COLORS.white,
        };
        break;
      case 'outline':
        style = {
          color: COLORS.primary,
        };
        break;
      case 'text':
        style = {
          color: COLORS.primary,
        };
        break;
    }

    switch (size) {
      case 'small':
        style = {
          ...style,
          ...FONTS.caption,
        };
        break;
      case 'medium':
        style = {
          ...style,
          ...FONTS.body2,
        };
        break;
      case 'large':
        style = {
          ...style,
          ...FONTS.body1,
        };
        break;
    }

    return style;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'secondary'
              ? COLORS.white
              : COLORS.primary
          }
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Button;
