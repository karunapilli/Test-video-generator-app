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
      description: "A list of scenes for the video.",
      items: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.NUMBER, description: "Scene number, starting from 1." },
          visualDescription: { type: Type.STRING, description: "A detailed description of the visuals for this scene. What should the viewer see?" },
          voiceover: { type: Type.STRING, description: "The exact voiceover script for this scene. This should be written in a natural, conversational style, as it will be spoken by an AI voice." }
        },
        required: ["scene", "visualDescription", "voiceover"]
      }
    }
  },
  required: ["title", "script"]
};

export const generateVideoScript = async (idea: VideoIdea): Promise<GeneratedScript> => {
  const prompt = `
    Based on the following YouTube video idea, generate a complete, detailed, scene-by-scene script.
    
    Title: "${idea.title}"
    Hook: "${idea.hook}"
    Target Audience: "${idea.targetAudience}"
    Initial Outline: ${idea.scriptOutline.join(', ')}

    Flesh this out into a full script. Make the voiceover engaging, conversational, and natural-sounding. The visual descriptions must be vivid and detailed. Ensure the script flows well and is designed for high audience retention. Return the original title in your response.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional screenwriter and YouTube scriptwriter. Your task is to turn a video concept into a production-ready script. Follow the JSON schema precisely.",
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
export const generateVideoFromScript = async (idea: VideoIdea, language: string): Promise<GenerateVideosOperation> => {
  const fullScript = idea.generatedScript?.script
    .map(scene => `
      ---
      **Scene:** ${scene.scene}
      **Visuals:** ${scene.visualDescription}
      **Voiceover:** "${scene.voiceover}"
      ---
    `).join('') || '';

  const prompt = `
    You are an advanced AI video producer. Your task is to create a complete, high-fidelity, animated video with synchronized audio based *exactly* on the script provided.

    **CRITICAL AUDIO REQUIREMENT:**
    The final output video file MUST contain a high-quality audio track. This audio track must be an AI-generated voiceover of the provided script's "voiceover" text. The voice should be clear, natural, and match the specified language and tone. A silent video or a video without the voiceover is considered a complete failure. This is not optional.

    **FIDELITY AND REALISM MANDATE:**
    - **Lip-Sync:** For any character that speaks, their lip movements MUST be perfectly synchronized with the voiceover audio.
    - **Expressions & Animation:** Characters must display realistic facial expressions and body language that match the dialogue and visual descriptions.
    - **Style Reference:** The animation quality, especially for talking characters, should aspire to the level of realism and expression seen in this reference: https://youtube.com/shorts/55WImnhCC0k?si=CAVmMNbq2SLG-TGV.

    **VIDEO SPECIFICATIONS:**
    - **Title:** "${idea.title}"
    - **Target Audience/Tone:** ${idea.targetAudience}
    - **Language for Voiceover:** ${language}
    - **Video Length:** The video must be long enough to cover the entire script at a natural speaking pace.

    **--- SCRIPT START ---**
    ${fullScript}
    **--- SCRIPT END ---**

    Produce a final MP4 video file that integrates all these elements: visuals, animation, and the mandatory audio voiceover.
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
    throw new Error("Failed to start the video generation process.");
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