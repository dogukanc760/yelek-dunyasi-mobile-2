import React, {useState, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, SIZES} from '../../constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {tr} from 'date-fns/locale';
import {
  TextInput as PaperTextInput,
  Button,
  Switch,
  IconButton,
} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import apiClient from '../../services/api';
import {RouteProp} from '@react-navigation/native';
import {LocationSearch} from '../../components/search/LocationSearch';
import ScreenWrapper from '../../components/common/ScreenWrapper';

// ... devamı CreateEventScreen ile aynı şekilde olacak ...
