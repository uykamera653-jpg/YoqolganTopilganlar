import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

interface ModerationRequest {
  type: 'image' | 'text';
  content: string; // For image: base64 or URL, for text: the actual text
  userId?: string;
}

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Moderate Content] Function started');

    const { type, content, userId }: ModerationRequest = await req.json();

    if (!type || !content) {
      return new Response(
        JSON.stringify({ error: 'Type and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let moderationResult: ModerationResult;

    if (type === 'image') {
      moderationResult = await moderateImage(content);
    } else {
      moderationResult = await moderateText(content);
    }

    console.log('[Moderate Content] Result:', moderationResult);

    // If content is unsafe, optionally delete it or notify admins
    if (!moderationResult.safe && userId) {
      console.log(`[Moderate Content] Unsafe content detected from user ${userId}`);
      // You can add logging to database here if needed
    }

    return new Response(
      JSON.stringify(moderationResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Moderate Content] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        safe: false,
        reason: 'Moderation failed - blocking for safety'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function moderateImage(imageContent: string): Promise<ModerationResult> {
  console.log('[Moderate Image] Analyzing image...');

  try {
    // Use OnSpace AI to analyze the image
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI. Analyze images and respond ONLY with JSON in this exact format:
{
  "safe": true/false,
  "reason": "brief reason if unsafe",
  "categories": {
    "sexual": true/false,
    "violence": true/false,
    "hate": true/false,
    "harassment": true/false
  }
}

Mark as unsafe (safe: false) if the image contains:
- Nudity, pornography, or sexually explicit content
- Violence, gore, or graphic content
- Hate symbols or harassment imagery
- Any inappropriate content for a general audience

Mark as safe (safe: true) only if the image is appropriate for all audiences.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for inappropriate content. Respond ONLY with the JSON format specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageContent.startsWith('data:') ? imageContent : `data:image/jpeg;base64,${imageContent}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content ?? '';

    console.log('[Moderate Image] AI Response:', aiResponse);

    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response not in expected JSON format');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      safe: result.safe === true,
      reason: result.reason,
      categories: result.categories
    };

  } catch (error) {
    console.error('[Moderate Image] Error:', error);
    // If moderation fails, block the content for safety
    return {
      safe: false,
      reason: 'Image moderation failed - blocking for safety',
      categories: {
        sexual: false,
        violence: false,
        hate: false,
        harassment: false,
        profanity: false
      }
    };
  }
}

async function moderateText(text: string): Promise<ModerationResult> {
  console.log('[Moderate Text] Analyzing text...');

  // Common profanity and inappropriate words in Uzbek, Russian, and English
  const profanityPatterns = [
    // Uzbek vulgar words
    /\b(jinni|ahmoq|tentak|jahannam|la'nat|axlat|harom|bema'ni|dangasa|yolg'onchi)\b/gi,
    // Russian vulgar words
    /\b(сука|блять|хуй|пизда|ебать|дерьмо|мудак|гандон|шлюха|пидор)\b/gi,
    // English vulgar words
    /\b(fuck|shit|bitch|ass|damn|hell|bastard|whore|cock|dick|pussy)\b/gi,
  ];

  const hasProfanity = profanityPatterns.some(pattern => pattern.test(text));

  if (hasProfanity) {
    return {
      safe: false,
      reason: 'Text contains inappropriate language',
      categories: {
        sexual: false,
        violence: false,
        hate: false,
        harassment: false,
        profanity: true
      }
    };
  }

  // Use AI for more sophisticated analysis
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a content moderation AI. Analyze text and respond ONLY with JSON in this exact format:
{
  "safe": true/false,
  "reason": "brief reason if unsafe",
  "categories": {
    "sexual": true/false,
    "violence": true/false,
    "hate": true/false,
    "harassment": true/false,
    "profanity": true/false
  }
}

Mark as unsafe (safe: false) if the text contains:
- Sexual or explicit language
- Threats or violent content
- Hate speech or discrimination
- Harassment or bullying
- Profanity or vulgar language in any language (Uzbek, Russian, English)

Mark as safe (safe: true) only if appropriate for all audiences.`
          },
          {
            role: 'user',
            content: `Analyze this text: "${text}"\n\nRespond ONLY with the JSON format specified.`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content ?? '';

    console.log('[Moderate Text] AI Response:', aiResponse);

    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response not in expected JSON format');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    return {
      safe: result.safe === true,
      reason: result.reason,
      categories: result.categories
    };

  } catch (error) {
    console.error('[Moderate Text] AI Error:', error);
    // If AI fails, use basic profanity detection result
    return {
      safe: !hasProfanity,
      reason: hasProfanity ? 'Text contains inappropriate language' : undefined,
      categories: {
        sexual: false,
        violence: false,
        hate: false,
        harassment: false,
        profanity: hasProfanity
      }
    };
  }
}
