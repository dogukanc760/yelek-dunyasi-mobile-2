import {createNavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  } else {
    // Development ortamında hata mesajını göster
    console.error('Navigation is not ready');
    console.error('Attempted to navigate to:', name, 'with params:', params);
  }
}
