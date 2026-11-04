/**
 * Notification copy catalogue and channel definitions for Maganis (مجانص).
 * Short Egyptian Arabic UI strings with NO health, medical, training, or nutrition claims (Rules R1/R2).
 */

export type NotificationType =
  'workout_day' | 'rest_end' | 'cardio_end' | 'backup_alert' | 'nutrition_log'

export type NotificationChannelId =
  'workout_v1' | 'timer_v1' | 'backup_v1' | 'nutrition_v1'

export interface ChannelDefinition {
  id: NotificationChannelId
  name: string
  description: string
  importance: number // 1: min, 2: low, 3: default, 4: high, 5: max
  vibration: boolean
  visibility?: number // -1: secret, 0: private, 1: public
  lights?: boolean
  lightColor?: string
}

export const NOTIFICATION_CHANNELS: Record<
  NotificationChannelId,
  ChannelDefinition
> = {
  workout_v1: {
    id: 'workout_v1',
    name: 'تذكيرات التمرين',
    description: 'تنبيه بأيام التمرين المحددة في جدولك',
    importance: 3, // default
    vibration: true,
    visibility: 1,
    lights: true,
    lightColor: '#10B981',
  },
  timer_v1: {
    id: 'timer_v1',
    name: 'عدادات الراحة والكارديو',
    description: 'تنبيه انتهاء وقت الراحة بين المجموعات وهدف الكارديو',
    importance: 4, // high (heads-up / alert)
    vibration: true,
    visibility: 1,
    lights: true,
    lightColor: '#10B981',
  },
  backup_v1: {
    id: 'backup_v1',
    name: 'النسخ الاحتياطي',
    description: 'تنبيهات حالة النسخ الاحتياطي وحماية البيانات',
    importance: 2, // low
    vibration: false,
    visibility: 0,
  },
  nutrition_v1: {
    id: 'nutrition_v1',
    name: 'تذكير الوجبات',
    description: 'تنبيه يومي لتسجيل الوجبات والسعرات',
    importance: 3, // default
    vibration: true,
    visibility: 1,
    lights: true,
    lightColor: '#10B981',
  },
}

export const NOTIFICATION_COPY = {
  workout_day: {
    channelId: 'workout_v1' as const,
    title: 'تمرين اليوم جاهز',
    getBody: (dayName: string) => `معاد تمرين ${dayName} جهز في جدولك.`,
  },
  rest_end: {
    channelId: 'timer_v1' as const,
    title: 'خلّص وقت الراحة',
    body: 'يلا يا بطل، ارجع للمجموعة اللي عليها الدور!',
  },
  cardio_end: {
    channelId: 'timer_v1' as const,
    title: 'وصلت لهدف الكارديو',
    body: 'عاش! تميت مدة الكارديو المطلوبة بنجاح.',
  },
  backup_alert: {
    channelId: 'backup_v1' as const,
    title: 'تنبيه النسخ الاحتياطي',
    body: 'النسخة الاحتياطية متأخرة أو محتاجة مراجعة عشان بياناتك تفضل بأمان.',
  },
  nutrition_log: {
    channelId: 'nutrition_v1' as const,
    title: 'سجّل وجباتك',
    body: 'ما تنساش تسجّل أكلك وسعراتك النهاردة عشان متابعتك تكمل.',
  },
  test: {
    channelId: 'timer_v1' as const,
    title: 'تنبيه تجريبي من مجانص',
    body: 'التنبيهات شغالة عندك ومضبوطة تمام!',
  },
} as const

export const NOTIFICATION_CONFIG = {
  smallIcon: 'ic_stat_maganis',
  accentColor: '#10B981',
} as const
