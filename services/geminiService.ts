// Fix: Import `GenerateVideosOperation` to correctly type video generation operations.
import { GoogleGenAI, Type, GenerateVideosOperation } from "@google/genai";
import type { GeminiResponse, VideoIdea, GeneratedScript } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const ideasResponseSchema = {
  type: Type.OBJECT,
  properties: {
    videoIdeas: {
      type: Type.ARRAY,
      description: "A list of 3 unique and compelling video ideas.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A catchy, SEO-friendly, and highly clickable video title (under 70 characters)."
          },
          hook: {
            type: Type.STRING,
            description: "A powerful opening sentence (the first 10-15 seconds) to grab the viewer's attention immediately and prevent them from skipping."
          },
          description: {
            type: Type.STRING,
            description: "A brief, engaging video description for YouTube, optimized with relevant keywords to improve search visibility."
          },
          scriptOutline: {
            type: Type.ARRAY,
            description: "A bulleted list of 5-7 key talking points or scenes for the video script, structured for maximum viewer retention.",
            items: { type: Type.STRING }
          },
          targetAudience: {
            type: Type.STRING,
            description: "A specific description of the ideal viewer for this video, including their interests and pain points."
          },
          thumbnailSuggestion: {
            type: Type.STRING,
            description: "A vivid, detailed description of a high-click-through-rate (CTR) thumbnail image. Focus on emotion, clarity, and visual intrigue."
          }
        },
        required: ["title", "hook", "description", "scriptOutline", "targetAudience", "thumbnailSuggestion"]
      }
    }
  },
  required: ["videoIdeas"]
};


export const generateYouTubeContent = async (topic: string): Promise<GeminiResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 viral YouTube video ideas for the topic: "${topic}"`,
      config: {
        systemInstruction: "You are 'Viral Views AI', a world-class YouTube content strategist and creative director. Your goal is to generate highly engaging, viral video ideas that can attract millions of subscribers. For any given topic, you must provide a comprehensive content plan. Be creative, specific, and focus on what makes content shareable and watchable. Adhere strictly to the provided JSON schema.",
        responseMimeType: "application/json",
        responseSchema: ideasResponseSchema,
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: GeminiResponse = JSON.parse(jsonText);
    return parsedData;

  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    throw new Error("Failed to fetch or parse content from the AI model.");
  }
};

const scriptSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The original video title." },
    script: {
      type: Type.ARRAY,
      description: "A list of scenes for the video. For this task, it must contain exactly one scene.",
      items: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.NUMBER, description: "Scene number, which should always be 1." },
          visualDescription: { type: Type.STRING, description: "A detailed description of the visuals for this single scene." },
          voiceover: { type: Type.STRING, description: "The exact, concise voiceover or dialogue for this scene." }
        },
        required: ["scene", "visualDescription", "voiceover"]
      }
    }
  },
  required: ["title", "script"]
};

export const generateVideoScript = async (idea: VideoIdea): Promise<GeneratedScript> => {
  const prompt = `
    Your task is to create a script for a single, concise, and engaging video clip, approximately 8-10 seconds long.
    The script must focus on a single situation or moment, not a full story.

    Based on the video idea:
    Title: "${idea.title}"
    Hook: "${idea.hook}"

    Generate a script that contains ONLY ONE SCENE. This scene should describe one of the following:
    1. A character delivering a single, impactful line of dialogue.
    2. A character performing a single, clear, and visually interesting action.
    3. A very short voiceover (1-2 sentences) explaining a single, focused visual.

    The goal is to create content that is focused and perfectly sized for an 8-10 second video.
    - **Visual Description:** Must be vivid and clear for an animator, describing only what happens in this single scene.
    - **Voiceover:** Must be extremely brief and directly related to the visual.

    Return the original title in your response, and ensure the 'script' array in the JSON contains exactly one scene object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional screenwriter specializing in creating ultra-short, viral video clips. Your task is to turn a video concept into a production-ready script for a single scene, lasting about 8-10 seconds. Follow the JSON schema precisely, ensuring the script array contains only one item.",
        responseMimeType: "application/json",
        responseSchema: scriptSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeneratedScript;
  } catch (error) {
    console.error("Error generating script from Gemini API:", error);
    throw new Error("Failed to generate the video script.");
  }
};

export const generateThumbnail = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Create a high-impact, high-click-through-rate YouTube thumbnail based on this description: "${prompt}". The thumbnail should be visually stunning, emotionally resonant, and have clear, bold elements. Avoid putting any text on the image itself. The aspect ratio must be 16:9.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating thumbnail from Gemini API:", error);
    throw new Error("Failed to generate the thumbnail image.");
  }
};

