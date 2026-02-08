import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { useAuth, useAlert } from '@/template';
import { PostFormData } from '@/types';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddPostScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { showAlert } = useAlert();
  const router = useRouter();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const [type, setType] = useState<'found' | 'lost'>('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [reward, setReward] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const regions = [
    { key: 'tashkent_city', label: t.regions.tashkent_city },
    { key: 'tashkent', label: t.regions.tashkent },
    { key: 'andijan', label: t.regions.andijan },
    { key: 'bukhara', label: t.regions.bukhara },
    { key: 'fergana', label: t.regions.fergana },
    { key: 'jizzakh', label: t.regions.jizzakh },
    { key: 'namangan', label: t.regions.namangan },
    { key: 'navoi', label: t.regions.navoi },
    { key: 'kashkadarya', label: t.regions.kashkadarya },
    { key: 'karakalpakstan', label: t.regions.karakalpakstan },
    { key: 'samarkand', label: t.regions.samarkand },
    { key: 'sirdarya', label: t.regions.sirdarya },
    { key: 'surkhandarya', label: t.regions.surkhandarya },
    { key: 'khorezm', label: t.regions.khorezm },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t.error, t.errors.uploadError);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showAlert(t.error, t.auth.login, [
        { text: t.cancel, style: 'cancel' },
        { text: t.auth.login, onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!title.trim() || !description.trim() || !region.trim() || !location.trim() || !contact.trim()) {
      showAlert(t.error, t.errors.fillAllFields);
      return;
    }

    setLoading(true);

    const postData: PostFormData = {
      type,
      title: title.trim(),
      description: description.trim(),
      region: region.trim(),
      location: location.trim(),
      contact: contact.trim(),
      image_url: imageUri || undefined,
      reward: type === 'lost' && reward.trim() ? reward.trim() : undefined,
      date_occurred: dateOccurred.trim() || undefined,
    };

    const { success, error } = await createPost(postData);

    setLoading(false);

    if (success) {
      showAlert(t.success, t.postForm.submit);
      setTitle('');
      setDescription('');
      setRegion('');
      setLocation('');
      setContact('');
      setReward('');
      setDateOccurred('');
      setImageUri(null);
      router.push('/(tabs)');
    } else {
      showAlert(t.error, error || t.errors.generic);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>{t.postForm.title}</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.type}</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: colors.surface, borderColor: colors.border }, type === 'found' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setType('found')}
            >
              <MaterialIcons
                name="search"
                size={24}
                color={type === 'found' ? '#FFFFFF' : colors.found}
              />
              <Text style={[styles.typeButtonText, { color: colors.text }, type === 'found' && { color: '#FFFFFF' }]}>
                {t.postTypes.found}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: colors.surface, borderColor: colors.border }, type === 'lost' && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => setType('lost')}
            >
              <MaterialIcons
                name="warning"
                size={24}
                color={type === 'lost' ? '#FFFFFF' : colors.lost}
              />
              <Text style={[styles.typeButtonText, { color: colors.text }, type === 'lost' && { color: '#FFFFFF' }]}>
                {t.postTypes.lost}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.uploadImage}</Text>
          <TouchableOpacity style={[styles.imagePicker, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <>
                <MaterialIcons name="add-photo-alternate" size={48} color={colors.textSecondary} />
                <Text style={[styles.imagePickerText, { color: colors.textSecondary }]}>{t.postForm.uploadImage}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.itemTitle} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder={t.postForm.itemTitlePlaceholder}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.description} *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder={t.postForm.descriptionPlaceholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.region}</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowRegionPicker(true)}
          >
            <Text style={[styles.regionText, { color: region ? colors.text : colors.textSecondary }]}>
              {region || t.postForm.regionPlaceholder}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.location} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder={t.postForm.locationPlaceholder}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.dateOccurred}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={dateOccurred}
            onChangeText={setDateOccurred}
            placeholder={t.postForm.dateOccurredPlaceholder}
            placeholderTextColor={colors.textSecondary}
          />

          {type === 'lost' && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>{t.postForm.reward}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={reward}
                onChangeText={setReward}
                placeholder={t.postForm.rewardPlaceholder}
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          <Text style={[styles.label, { color: colors.text }]}>{t.postForm.contact} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={contact}
            onChangeText={setContact}
            placeholder={t.postForm.contactPlaceholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="publish" size={24} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t.postForm.submit}</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={showRegionPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRegionPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowRegionPicker(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t.postForm.region}</Text>
                <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.regionList} showsVerticalScrollIndicator={false}>
                {regions.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.regionItem, { borderBottomColor: colors.border }, region === r.label && { backgroundColor: colors.primary + '10' }]}
                    onPress={() => {
                      setRegion(r.label);
                      setShowRegionPicker(false);
                    }}
                  >
                    <Text style={[styles.regionItemText, { color: region === r.label ? colors.primary : colors.text }]}>
                      {r.label}
                    </Text>
                    {region === r.label && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  typeButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  imagePicker: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerText: {
    fontSize: typography.base,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
  regionText: {
    flex: 1,
    fontSize: typography.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
  regionList: {
    maxHeight: 400,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  regionItemText: {
    fontSize: typography.base,
  },
});
