import React from 'react';
import { Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ProductDetail } from '../../components/marketplace/ProductDetail';
import { RootStackParamList } from '../../types/navigation';

type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProductDetail'
>;

export const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product } = route.params;

  const handleAddToCart = () => {
    Alert.alert('Başarılı', 'Ürün sepete eklendi!');
  };

  const handleContactSeller = () => {
    Alert.alert('Bilgi', 'Satıcıyla iletişim kurulacak...');
  };

  return (
    <ProductDetail
      {...product}
      onAddToCart={handleAddToCart}
      onContactSeller={handleContactSeller}
    />
  );
};