// Fix: The video generation API returns a specific `GenerateVideosOperation` type, not a generic `Operation`.
export const generateVideoFromScript = async (idea: VideoIdea, language: string, avatar: string): Promise<GenerateVideosOperation> => {
  const fullScript = idea.generatedScript?.script
    .map(scene => `
      ---
      **Scene:** ${scene.scene}
      **Visuals:** ${scene.visualDescription}
      **Voiceover:** "${scene.voiceover}"
      ---
    `).join('') || '';

  let avatarInstruction = '';
  switch (avatar) {
      case 'baby':
          avatarInstruction = `
      **Primary Character:** The narrator and on-screen character is an adorable, expressive, and hyper-realistic animated baby, modeled after a child with big, curious eyes and a happy smile.
      **Voice:** Use a cute, AI-generated baby-like voice that is still clear and easy to understand in the specified language. The voice must match the script's content and be perfectly lip-synced.
      **Animation:** The baby's animations should be lifelike and engaging, with natural expressions (giggles, wide eyes, etc.) and movements that fit the voiceover.
    `;
          break;
      case 'nova':
          avatarInstruction = `
      **Primary Character:** The narrator and on-screen character is 'Nova', a professional and trustworthy news anchor in her early 30s.
      **Appearance:** She should have a polished, professional look (e.g., a smart blazer), suitable for a major news network.
      **Voice:** Use a clear, articulate, and authoritative female voice in the specified language. The tone should be confident and engaging.
      **Animation:** Animations should be subtle and professional, with realistic facial expressions and hand gestures appropriate for a news broadcast.
    `;
          break;
      case 'zen':
          avatarInstruction = `
      **Primary Character:** The narrator and on-screen character is 'Zen', a friendly and calm cartoon guide.
      **Appearance:** A simple, 2D animated character with a warm and approachable design. Think modern educational cartoon style.
      **Voice:** Use a gentle, soothing, and friendly male or female voice in the specified language.
      **Animation:** Animation should be smooth and expressive in a 2D cartoon style, with clear gestures that help explain the concepts in the voiceover.
    `;
          break;
      case 'anya':
          avatarInstruction = `
      **Primary Character:** The narrator and on-screen character is 'Dr. Anya', a brilliant and approachable scientist in her 40s.
      **Appearance:** She should look like an expert in her field, perhaps in a lab coat or professional attire, with a realistic and detailed character model.
      **Voice:** Use an intelligent, clear, and enthusiastic female voice in the specified language, conveying expertise without being condescending.
      **Animation:** Animations should be realistic and expressive, showing passion for the subject. She should interact with virtual graphics or elements related to the script.
    `;
          break;
      default:
          avatarInstruction = `**Voice Only:** This video should primarily be a voiceover with animated visuals as described in the script. No specific on-screen narrator is required.`
  }

  const prompt = `
    **AI Director Final Execution Order**

    **1. PRIMARY OBJECTIVE: Full Audio & Lip-Sync**
       - **VOICEOVER:** Generate a complete, high-quality voiceover in **${language}**. The voice must match the **${avatar}** character profile.
       - **DIALOGUE:** The voiceover must narrate the *entire* script's "Voiceover" text, from the first scene to the last.
       - **LIP-SYNC:** The on-screen character's lip movements MUST be perfectly synchronized with the dialogue.
       - **FAILURE CONDITION:** A video that is silent, has missing audio, or poor lip-sync is an IMMEDIATE failure.

    **2. CHARACTER & AVATAR DIRECTIVE**
       ${avatarInstruction}

    **3. CINEMATIC & VISUALS DIRECTIVE**
       - **QUALITY:** Photorealistic, cinematic quality. Aim for the visual fidelity of an Unreal Engine 5 render.
       - **LIGHTING:** Use dramatic, cinematic lighting with soft shadows and ray-traced reflections.
       - **CAMERA:** Employ dynamic camera work (e.g., subtle pans, dolly shots, focus pulls) to create a professional feel.
       - **RESOLUTION:** 1080p (1920x1080), 16:9 aspect ratio.

    **4. DO NOT INCLUDE (Negative Prompt)**
       - Muted/silent output.
       - Robotic or unnatural character animation.
       - Static, boring camera shots.
       - Glitches, artifacts, or visual noise.
       - Truncated or incomplete videos that do not cover the full script.

    **5. SCRIPT FOR PRODUCTION (Scene by Scene)**
       **Title:** "${idea.title}"

       ${fullScript}
    **--- SCRIPT END ---**

    Execute this directive with precision. The final output must be a polished, professional video ready for publication that fully renders the entire script provided.
  `;

  try {
    const operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
      }
    });
    return operation;
  } catch (error) {
    console.error("Error initiating video generation:", error);
    if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message.toLowerCase();
        if (errorMessage.includes('quota') || errorMessage.includes('resource_exhausted') || errorMessage.includes('429')) {
            throw new Error("API Limit Reached: You've exceeded your current usage quota. Please check your plan and billing details.");
        }
    }
    throw new Error("Failed to start the video generation process. Please check the console for details.");
  }
};

// Fix: The get operation function takes and returns the specific `GenerateVideosOperation` type.
export const getVideosOperation = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    return await ai.operations.getVideosOperation({ operation });
};

export const fetchAndCreateVideoUrl = async (uri: string): Promise<string> => {
    try {
        const response = await fetch(`${uri}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Error fetching generated video:", error);
        throw new Error("Failed to download the generated video.");
    }
}