import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { colors } = useTheme();

  const privacyContent = {
    uz: `
# Maxfiylik Siyosati

**Oxirgi yangilanish: 7-Noyabr 2024**

## Kirish

FINDO ilovasida sizning ma'lumotlaringiz xavfsizligi bizning ustuvor vazifamizdir. Ushbu maxfiylik siyosati ilova orqali to'plangan, ishlatilgan va himoyalangan ma'lumotlar haqida batafsil ma'lumot beradi.

## To'planadigan Ma'lumotlar

### Shaxsiy Ma'lumotlar
- Email manzil
- Foydalanuvchi nomi
- Profil rasmi (ixtiyoriy)

### Kiritilgan Ma'lumotlar
- E'lon ma'lumotlari (sarlavha, tavsif, joylashuv)
- Yuklangan rasmlar
- Sharhlar va xabarlar
- Aloqa ma'lumotlari (telefon raqami - ixtiyoriy)

## Ma'lumotlardan Foydalanish

Sizning ma'lumotlaringiz quyidagi maqsadlarda ishlatiladi:
- Hisobingizni yaratish va boshqarish
- E'lonlarni ko'rsatish va boshqarish
- Foydalanuvchilar o'rtasida aloqa imkoniyatini ta'minlash
- Ilovani yaxshilash va xizmatlarni optimallashtirish

## Ma'lumotlar Xavfsizligi

Biz sizning ma'lumotlaringizni himoya qilish uchun quyidagilarni qilmoqdamiz:
- Barcha ma'lumotlar shifrlangan (SSL/TLS)
- Xavfsiz serverlar orqali saqlash
- Faqat zarur hollarda ma'lumotlarga kirish
- Muntazam xavfsizlik auditi

## Sizning Huquqlaringiz

Siz quyidagi huquqlarga egasiz:
- O'z ma'lumotlaringizni ko'rish
- Ma'lumotlarni tahrirlash yoki o'chirish
- Hisobni to'liq o'chirish
- Ma'lumotlar to'plamiga qarshi e'tiroz bildirish

## Uchinchi Shaxslar

Biz sizning shaxsiy ma'lumotlaringizni uchinchi shaxslarga sotmaymiz yoki bermaymiz. Ma'lumotlar faqat quyidagi hollarda ulashilishi mumkin:
- Qonun talabi bo'yicha
- Sizning roziligingiz bilan
- Texnik xizmat ko'rsatuvchilar (server, hosting)

## Farzandlar Maxfiyligi

Ilovamiz 13 yoshgacha bo'lgan farzandlar uchun mo'ljallanmagan. Agar siz 13 yoshdan kichik bo'lsangiz, ota-onangiz yoki vasiyingizning roziligini oling.

## O'zgarishlar

Ushbu maxfiylik siyosati vaqti-vaqti bilan yangilanishi mumkin. Barcha o'zgarishlar ilova orqali e'lon qilinadi.

## Aloqa

Agar sizda savollar yoki tashvishlar bo'lsa, biz bilan bog'laning:
- Telefon: +998 50 101 76 95
- Email: support@findo.uz

---

*FINDO jamoasi sizning ishonchingiz uchun minnatdor.*
    `,
    en: `
# Privacy Policy

**Last Updated: November 7, 2024**

## Introduction

Your data security is our top priority at FINDO app. This privacy policy provides detailed information about the data collected, used, and protected through the app.

## Data We Collect

### Personal Information
- Email address
- Username
- Profile picture (optional)

### User-Generated Content
- Post information (title, description, location)
- Uploaded images
- Comments and messages
- Contact information (phone number - optional)

## How We Use Your Data

Your data is used for the following purposes:
- Creating and managing your account
- Displaying and managing posts
- Enabling communication between users
- Improving the app and optimizing services

## Data Security

We protect your data by:
- Encrypting all data (SSL/TLS)
- Storing on secure servers
- Accessing data only when necessary
- Conducting regular security audits

## Your Rights

You have the right to:
- View your data
- Edit or delete your data
- Delete your account completely
- Object to data collection

## Third Parties

We do not sell or share your personal information with third parties. Data may only be shared in the following cases:
- Legal requirements
- With your consent
- Technical service providers (server, hosting)

## Children's Privacy

Our app is not intended for children under 13. If you are under 13, please obtain consent from your parent or guardian.

## Changes

This privacy policy may be updated from time to time. All changes will be announced through the app.

## Contact

If you have questions or concerns, please contact us:
- Phone: +998 50 101 76 95
- Email: support@findo.uz

---

*The FINDO team is grateful for your trust.*
    `,
    ru: `
# Политика Конфиденциальности

**Последнее обновление: 7 ноября 2024**

## Введение

Безопасность ваших данных - наш главный приоритет в приложении FINDO. Эта политика конфиденциальности предоставляет подробную информацию о собираемых, используемых и защищаемых данных через приложение.

## Собираемые Данные

### Личная Информация
- Адрес электронной почты
- Имя пользователя
- Фото профиля (необязательно)

### Пользовательский Контент
- Информация об объявлениях (заголовок, описание, местоположение)
- Загруженные изображения
- Комментарии и сообщения
- Контактная информация (номер телефона - необязательно)

## Использование Данных

Ваши данные используются для следующих целей:
- Создание и управление вашей учетной записью
- Отображение и управление объявлениями
- Обеспечение связи между пользователями
- Улучшение приложения и оптимизация услуг

## Безопасность Данных

Мы защищаем ваши данные следующим образом:
- Шифрование всех данных (SSL/TLS)
- Хранение на защищенных серверах
- Доступ к данным только при необходимости
- Регулярные проверки безопасности

## Ваши Права

Вы имеете право:
- Просматривать свои данные
- Редактировать или удалять свои данные
- Полностью удалить свою учетную запись
- Возражать против сбора данных

## Третьи Лица

Мы не продаем и не передаем вашу личную информацию третьим лицам. Данные могут быть переданы только в следующих случаях:
- По требованию закона
- С вашего согласия
- Поставщикам технических услуг (сервер, хостинг)

## Конфиденциальность Детей

Наше приложение не предназначено для детей младше 13 лет. Если вам меньше 13 лет, получите согласие родителей или опекуна.

## Изменения

Эта политика конфиденциальности может обновляться время от времени. Все изменения будут объявлены через приложение.

## Контакты

Если у вас есть вопросы или проблемы, свяжитесь с нами:
- Телефон: +998 50 101 76 95
- Email: support@findo.uz

---

*Команда FINDO благодарна за ваше доверие.*
    `,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.privacy.title}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <MaterialIcons name="security" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t.privacy.title}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{t.privacy.description}</Text>
        </View>
        
        <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.text, { color: colors.text }]}>
            {privacyContent[language]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  contentCard: {
    borderRadius: 16,
    padding: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
});
