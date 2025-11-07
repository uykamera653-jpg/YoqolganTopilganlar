import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { colors } = useTheme();

  const termsContent = {
    uz: `
# Foydalanish Shartlari

**Oxirgi yangilanish: 7-Noyabr 2024**

## Qabul Qilish

FINDO ilovasidan foydalanish orqali siz ushbu foydalanish shartlarini to'liq qabul qilasiz. Agar shartlar bilan rozi bo'lmasangiz, ilovadan foydalanmang.

## Foydalanuvchi Mas'uliyati

### Ruxsat Etilgan Foydalanish
- Yo'qolgan yoki topilgan buyumlar haqida chinakam e'lonlar joylashtirish
- Boshqa foydalanuvchilar bilan hurmatli muloqot qilish
- To'g'ri va aniq ma'lumot berish

### Taqiqlangan Harakatlar
- Yolg'on yoki chalg'ituvchi ma'lumot joylashtirish
- Boshqalarning shaxsiy ma'lumotlaridan noxush maqsadda foydalanish
- Spam yoki keraksiz xabarlar yuborish
- Noqonuniy faoliyat uchun ilovadan foydalanish
- Boshqa foydalanuvchilarni haqorat qilish yoki tahdid qilish

## E'lonlar

### E'lon Joylash Qoidalari
- Faqat o'zingiz topgan yoki yo'qotgan buyumlar haqida e'lon bering
- Aniq va tushunarli ma'lumot kiriting
- Haqiqiy rasm va aloqa ma'lumotlarini taqdim eting
- Mukofot haqida haqiqiy ma'lumot bering (agar bo'lsa)

### E'lon Moderatsiyasi
Biz quyidagi e'lonlarni o'chirish huquqini saqlab qolamiz:
- Qoidalarni buzadigan e'lonlar
- Yolg'on yoki chalg'ituvchi ma'lumotlar
- Noqonuniy kontentga oid e'lonlar
- Shikoyat qilingan e'lonlar (tekshiruvdan keyin)

## Intellektual Mulk

Siz yuklagan barcha kontentga (rasmlar, matnlar) nisbatan o'zingiz mas'ulsiz. Yuklangan kontentning boshqa shaxslarning huquqlarini buzmasligiga kafolat berasiz.

## Ma'lumotlar Xavfsizligi

Biz sizning ma'lumotlaringizni himoya qilish uchun eng yaxshi usullarni qo'llaymiz, ammo 100% xavfsizlikka kafolat bera olmaymiz. Siz o'z hisobingiz xavfsizligi uchun mas'ulsiz:
- Kuchli parol yarating
- Parolingizni hech kimga bermang
- Shubhali faoliyatni darhol xabar qiling

## Mas'uliyatni Cheklash

FINDO ilovasi:
- Foydalanuvchilar o'rtasidagi bitimlar uchun javobgar emas
- Yo'qolgan buyumlarning topilishiga kafolat bermaydi
- Foydalanuvchilar bergan ma'lumotlar aniqligi uchun javobgar emas
- Uchinchi shaxslar sabab bo'lgan zararlar uchun javobgar emas

## Hisobni To'xtatish

Biz quyidagi hollarda hisobingizni to'xtatish huquqini saqlab qolamiz:
- Foydalanish shartlarini buzganingizda
- Boshqa foydalanuvchilardan ko'p shikoyatlar kelganida
- Noqonuniy faoliyatda gumon qilinganingizda
- Hisobingiz 6 oydan ortiq faol bo'lmaganida

## O'zgarishlar

Biz ushbu shartlarni istalgan vaqtda o'zgartirish huquqini saqlab qolamiz. Barcha o'zgarishlar ilova orqali e'lon qilinadi.

## Qonun Va Yurisdiksiya

Ushbu shartlar O'zbekiston Respublikasi qonunlariga muvofiq tartibga solinadi.

## Aloqa

Savollar yoki muammolar uchun:
- Telefon: +998 50 101 76 95
- Email: support@findo.uz

---

*FINDO ilovasidan foydalanganingiz uchun rahmat!*
    `,
    en: `
# Terms of Service

**Last Updated: November 7, 2024**

## Acceptance

By using the FINDO app, you fully accept these terms of service. If you do not agree with the terms, do not use the app.

## User Responsibility

### Permitted Use
- Post genuine ads about lost or found items
- Communicate respectfully with other users
- Provide accurate and precise information

### Prohibited Actions
- Posting false or misleading information
- Misusing others' personal information
- Sending spam or unwanted messages
- Using the app for illegal activities
- Insulting or threatening other users

## Posts

### Posting Rules
- Only post about items you have actually found or lost
- Enter clear and understandable information
- Provide real photos and contact information
- Give honest information about rewards (if any)

### Post Moderation
We reserve the right to remove posts that:
- Violate the rules
- Contain false or misleading information
- Relate to illegal content
- Have been reported (after review)

## Intellectual Property

You are responsible for all content you upload (images, texts). You guarantee that uploaded content does not violate the rights of others.

## Data Security

We use the best methods to protect your data, but cannot guarantee 100% security. You are responsible for your account security:
- Create a strong password
- Do not share your password with anyone
- Report suspicious activity immediately

## Limitation of Liability

FINDO app:
- Is not responsible for transactions between users
- Does not guarantee that lost items will be found
- Is not responsible for the accuracy of user-provided information
- Is not liable for damages caused by third parties

## Account Termination

We reserve the right to suspend your account if:
- You violate the terms of service
- Multiple complaints are received from other users
- You are suspected of illegal activity
- Your account has been inactive for more than 6 months

## Changes

We reserve the right to change these terms at any time. All changes will be announced through the app.

## Law and Jurisdiction

These terms are governed by the laws of the Republic of Uzbekistan.

## Contact

For questions or issues:
- Phone: +998 50 101 76 95
- Email: support@findo.uz

---

*Thank you for using FINDO!*
    `,
    ru: `
# Условия Использования

**Последнее обновление: 7 ноября 2024**

## Принятие

Используя приложение FINDO, вы полностью принимаете эти условия использования. Если вы не согласны с условиями, не используйте приложение.

## Ответственность Пользователя

### Разрешенное Использование
- Размещение подлинных объявлений о потерянных или найденных вещах
- Уважительное общение с другими пользователями
- Предоставление точной и корректной информации

### Запрещенные Действия
- Размещение ложной или вводящей в заблуждение информации
- Неправомерное использование личной информации других
- Отправка спама или нежелательных сообщений
- Использование приложения для незаконной деятельности
- Оскорбление или угрозы другим пользователям

## Объявления

### Правила Размещения
- Размещайте объявления только о вещах, которые вы действительно нашли или потеряли
- Вводите четкую и понятную информацию
- Предоставляйте реальные фото и контактные данные
- Указывайте честную информацию о вознаграждении (если есть)

### Модерация Объявлений
Мы оставляем за собой право удалять объявления, которые:
- Нарушают правила
- Содержат ложную или вводящую в заблуждение информацию
- Связаны с незаконным контентом
- На которые поступили жалобы (после проверки)

## Интеллектуальная Собственность

Вы несете ответственность за весь загружаемый контент (изображения, тексты). Вы гарантируете, что загружаемый контент не нарушает права других лиц.

## Безопасность Данных

Мы используем лучшие методы для защиты ваших данных, но не можем гарантировать 100% безопасность. Вы несете ответственность за безопасность своей учетной записи:
- Создайте надежный пароль
- Не сообщайте свой пароль никому
- Немедленно сообщайте о подозрительной активности

## Ограничение Ответственности

Приложение FINDO:
- Не несет ответственности за сделки между пользователями
- Не гарантирует, что потерянные вещи будут найдены
- Не несет ответственности за точность информации, предоставленной пользователями
- Не несет ответственности за ущерб, причиненный третьими лицами

## Прекращение Учетной Записи

Мы оставляем за собой право приостановить вашу учетную запись, если:
- Вы нарушаете условия использования
- Получено множество жалоб от других пользователей
- Вы подозреваетесь в незаконной деятельности
- Ваша учетная запись неактивна более 6 месяцев

## Изменения

Мы оставляем за собой право изменять эти условия в любое время. Все изменения будут объявлены через приложение.

## Закон и Юрисдикция

Эти условия регулируются законодательством Республики Узбекистан.

## Контакты

По вопросам или проблемам:
- Телефон: +998 50 101 76 95
- Email: support@findo.uz

---

*Спасибо за использование FINDO!*
    `,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.terms.title}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.text, { color: colors.text }]}>
          {termsContent[useLanguage().language as keyof typeof termsContent]}
        </Text>
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
    padding: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
});
