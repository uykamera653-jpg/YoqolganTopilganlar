import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { usePosts } from '@/hooks/usePosts';
import { useAuth, useAlert } from '@/template';
import { PostFormData } from '@/types';
import { useRouter } from 'expo-router';

export default function AddPostScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [type, setType] = useState<'found' | 'lost'>('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [reward, setReward] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Ruxsat kerak', 'Iltimos, galereya uchun ruxsat bering');
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
      showAlert('Kirish kerak', 'E\'lon berish uchun tizimga kiring', [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Kirish', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !contact.trim()) {
      showAlert('Xato', 'Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);

    const postData: PostFormData = {
      type,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      contact: contact.trim(),
      image_url: imageUri || undefined,
      reward: type === 'lost' && reward.trim() ? reward.trim() : undefined,
      date_occurred: dateOccurred.trim() || undefined,
    };

    const { success, error } = await createPost(postData);

    setLoading(false);

    if (success) {
      showAlert('Muvaffaqiyatli!', 'E\'lon muvaffaqiyatli yaratildi');
      setTitle('');
      setDescription('');
      setLocation('');
      setContact('');
      setReward('');
      setDateOccurred('');
      setImageUri(null);
      router.push('/(tabs)');
    } else {
      showAlert('Xato', error || 'E\'lon yaratishda xatolik');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>E'lon berish</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          <Text style={styles.label}>E'lon turi</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'found' && styles.typeButtonActive]}
              onPress={() => setType('found')}
            >
              <MaterialIcons
                name="search"
                size={24}
                color={type === 'found' ? colors.white : colors.found}
              />
              <Text style={[styles.typeButtonText, type === 'found' && styles.typeButtonTextActive]}>
                Topdim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'lost' && styles.typeButtonActive]}
              onPress={() => setType('lost')}
            >
              <MaterialIcons
                name="warning"
                size={24}
                color={type === 'lost' ? colors.white : colors.lost}
              />
              <Text style={[styles.typeButtonText, type === 'lost' && styles.typeButtonTextActive]}>
                Yo'qotdim
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Rasm yuklash</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
            ) : (
              <>
                <MaterialIcons name="add-photo-alternate" size={48} color={colors.textSecondary} />
                <Text style={styles.imagePickerText}>Rasm tanlang</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Nima {type === 'found' ? 'topdingiz' : 'yo\'qotdingiz'}? *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Masalan: Ko'k rangli sumka"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Batafsil ma'lumot *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Buyum haqida batafsil yozing..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Joylashuv *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Qayerda topdingiz/yo'qotdingiz?"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Sana</Text>
          <TextInput
            style={styles.input}
            value={dateOccurred}
            onChangeText={setDateOccurred}
            placeholder="Qachon? (ixtiyoriy)"
            placeholderTextColor={colors.textSecondary}
          />

          {type === 'lost' && (
            <>
              <Text style={styles.label}>Mukofot miqdori</Text>
              <TextInput
                style={styles.input}
                value={reward}
                onChangeText={setReward}
                placeholder="Masalan: 100,000 so'm (ixtiyoriy)"
                placeholderTextColor={colors.textSecondary}
              />
            </>
          )}

          <Text style={styles.label}>Aloqa uchun telefon *</Text>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            placeholder="+998 XX XXX XX XX"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="publish" size={24} color={colors.white} />
                <Text style={styles.submitButtonText}>E'lon berish</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  imagePicker: {
    height: 200,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
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
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
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
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semibold,
  },
});
