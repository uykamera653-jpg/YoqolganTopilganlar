import { getSupabaseClient } from '@/template';

interface ModerationResult {
  safe: boolean;
  reason?: string;
  categories?: {
    sexual: boolean;
    violence: boolean;
    hate: boolean;
    harassment: boolean;
    profanity: boolean;
  };
}

/**
 * Moderate image content using AI
 * @param imageBase64 - Base64 encoded image or data URL
 * @returns ModerationResult indicating if content is safe
 */
export async function moderateImage(imageBase64: string): Promise<ModerationResult> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: {
        type: 'image',
        content: imageBase64,
      },
    });

    if (error) {
      console.error('[Moderation] Error:', error);
      // If moderation fails, block for safety
      return {
        safe: false,
        reason: 'Moderation service error - blocked for safety',
      };
    }

    return data as ModerationResult;
  } catch (error) {
    console.error('[Moderation] Exception:', error);
    // If moderation fails, block for safety
    return {
      safe: false,
      reason: 'Moderation service error - blocked for safety',
    };
  }
}

/**
 * Moderate text content using AI
 * @param text - Text to moderate
 * @returns ModerationResult indicating if content is safe
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: {
        type: 'text',
        content: text,
      },
    });

    if (error) {
      console.error('[Moderation] Error:', error);
      // If moderation fails, allow text (less critical than images)
      return {
        safe: true,
      };
    }

    return data as ModerationResult;
  } catch (error) {
    console.error('[Moderation] Exception:', error);
    // If moderation fails, allow text (less critical than images)
    return {
      safe: true,
    };
  }
}

/**
 * Check if text contains profanity (client-side quick check)
 * @param text - Text to check
 * @returns true if profanity detected
 */
export function containsProfanity(text: string): boolean {
  const profanityPatterns = [
    // Uzbek vulgar words
    /\b(jinni|ahmoq|tentak|jahannam|la'nat|axlat|harom|bema'ni|dangasa|yolg'onchi)\b/gi,
    // Russian vulgar words
    /\b(сука|блять|хуй|пизда|ебать|дерьмо|мудак|гандон|шлюха|пидор)\b/gi,
    // English vulgar words
    /\b(fuck|shit|bitch|ass|damn|hell|bastard|whore|cock|dick|pussy)\b/gi,
  ];

  return profanityPatterns.some(pattern => pattern.test(text));
}
