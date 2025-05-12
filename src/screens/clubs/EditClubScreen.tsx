import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useTheme,
  RouteProp,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types/navigation';
import {COLORS, FONTS} from '../../constants';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker'; // Asset kaldırıldı, kullanılmıyor gibi
import {
  pick,
  types as DocumentPickerTypes,
} from '@react-native-documents/picker';
import {Picker} from '@react-native-picker/picker'; // Picker import edildi
import ClubService, {
  Club,
  ClubFile as ServiceClubFile,
} from '../../services/clubService'; // ClubFile -> ServiceClubFile olarak yeniden adlandırıldı

interface User {
  // Bu User arayüzü ClubService.Club.founder ile eşleşmeli veya oradan alınmalı
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  profilePicture?: string;
}

// EditClubScreen içindeki ClubFile arayüzü, uploadedBy alanını içermeli
interface ClubFile extends ServiceClubFile {
  // ServiceClubFile'dan extend edip uploadedBy ekleyebiliriz
  // ServiceClubFile zaten id, fileUrl, fileName, fileType gibi alanları içerecektir.
  uploadedBy?: User; // Yükleyen kullanıcı bilgisi (opsiyonel)
}

// Dosya seçildiğinde saklanacak obje tipi
interface UploadedDocumentInfo {
  uri: string;
  name: string;
  type: string; // MIME type
  selectedClubFileType: string; // Kullanıcının seçtiği kulüp dosya türü
}

// ClubData arayüzü ClubService.Club tipini kullanıyor.
// EditClubScreen'e özel alanlar (örn: uploadedDocuments) burada tanımlanabilir.
interface ClubData extends Club {
  uploadedDocuments?: UploadedDocumentInfo[]; // Yeni seçilen, henüz yüklenmemiş belgeler için
  // clubFiles alanı zaten Club arayüzünden (opsiyonel olarak) geliyor.
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditClubScreenRouteProp = RouteProp<RootStackParamList, 'ManageClub'>;

const CLUB_FILE_TYPES = [
  {label: 'Kulüp Tüzüğü', value: 'club_regulations'},
  {label: 'Yol Kılavuzu', value: 'club_road_guideline'},
  {label: 'Standart Dosya', value: 'club_standart_file'},
  {label: 'Etkinlik Dosyası', value: 'club_event_file'},
  // TODO: Ekran görüntüsünde daha fazla seçenek varsa buraya ekleyin
];

const EditClubScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditClubScreenRouteProp>();
  const {clubId: routeClubId} = route.params;
  const clubId = routeClubId;

  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [logo, setLogo] = useState(''); // Seçilen yeni logo URI'si
  const [cover, setCover] = useState(''); // Seçilen yeni kapak URI'si
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocumentInfo[]
  >([]);
  const [existingClubFiles, setExistingClubFiles] = useState<ClubFile[]>([]); // API'den gelen mevcut dosyalar

  // API_BASE_URL ve JWT_TOKEN sabitleri kaldırıldı, ClubService içinde yönetiliyor.
  // const clubService = new ClubService(); // Kaldırıldı, static metodlar kullanılacak

