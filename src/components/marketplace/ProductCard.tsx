import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  clubName?: string;
  clubLogo?: string;
  onPress: (id: string) => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  stock,
  images,
  clubName,
  clubLogo,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress(id)}
    >
      <Image
        source={{ uri: images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.description, { color: colors.text }]}
          numberOfLines={2}
        >
          {description}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {price.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          })}
        </Text>
        {stock < 5 && (
          <Text style={[styles.stockWarning, { color: colors.notification }]}>
            Son {stock} ürün!
          </Text>
        )}
        {clubName && clubLogo && (
          <View style={styles.clubInfo}>
            <Image source={{ uri: clubLogo }} style={styles.clubLogo} />
            <Text style={[styles.clubName, { color: colors.text }]}>
              {clubName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  stockWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  clubLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  clubName: {
    fontSize: 12,
    fontWeight: '500',
  },
});
