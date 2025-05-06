import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProductCard } from '../../components/marketplace/ProductCard';

// Örnek veri - Gerçek uygulamada API'den gelecek
const sampleProducts = [
  {
    id: '1',
    name: 'Yelekli Dünyası T-Shirt',
    description: 'Özel tasarım, %100 pamuk t-shirt',
    price: 149.99,
    stock: 10,
    images: ['https://example.com/tshirt.jpg'],
    clubName: 'Yazılım Kulübü',
    clubLogo: 'https://example.com/club-logo.jpg',
  },
  // Diğer ürünler buraya eklenebilir
];

export const MarketplaceScreen = () => {
  const navigation = useNavigation();

  const handleProductPress = (productId: string) => {
    const product = sampleProducts.find((p) => p.id === productId);
    if (product) {
      navigation.navigate('ProductDetail', { product });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sampleProducts}
        renderItem={({ item }) => (
          <ProductCard {...item} onPress={() => handleProductPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productList: {
    padding: 8,
  },
});
