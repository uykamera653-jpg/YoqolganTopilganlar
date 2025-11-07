import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { getSupabaseClient } from '@/template';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  sendPushNotification: (expoPushToken: string, title: string, body: string, data?: any) => Promise<void>;
  registerForPushNotifications: () => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Register for push notifications when user logs in
    if (user) {
      registerForPushNotifications().then(token => {
        if (token) {
          setExpoPushToken(token);
          // Save token to user profile
          saveTokenToProfile(token);
        }
      });
    }

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.userId && data?.username) {
        router.push(`/chat?userId=${data.userId}&username=${data.username}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const saveTokenToProfile = async (token: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ push_token: token })
        .eq('id', user.id);

      if (error) {
        console.log('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.log('Error in saveTokenToProfile:', error);
    }
  };

  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      // Setup Android notification channel first
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'FINDO Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#5C6BC0',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();

      return tokenData.data;
    } catch (error) {
      console.log('Error registering for push notifications:', error);
      return null;
    }
  };

  const sendPushNotification = async (
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high' as const,
      badge: 1,
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        sendPushNotification,
        registerForPushNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
