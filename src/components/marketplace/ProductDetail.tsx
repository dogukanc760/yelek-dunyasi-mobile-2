import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ProductDetailProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  clubName: string;
  clubLogo: string;
  specifications?: Record<string, string>;
  onAddToCart: () => void;
  onContactSeller: () => void;
};

const { width } = Dimensions.get('window');

export const ProductDetail: React.FC<ProductDetailProps> = ({
  name,
  description,
  price,
  stock,
  images,
  clubName,
  specifications,
  onAddToCart,
  onContactSeller,
}) => {
  const { colors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <ScrollView style={styles.container}>
      {/* Görsel Galerisi */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[currentImageIndex] }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <View style={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentImageIndex(index)}
              style={[
                styles.thumbnail,
                currentImageIndex === index && styles.selectedThumbnail,
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ürün Bilgileri */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          {price.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
          })}
        </Text>

        {/* Kulüp Bilgisi */}
        <View style={styles.clubInfo}>
          <MaterialCommunityIcons name="store" size={24} color={colors.text} />
          <Text style={[styles.clubName, { color: colors.text }]}>
            {clubName}
          </Text>
        </View>

        {/* Stok Durumu */}
        <View style={styles.stockInfo}>
          <MaterialCommunityIcons
            name="package-variant"
            size={24}
            color={colors.text}
          />
          <Text style={[styles.stockText, { color: colors.text }]}>
            {stock > 0 ? 'Stokta var' : 'Stokta yok'}
          </Text>
        </View>

        {/* Açıklama */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ürün Açıklaması
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {description}
        </Text>

        {/* Özellikler */}
        {specifications && Object.keys(specifications).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Özellikler
            </Text>
            <View style={styles.specificationsContainer}>
              {Object.entries(specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationRow}>
                  <Text style={[styles.specKey, { color: colors.text }]}>
                    {key}
                  </Text>
                  <Text style={[styles.specValue, { color: colors.text }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Aksiyon Butonları */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onAddToCart}
            disabled={stock === 0}
          >
            <MaterialCommunityIcons name="cart-plus" size={24} color="white" />
            <Text style={styles.buttonText}>Sepete Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.contactButton]}
            onPress={onContactSeller}
          >
            <MaterialCommunityIcons name="message" size={24} color="white" />
            <Text style={styles.buttonText}>Satıcıyla İletişime Geç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: width,
    height: width,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clubName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  stockText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  specificationsContainer: {
    marginBottom: 16,
  },
  specificationRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specKey: {
    flex: 1,
    fontSize: 16,
  },
  specValue: {
    flex: 2,
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetail;
