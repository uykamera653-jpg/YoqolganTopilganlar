export default {
  // Common
  appName: 'FINDO',
  appTagline: 'Yo\'qotdingizmi? Topdingizmi? E\'lon qoldiring!',
  cancel: 'Bekor qilish',
  save: 'Saqlash',
  delete: 'O\'chirish',
  edit: 'Tahrirlash',
  send: 'Yuborish',
  back: 'Orqaga',
  loading: 'Yuklanmoqda...',
  error: 'Xatolik',
  success: 'Muvaffaqiyatli',
  
  // Auth
  auth: {
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    logout: 'Chiqish',
    email: 'Email',
    password: 'Parol',
    confirmPassword: 'Parolni tasdiqlash',
    forgotPassword: 'Parolni unutdingizmi?',
    dontHaveAccount: 'Hisobingiz yo\'qmi?',
    alreadyHaveAccount: 'Hisobingiz bormi?',
    enterOtp: 'Tasdiqlash kodini kiriting',
    otpSent: 'Tasdiqlash kodi emailingizga yuborildi',
    verifyAndRegister: 'Tasdiqlash va ro\'yxatdan o\'tish',
    termsAgree: 'Men maxfiylik siyosati va foydalanish shartlarini qabul qilaman',
    termsRequired: 'Maxfiylik siyosati va foydalanish shartlarini qabul qilishingiz shart',
    privacyPolicy: 'Maxfiylik siyosati',
    termsOfService: 'Foydalanish shartlari',
    and: 'va',
    privacyInfo: 'Ma\'lumotlaringiz xavfsizligi uchun',
    privacyDescription: 'Biz sizning ma\'lumotlaringizni himoya qilish uchun eng so\'nggi texnologiyalardan foydalanamiz. Hech kim sizdan shaxsiy ma\'lumotlaringizni so\'ramaydi. Barcha ma\'lumotlar xavfsiz serverlarimizda saqlanadi.',
  },
  
  // Tabs
  tabs: {
    home: 'Bosh sahifa',
    messages: 'Xabarlar',
    addPost: 'E\'lon berish',
    profile: 'Profil',
  },
  
  // Home
  home: {
    featured: 'Halollik - eng katta mukofot',
    categories: 'Asosiy bo\'limlar',
    found: 'Topdim',
    lost: 'Yo\'qotdim',
    reward: 'Mukofotli',
    all: 'Barchasi',
  },
  
  // Post Types
  postTypes: {
    found: 'Topdim',
    lost: 'Yo\'qotdim',
    foundItems: 'Topilgan buyumlar',
    lostItems: 'Yo\'qolgan buyumlar',
    rewardedItems: 'Mukofotli e\'lonlar',
    allPosts: 'Barcha e\'lonlar',
  },
  
  // Post Form
  postForm: {
    title: 'E\'lon berish',
    editTitle: 'E\'lonni tahrirlash',
    type: 'Tur',
    selectType: 'Turni tanlang',
    itemTitle: 'Nima?',
    itemTitlePlaceholder: 'Masalan: Qora telefon',
    description: 'Tavsif',
    descriptionPlaceholder: 'Batafsil ma\'lumot bering',
    location: 'Qayerda?',
    locationPlaceholder: 'Masalan: Amir Temur ko\'chasi',
    contact: 'Aloqa uchun',
    contactPlaceholder: '+998 90 123 45 67',
    reward: 'Mukofot (ixtiyoriy)',
    rewardPlaceholder: 'Masalan: 100,000 so\'m',
    dateOccurred: 'Qachon?',
    dateOccurredPlaceholder: 'Masalan: 25-Oktabr 2024',
    uploadImage: 'Rasm yuklash',
    changeImage: 'Rasmni o\'zgartirish',
    submit: 'E\'lon berish',
    update: 'Yangilash',
    required: 'Bu maydon to\'ldirilishi shart',
    imageRequired: 'Rasm yuklash shart',
  },
  
  // Post Detail
  postDetail: {
    title: 'E\'lon',
    location: 'Joylashuv',
    contact: 'Aloqa',
    reward: 'Mukofot',
    dateOccurred: 'Sana',
    postedBy: 'E\'lon beruvchi',
    viewAllPosts: 'Barcha e\'lonlarini ko\'rish',
    sendMessage: 'Xabar yuborish',
    comments: 'Sharhlar',
    writeComment: 'Sharh yozish...',
    addComment: 'Sharh qo\'shish',
    noComments: 'Hali sharhlar yo\'q',
    deletePost: 'E\'lonni o\'chirish',
    confirmDelete: 'E\'lonni o\'chirishni xohlaysizmi?',
    postDeleted: 'E\'lon o\'chirildi',
  },
  
  // Messages
  messages: {
    title: 'Xabarlar',
    noMessages: 'Xabarlar yo\'q',
    startConversation: 'Suhbat boshlash uchun biror kishiga xabar yuboring',
    typeMessage: 'Xabar yozish...',
    chatWith: 'bilan suhbat',
  },
  
  // Send Message
  sendMessage: {
    title: 'Xabar yuborish',
    to: 'ga xabar yuborish',
    placeholder: 'Xabaringizni shu yerga yozing...',
    sendButton: 'Xabar yuborish',
    sending: 'Yuborilmoqda...',
    sent: 'Xabar yuborildi',
    error: 'Xabar yuborishda xatolik',
    emptyError: 'Xabar bo\'sh bo\'lmasligi kerak',
  },
  
  // Profile
  profile: {
    title: 'Profil',
    editProfile: 'Profilni tahrirlash',
    myPosts: 'Mening e\'lonlarim',
    settings: 'Sozlamalar',
    language: 'Til',
    theme: 'Rejim',
    lightMode: 'Kunduzgi',
    darkMode: 'Tungi',
    helpSupport: 'Yordam xizmati',
    logout: 'Chiqish',
    username: 'Foydalanuvchi nomi',
    email: 'Email',
    changeAvatar: 'Avatarni o\'zgartirish',
    noPosts: 'Hali e\'lonlar yo\'q',
    postsCount: 'E\'lonlar',
    confirmLogout: 'Chiqishni xohlaysizmi?',
    profileUpdated: 'Profil yangilandi',
  },
  
  // User Posts
  userPosts: {
    title: 'Foydalanuvchi',
    posts: 'E\'lonlar',
    sendMessage: 'Xabar yuborish',
  },
  
  // Errors
  errors: {
    generic: 'Xatolik yuz berdi',
    networkError: 'Tarmoq xatosi',
    authError: 'Autentifikatsiya xatosi',
    notFound: 'Topilmadi',
    uploadError: 'Yuklashda xatolik',
    fillAllFields: 'Barcha maydonlarni to\'ldiring',
    invalidEmail: 'Noto\'g\'ri email',
    passwordMismatch: 'Parollar mos kelmaydi',
    weakPassword: 'Parol juda oddiy',
  },
  
  // Privacy & Terms
  privacy: {
    title: 'Maxfiylik siyosati',
    lastUpdated: 'Oxirgi yangilanish',
    description: 'FINDO ilovasida sizning ma\'lumotlaringiz xavfsizligi ustuvor vazifamizdir.',
  },
  
  terms: {
    title: 'Foydalanish shartlari',
    lastUpdated: 'Oxirgi yangilanish',
    description: 'FINDO ilovasidan foydalanish shartlari.',
  },
};