  const getFileInfoFromUri = (uri: string) => {
    let localName = 'file';
    try {
      const decodedUri = decodeURIComponent(uri);
      const uriParts = decodedUri.split('/');
      if (uriParts.length > 0) {
        localName = uriParts[uriParts.length - 1];
        const queryParamIndex = localName.indexOf('?');
        if (queryParamIndex !== -1) {
          localName = localName.substring(0, queryParamIndex);
        }
      }
    } catch (e) {
      console.warn('Could not decode or parse URI for filename:', uri, e);
      const timestamp = new Date().getTime();
      const randomSuffix = Math.floor(Math.random() * 1000);
      localName = `file_${timestamp}_${randomSuffix}`;
    }

    let type = 'application/octet-stream';
    const nameParts = localName.split('.');
    if (nameParts.length > 1) {
      const ext = nameParts[nameParts.length - 1].toLowerCase();
      switch (ext) {
        case 'jpeg':
        case 'jpg':
          type = 'image/jpeg';
          break;
        case 'png':
          type = 'image/png';
          break;
        case 'gif':
          type = 'image/gif';
          break;
        case 'webp':
          type = 'image/webp';
          break;
        case 'bmp':
          type = 'image/bmp';
          break;
        case 'tiff':
        case 'tif':
          type = 'image/tiff';
          break;
        case 'svg':
          type = 'image/svg+xml';
          break;
        case 'ico':
          type = 'image/vnd.microsoft.icon';
          break;
        case 'pdf':
          type = 'application/pdf';
          break;
        case 'doc':
          type = 'application/msword';
          break;
        case 'docx':
          type =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          type = 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          type =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'ppt':
          type = 'application/vnd.ms-powerpoint';
          break;
        case 'pptx':
          type =
            'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'txt':
          type = 'text/plain';
          break;
        case 'rtf':
          type = 'application/rtf';
          break;
        case 'odt':
          type = 'application/vnd.oasis.opendocument.text';
          break;
        case 'ods':
          type = 'application/vnd.oasis.opendocument.spreadsheet';
          break;
        case 'odp':
          type = 'application/vnd.oasis.opendocument.presentation';
          break;
        case 'csv':
          type = 'text/csv';
          break;
        case 'zip':
          type = 'application/zip';
          break;
        case 'rar':
          type = 'application/vnd.rar';
          break;
        case '7z':
          type = 'application/x-7z-compressed';
          break;
        case 'mp3':
          type = 'audio/mpeg';
          break;
        case 'wav':
          type = 'audio/wav';
          break;
        case 'mp4':
          type = 'video/mp4';
          break;
        case 'mov':
          type = 'video/quicktime';
          break;
        case 'avi':
          type = 'video/x-msvideo';
          break;
      }
    }
    return {name: localName, type};
  };

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) {
        Alert.alert('Hata', 'Kulüp ID bulunamadı.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Servisten doğrudan kulüp nesnesi geliyor (loglara göre içinde club_files var).
        const clubInfoFromService = (await ClubService.getClubById(
          clubId,
        )) as any;
        console.log(
          'Raw club info from ClubService.getClubById:',
          clubInfoFromService,
        );

        // Dönen objenin temel bir kulüp objesi olup olmadığını kontrol et (örn: id alanı var mı?)
        if (clubInfoFromService && typeof clubInfoFromService.id === 'string') {
          // API'den gelen club_files'ı alalım (yoksa boş dizi)
          const filesFromApi =
            clubInfoFromService.clubFiles ||
            clubInfoFromService.club_files ||
            [];

          // screenSpecificData (ClubData tipinde) oluşturulurken,
          // API'deki club_files -> ClubData/Club tipindeki clubFiles'a maplenir.
          const tempClubObjectForState = {
            ...clubInfoFromService,
            clubFiles: filesFromApi, // club_files'ı clubFiles olarak ata
          };
          // club_files geçici olarak eklendiği için tempClubObjectForState'den kaldırılırsa daha temiz olur,
          // ama Club tipine cast ederken sorun yaratmaması için bırakılabilir veya type assertion ile yönetilebilir.
          delete tempClubObjectForState.club_files; // Orijinal club_files'ı sil (artık clubFiles var)

          const screenSpecificData: ClubData = {
            ...(tempClubObjectForState as Club), // Club tipine cast et (clubFiles içeriyor)
            uploadedDocuments: [],
          };

          console.log('Processed clubData for state:', screenSpecificData);
          console.log(
            'Fetched isOfficial (from clubInfoFromService):',
            clubInfoFromService.isOfficial,
          );
          console.log(
            'Files from API (club_files raw):',
            clubInfoFromService.club_files,
          );

          setClubData(screenSpecificData);
          setName(clubInfoFromService.name || '');
          setDescription(clubInfoFromService.description || '');
          setIsOfficial(clubInfoFromService.isOfficial || false);
          setLogo(
            'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
              clubInfoFromService.logoUrl.replace('/public', '') || // logoUrl öncelikli
              'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                clubInfoFromService.logo.replace('/public', '') ||
              'https://via.placeholder.com/150',
          );
          setCover(
            'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
              clubInfoFromService.cover.replace('/public', '') ||
              'https://via.placeholder.com/600x200',
          );
          setUploadedDocuments([]);

          console.log(
            'Files to set to existingClubFiles state (from club_files):',
            filesFromApi,
          );
          // existingClubFiles state'i ClubFile[] bekliyor. filesFromApi (ServiceClubFile[]) ile uyumlu olmalı.
          setExistingClubFiles(filesFromApi as ClubFile[]);
          console.log('setExistingClubFiles CALLED with derived files');
        } else {
          console.error(
            'Invalid API response: clubInfoFromService is null, undefined, or missing an ID:',
            clubInfoFromService,
          );
          Alert.alert(
            'Hata',
            'Kulüp bilgileri alınırken bir sorun oluştu veya veri formatı hatalı.',
          );
        }
      } catch (error) {
        console.error(
          'ClubService.getClubById Hatası (fetchClubDetails içinde):',
          error,
        );
        let errorMessage = 'Kulüp bilgileri çekilemedi.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        Alert.alert('Hata', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  const handleImagePick = useCallback(
    async (setImageUri: (uri: string) => void) => {
      const options: ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      };

      await launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Hata', 'Görsel seçilirken bir sorun oluştu.');
        } else if (response.assets && response.assets.length > 0) {
          const selectedImageUri = response.assets[0].uri;
          if (selectedImageUri) {
            setImageUri(selectedImageUri);
          }
        }
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!clubData || !clubId) {
      Alert.alert('Hata', 'Kaydedilecek kulüp bilgisi veya ID bulunamadı.');
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('type', clubData.type); // clubData.type zaten 'private' | 'public' tipinde olmalı
    formData.append('isOfficial', isOfficial.toString());

    // Logo dosyasını ekle (eğer URI değişmişse ve placeholder değilse)
    if (
      logo &&
      logo !== clubData.logo &&
      !logo.startsWith('https://via.placeholder.com') &&
      !logo.startsWith('http')
    ) {
      const fileInfo = getFileInfoFromUri(logo);
      formData.append('logoFile', {
        uri: logo,
        name: fileInfo.name,
        type: fileInfo.type,
      } as any);
    }

    // Kapak fotoğrafını ekle (eğer URI değişmişse ve placeholder değilse)
    if (
      cover &&
      cover !== clubData.cover &&
      !cover.startsWith('https://via.placeholder.com') &&
      !cover.startsWith('http')
    ) {
      const fileInfo = getFileInfoFromUri(cover);
      formData.append('coverFile', {
        uri: cover,
        name: fileInfo.name,
        type: fileInfo.type,
      } as any);
    }

    if (uploadedDocuments && uploadedDocuments.length > 0) {
      uploadedDocuments.forEach((doc, index) => {
        if (!doc.uri) return;
        const clubFile = {
          uri: doc.uri,
          name: doc.name,
          type: doc.type, // Bu dosyanın MIME türü
        };
        formData.append('clubFileBlobs', clubFile as any);
        formData.append(
          `newClubFiles[${index}][type]`,
          doc.selectedClubFileType,
        ); // SEÇİLEN TÜR KULLANILDI
        formData.append(`newClubFiles[${index}][fileName]`, clubFile.name);
      });
    }

    // Silinmesi istenen mevcut dosyaların ID'lerini ekle (Opsiyonel)
    // Bu kısım için UI'da silinen dosyaları takip eden bir state (örn: deletedFileIds) ve
    // removeExistingFile fonksiyonunda bu state'i güncelleyen bir mantık olmalı.
    // formData.append('deletedFileIds[]', someDeletedFileId);

    setLoading(true);
    try {
      // ClubService üzerinden güncelleme isteği
      const responseData = await ClubService.updateClubDetailsAndFiles(
        clubId,
        formData,
      );

      // Yanıtı işle (ClubService.updateClubDetailsAndFiles içindeki token ve error handling'e güveniyoruz)
      if (responseData) {
        // Başarı durumu API yanıtına göre daha spesifik kontrol edilebilir
        Alert.alert('Başarılı', 'Kulüp bilgileri güncellendi.');
        console.log(
          'Sunucudan Gelen Yanıt (updateClubDetailsAndFiles):',
          responseData,
        );
        // İsteğe bağlı: Verileri yeniden çek veya state'i güncelle
        // fetchClubDetails(); // Ya da sadece navigation.goBack();
      } else {
        // Bu else bloğuna normalde ClubService hata fırlatacağı için girilmemeli
        Alert.alert(
          'Hata',
          'Kulüp güncellenirken bilinmeyen bir sorun oluştu.',
        );
      }
    } catch (error) {
      console.error('ClubService.updateClubDetailsAndFiles Hatası:', error);
      let errorMessage = 'Kulüp güncellenirken bir sorun oluştu.';
      if (error instanceof Error) {
        errorMessage = error.message; // Servisten gelen hata mesajını kullan
      }
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    clubData,
    clubId,
    name,
    description,
    logo,
    cover,
    isOfficial,
    uploadedDocuments,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: clubData ? `${clubData.name} Düzenle` : 'Kulüp Ayarları',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{marginRight: 10}}>
          <Text
            style={{color: colors.primary, fontFamily: FONTS.FONT_FAMILY.bold}}>
            Kaydet
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, clubData, colors.primary, handleSave]);

  const handleDocumentPick = async () => {
    try {
      const results = await pick({
        allowMultiSelection: true,
        type: [DocumentPickerTypes.allFiles],
      });

      if (results) {
        const validResults = Array.isArray(results) ? results : [results];
        const newDocuments: UploadedDocumentInfo[] = validResults
          .filter(r => r.uri)
          .map(r => ({
            uri: r.uri,
            name: r.name || `file_${Date.now()}`,
            type: r.type || DocumentPickerTypes.allFiles,
            selectedClubFileType: CLUB_FILE_TYPES[2].value, // Varsayılan olarak 'Standart Dosya' seçili olsun
          }));
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled the document picker');
      } else {
        Alert.alert('Hata', 'Dosya seçilirken bir sorun oluştu.');
        console.error('Error picking documents:', err);
      }
    }
  };

  const updateSelectedClubFileType = (docUri: string, typeValue: string) => {
    setUploadedDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.uri === docUri ? {...doc, selectedClubFileType: typeValue} : doc,
      ),
    );
  };

  const removeDocument = (uriToRemove: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.uri !== uriToRemove));
  };

  const removeExistingFile = (fileIdToRemove: string) => {
    setExistingClubFiles(prev =>
      prev.filter(file => file.id !== fileIdToRemove),
    );
    // TODO: API'ye bu dosyanın silinmesi için bir istek göndermeniz gerekebilir.
    // Örneğin, formData'ya silinecek dosyaların ID'lerini ekleyebilirsiniz:
    // formData.append('deletedFileIds[]', fileIdToRemove);
    Alert.alert(
      'Bilgi',
      `${fileIdToRemove} ID'li dosya kaldırıldı. Değişiklikleri kaydetmeyi unutmayın.`,
    );
  };

  // Yeni eklenecek fonksiyon (veya var olanın doğrulanması)
  const updateExistingClubFileType = (fileId: string, typeValue: string) => {
    setExistingClubFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? {...file, fileType: typeValue} : file,
      ),
    );
    // Not: Bu değişiklik handleSave içinde sunucuya gönderilmeli.
  };

  // Conditional logs before returning JSX
  if (Platform.OS === 'android') {
    // Or some other debug flag
    console.log(
      'Rendering document section. isOfficial:',
      isOfficial,
      'existingClubFiles.length:',
      existingClubFiles.length,
    );
    if (existingClubFiles.length > 0) {
      console.log(
        'Mapping existingClubFiles. Count:',
        existingClubFiles.length,
      );
      existingClubFiles.forEach((file, _index) => {
        console.log(`Rendering existing file index ${_index}:`, file);
        if (!file || !file.id) {
          console.error(
            `Existing file at index ${_index} is invalid or missing id:`,
            file,
          );
        }
      });
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text style={{color: colors.text}}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!clubData) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text style={{color: colors.text}}>Kulüp bilgileri yüklenemedi.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.label, {color: colors.text}]}>Kulüp Adı</Text>
      <TextInput
        style={[
          styles.input,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Kulüp Adı"
        placeholderTextColor={COLORS.textSecondary}
      />

      <Text style={[styles.label, {color: colors.text}]}>Açıklama</Text>
      <TextInput
        style={[
          styles.input,
          styles.multilineInput,
          {backgroundColor: colors.card, color: colors.text},
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Kulüp Açıklaması"
        placeholderTextColor={COLORS.textSecondary}
        multiline
      />

      {/* Logo Seçimi */}
      <Text style={[styles.label, {color: colors.text}]}>Logo</Text>
      <TouchableOpacity
        style={[
          styles.button,
          {backgroundColor: colors.primary, marginBottom: 10},
        ]}
        onPress={() => handleImagePick(setLogo)}>
        <Text style={[styles.buttonText, {color: COLORS.white}]}>Logo Seç</Text>
      </TouchableOpacity>
      {logo ? (
        <Image source={{uri: logo}} style={styles.imagePreview} />
      ) : clubData &&
        clubData.logo &&
        !clubData.logo.startsWith('https://via.placeholder.com') ? (
        <Image source={{uri: clubData.logo}} style={styles.imagePreview} />
      ) : null}

      {/* Kapak Fotoğrafı Seçimi */}
      <Text style={[styles.label, {color: colors.text}]}>Kapak Fotoğrafı</Text>
      <TouchableOpacity
        style={[
          styles.button,
          {backgroundColor: colors.primary, marginBottom: 10},
        ]}
        onPress={() => handleImagePick(setCover)}>
        <Text style={[styles.buttonText, {color: COLORS.white}]}>
          Kapak Fotoğrafı Seç
        </Text>
      </TouchableOpacity>
      {cover ? (
        <Image source={{uri: cover}} style={styles.imagePreviewWide} />
      ) : clubData &&
        clubData.cover &&
        !clubData.cover.startsWith('https://via.placeholder.com') ? ( // Placeholder olmayanları göster
        <Image source={{uri: clubData.cover}} style={styles.imagePreviewWide} />
      ) : null}

      {/* Kulüp Tipi ve Resmi Kulüp Yan Yana */}
      <View style={styles.detailRowContainer}>
        <View style={styles.detailRowItem}>
          <Text style={[styles.infoLabelStyled, {color: colors.text}]}>
            Kulüp Tipi:
          </Text>
          <View
            style={[
              styles.badgeContainer,
              clubData.type === 'public'
                ? styles.badgePublic
                : styles.badgePrivate,
            ]}>
            <Text
              style={[
                styles.badgeIcon,
                clubData.type === 'private' && styles.privateBadgeText, // Özel durum için koyu renk ikon
              ]}>
              {clubData.type === 'public' ? '🌍' : '🔒'}
            </Text>
            <Text
              style={[
                styles.badgeText,
                clubData.type === 'private' && styles.privateBadgeText, // Özel durum için koyu renk yazı
              ]}>
              {clubData.type === 'public' ? 'Herkese Açık' : 'Özel'}
            </Text>
          </View>
        </View>

        {/* Resmi Kulüp mü? - Etiket ve Switch yan yana */}
        <View style={[styles.detailRowItem, styles.rowItemAlignment]}>
          <Text
            style={[
              styles.infoLabelStyled,
              {color: colors.text, flexShrink: 1, marginRight: 4},
            ]}>
            Resmi Kulüp mü?
          </Text>
          <Switch
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={isOfficial ? colors.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsOfficial}
            value={isOfficial}
            style={styles.switchStyle}
          />
        </View>
      </View>

      {/* Durum ve Üye Sayısı Yan Yana */}
      <View style={styles.detailRowContainer}>
        {/* Durum: Değer (Aynı Satırda) */}
        <View style={[styles.detailRowItem, styles.rowItemAlignment]}>
          <Text
            style={[
              styles.infoLabelStyled,
              {color: colors.text, marginRight: 5},
            ]}>
            Durum:
          </Text>
          <Text style={[styles.infoTextValue, {color: colors.text}]}>
            {clubData.status === 'active'
              ? 'Aktif'
              : clubData.status === 'passive'
              ? 'Pasif'
              : clubData.status}
          </Text>
        </View>
        {/* Üye Sayısı: Değer (Aynı Satırda) */}
        <View style={[styles.detailRowItem, styles.rowItemAlignment]}>
          <Text
            style={[
              styles.infoLabelStyled,
              {color: colors.text, marginRight: 5},
            ]}>
            Üye Sayısı:
          </Text>
          <Text style={[styles.infoTextValue, {color: colors.text}]}>
            {clubData.memberCount}
          </Text>
        </View>
      </View>

      {/* Aktif mi? */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabelStyled, {color: colors.text}]}>
          Aktif mi?
        </Text>
        <Text
          style={[
            styles.infoTextValue,
            {color: clubData.isActive ? COLORS.success : COLORS.error},
          ]}>
          {clubData.isActive ? 'Evet ✔️' : 'Hayır ❌'}
        </Text>
      </View>

      {/* Sonsuza Dek Ücretsiz mi? */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabelStyled, {color: colors.text}]}>
          Sonsuza Dek Ücretsiz mi?
        </Text>
        <Text
          style={[
            styles.infoTextValue,
            {color: clubData.isFreeForever ? COLORS.success : COLORS.error},
          ]}>
          {clubData.isFreeForever ? 'Evet ✔️' : 'Hayır ❌'}
        </Text>
      </View>

      {clubData.founder && (
        <View style={styles.founderContainer}>
          <Text style={[styles.label, {color: colors.text, marginTop: 20}]}>
            Kurucu Bilgileri
          </Text>
          <View style={styles.founderInfo}>
            {clubData.founder.profilePicture ? (
              <Image
                source={{
                  uri:
                    'http://ec2-16-171-103-116.eu-north-1.compute.amazonaws.com:3000' +
                    clubData.founder.profilePicture.replace('/public', ''),
                }}
                style={styles.founderImage}
              />
            ) : (
              <View style={styles.founderImagePlaceholder} />
            )}
            <View>
              <Text style={[styles.founderName, {color: colors.text}]}>
                {clubData.founder.firstName} {clubData.founder.lastName}
              </Text>
              {clubData.founder && clubData.founder.nickname && (
                <Text style={[styles.founderNickname, {color: colors.text}]}>
                  ({clubData.founder.nickname})
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, {color: colors.text}]}>
          Oluşturulma Tarihi:
        </Text>
        <Text style={[styles.infoText, {color: colors.text}]}>
          {new Date(clubData.createdAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, {color: colors.text}]}>
          Güncellenme Tarihi:
        </Text>
        <Text style={[styles.infoText, {color: colors.text}]}>
          {new Date(clubData.updatedAt).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Belge Yükleme Bölümü - Sadece isOfficial true ise görünür */}
      {isOfficial && (
        <View style={styles.documentSection}>
          <Text style={[styles.label, {color: colors.text, marginTop: 30}]}>
            Kulüp Belgeleri Yükle
          </Text>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.primary}]}
            onPress={handleDocumentPick}>
            <Text style={[styles.buttonText, {color: COLORS.white}]}>
              Belge Seç
            </Text>
          </TouchableOpacity>

          {/* uploadedDocuments ve existingClubFiles birleşik şekilde listeleniyor */}
          {[...uploadedDocuments, ...existingClubFiles].map((item, _) => {
            // uploadedDocuments ve existingClubFiles farklı tipte olabilir, ayırt et
            const isUploaded = 'uri' in item;
            return (
              <View
                key={isUploaded ? item.uri : item.id}
                style={styles.documentContainer}>
                <View style={styles.documentInfoRow}>
                  <Text
                    style={[styles.documentName, {color: colors.text}]}
                    numberOfLines={1}>
                    {isUploaded ? item.name : item.fileName}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      isUploaded
                        ? removeDocument(item.uri)
                        : removeExistingFile(item.id)
                    }
                    style={{marginLeft: 10}}>
                    <Text style={{color: COLORS.error}}>
                      {isUploaded ? 'Kaldır' : 'Sil'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContainerStyle}>
                  <Picker
                    selectedValue={
                      isUploaded ? item.selectedClubFileType : item.fileType
                    }
                    onValueChange={value =>
                      isUploaded
                        ? updateSelectedClubFileType(item.uri, value)
                        : updateExistingClubFileType(item.id, value)
                    }
                    style={styles.pickerStyle}
                    dropdownIconColor={colors.text}
                    prompt="Dosya Türünü Seçin">
                    {CLUB_FILE_TYPES.map(fileType => (
                      <Picker.Item
                        key={fileType.value}
                        label={fileType.label}
                        value={fileType.value}
                        style={{color: colors.text}}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            );
          })}

          {/* DEBUG: Birleşik belge listesini sade şekilde göster */}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 8,
    marginTop: 16,
  },
  subLabel: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginBottom: 8,
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // iOS için padding ayarı
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 12,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 8,
  },
  documentSection: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.medium,
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  infoLabelStyled: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.medium,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: COLORS.border,
  },
  imagePreviewWide: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 4,
  },
  infoTextValue: {
    fontSize: 15,
    fontFamily: FONTS.FONT_FAMILY.regular,
    textAlign: 'right',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: FONTS.FONT_FAMILY.bold,
    color: COLORS.white,
    marginLeft: 6,
  },
  privateBadgeText: {
    // Yeni eklendi: Özel rozet için koyu renk
    color: COLORS.text, // Temanızdaki ana metin rengi veya koyu bir renk
  },
  badgeIcon: {
    fontSize: 12,
    color: COLORS.white,
  },
  badgePublic: {
    backgroundColor: COLORS.success,
  },
  badgePrivate: {
    backgroundColor: COLORS.warning, // Linter hatası için orange yerine warning
  },
  detailRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 12,
  },
  detailRowItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  rowItemAlignment: {
    // Yeni eklendi: Etiket ve değeri aynı satırda hizalamak için
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, // Dikey padding eklendi
  },
  switchAlignment: {
    // Bu stil artık doğrudan detailRowItem içinde flexDirection ile yönetildiği için kaldırılabilir
    // veya sadece switch'e özel margin/padding için tutulabilir.
    // Şimdilik boş bırakıyorum, gerekirse temizlenir.
  },
  switchStyle: {
    transform: [{scaleX: 0.85}, {scaleY: 0.85}],
  },
  founderContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
  },
  founderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  founderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: COLORS.border,
  },
  founderImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: COLORS.border,
  },
  founderName: {
    fontSize: 16,
    fontFamily: FONTS.FONT_FAMILY.bold,
  },
  founderNickname: {
    fontSize: 14,
    fontFamily: FONTS.FONT_FAMILY.regular,
    color: COLORS.textSecondary,
  },
  documentContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 6,
  },
  documentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentName: {
    fontSize: 15,
    fontFamily: FONTS.FONT_FAMILY.regular,
    marginBottom: 2,
  },
  uploaderNameStyle: {
    fontSize: 12,
    fontFamily: FONTS.FONT_FAMILY.regular,
    color: COLORS.textSecondary,
  },
  pickerContainerStyle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  pickerStyle: {
    height: 50,
    width: '100%',
  },
});

export default EditClubScreen;
