export default {
  // Common
  appName: 'FINDO',
  appTagline: 'Lost Something? Found Something? Post It!',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  send: 'Send',
  back: 'Back',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  
  // Auth
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    enterOtp: 'Enter verification code',
    otpSent: 'Verification code sent to your email',
    verifyAndRegister: 'Verify and Register',
    termsAgree: 'I agree to the Privacy Policy and Terms of Service',
    termsRequired: 'You must agree to the Privacy Policy and Terms of Service',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyInfo: 'Your Data Security',
    privacyDescription: 'We use the latest technology to protect your data. No one will ask for your personal information. All data is stored on our secure servers.',
    loginRequired: 'Please login to write a comment',
  },
  
  // Tabs
  tabs: {
    home: 'Home',
    messages: 'Messages',
    addPost: 'Post',
    profile: 'Profile',
  },
  
  // Home
  home: {
    featured: 'Honesty - the greatest reward',
    categories: 'Main Categories',
    found: 'Found Items',
    lost: 'Lost Items',
    reward: 'Rewarded',
    all: 'All',
  },
  
  // Post Types
  postTypes: {
    found: 'Found Items',
    lost: 'Lost Items',
    foundItems: 'Found Items',
    lostItems: 'Lost Items',
    rewardedItems: 'Rewarded Posts',
    allPosts: 'All Posts',
  },
  
  // Regions
  regions: {
    title: 'Region',
    all: 'All Regions',
    tashkent_city: 'Tashkent City',
    tashkent: 'Tashkent Region',
    andijan: 'Andijan',
    bukhara: 'Bukhara',
    fergana: 'Fergana',
    jizzakh: 'Jizzakh',
    namangan: 'Namangan',
    navoi: 'Navoi',
    kashkadarya: 'Kashkadarya',
    karakalpakstan: 'Karakalpakstan',
    samarkand: 'Samarkand',
    sirdarya: 'Sirdarya',
    surkhandarya: 'Surkhandarya',
    khorezm: 'Khorezm',
  },
  
  // Post Form
  postForm: {
    title: 'Create Post',
    editTitle: 'Edit Post',
    type: 'Type',
    selectType: 'Select type',
    typeFound: 'I Found',
    typeLost: 'I Lost',
    itemTitle: 'What?',
    itemTitlePlaceholder: 'e.g., Black phone',
    description: 'Description',
    descriptionPlaceholder: 'Provide detailed information',
    region: 'Region *',
    regionPlaceholder: 'Select region',
    location: 'Where?',
    locationPlaceholder: 'e.g., Amir Temur Street',
    contact: 'Contact',
    contactPlaceholder: '+998 90 123 45 67',
    reward: 'Reward (optional)',
    rewardPlaceholder: 'e.g., 100,000 sum',
    dateOccurred: 'When?',
    dateOccurredPlaceholder: 'e.g., October 25, 2024',
    uploadImage: 'Upload Image',
    changeImage: 'Change Image',
    submit: 'Post',
    update: 'Update',
    required: 'This field is required',
    imageRequired: 'Image upload is required',
  },
  
  // Post Detail
  postDetail: {
    title: 'Post',
    location: 'Location',
    contact: 'Contact',
    reward: 'Reward',
    dateOccurred: 'Date',
    postedBy: 'Posted by',
    viewAllPosts: 'View all posts',
    sendMessage: 'Send Message',
    comments: 'Comments',
    writeComment: 'Write a comment...',
    addComment: 'Add Comment',
    noComments: 'No comments yet',
    deletePost: 'Delete Post',
    confirmDelete: 'Do you want to delete this post?',
    postDeleted: 'Post deleted',
  },
  
  // Messages
  messages: {
    title: 'Messages',
    noMessages: 'No messages',
    startConversation: 'Send a message to someone to start a conversation',
    typeMessage: 'Type a message...',
    chatWith: 'Chat with',
    justNow: 'Just now',
  },
  
  // Send Message
  sendMessage: {
    title: 'Send Message',
    to: 'Send message to',
    placeholder: 'Type your message here...',
    sendButton: 'Send Message',
    sending: 'Sending...',
    sent: 'Message sent',
    error: 'Error sending message',
    emptyError: 'Message cannot be empty',
  },
  
  // Profile
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    myPosts: 'My Posts',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light',
    darkMode: 'Dark',
    helpSupport: 'Help & Support',
    logout: 'Logout',
    username: 'Username',
    email: 'Email',
    changeAvatar: 'Change Avatar',
    noPosts: 'No posts yet',
    postsCount: 'Posts',
    confirmLogout: 'Do you want to logout?',
    profileUpdated: 'Profile updated',
  },
  
  // User Posts
  userPosts: {
    title: 'User',
    posts: 'Posts',
    sendMessage: 'Send Message',
  },
  
  // Errors
  errors: {
    generic: 'An error occurred',
    networkError: 'Network error',
    authError: 'Authentication error',
    notFound: 'Not found',
    uploadError: 'Upload error',
    fillAllFields: 'Fill all fields',
    invalidEmail: 'Invalid email',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Password is too weak',
    duplicateEmail: 'This email is already registered. Please use the login section.',
    invalidOtp: 'Invalid verification code. Please try again.',
    invalidCredentials: 'Invalid email or password. Please try again.',
    userNotFound: 'No account found with this email.',
  },
  
  // Privacy & Terms
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated',
    description: 'Your data security is our top priority in FINDO app.',
  },
  
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated',
    description: 'Terms of Service for using FINDO app.',
  },

  // Reset Password
  resetPassword: {
    title: 'Reset Password',
    newPasswordTitle: 'Create New Password',
    requestSubtitle: 'We will send a password reset link to your email',
    updateSubtitle: 'Enter your new password',
    sendLink: 'Send Link',
    updatePassword: 'Update Password',
    newPassword: 'New Password',
    backToLogin: 'Back to Login',
    linkSent: 'Password reset link has been sent to your email. Please check your email.',
    passwordUpdated: 'Password successfully updated!',
  },
};
