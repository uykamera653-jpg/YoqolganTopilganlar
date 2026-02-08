import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
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
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);

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

  const filteredRegions = useMemo(() => {
    if (!region.trim()) return regions;
    const searchText = region.toLowerCase();
    return regions.filter(r => r.label.toLowerCase().includes(searchText));
  }, [region, regions]);

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
                {t.postForm.typeFound}
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
                {t.postForm.typeLost}
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
          <View>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={region}
              onChangeText={(text) => {
                setRegion(text);
                setShowRegionSuggestions(text.length > 0);
              }}
              onFocus={() => setShowRegionSuggestions(region.length > 0)}
              placeholder={t.postForm.regionPlaceholder}
              placeholderTextColor={colors.textSecondary}
            />
            {showRegionSuggestions && filteredRegions.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FlatList
                  data={filteredRegions}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                      onPressIn={() => {
                        setRegion(item.label);
                        setShowRegionSuggestions(false);
                      }}
                    >
                      <MaterialIcons name="location-city" size={18} color={colors.textSecondary} />
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                />
              </View>
            )}
          </View>

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
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  suggestionText: {
    fontSize: typography.base,
    flex: 1,
  },
});
