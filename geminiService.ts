
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

export const generateBanglaSpeech = async (text: string, voice: VoiceName = VoiceName.Kore): Promise<string> => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) throw new Error("API Key is not configured correctly.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Specific instructions to guide the model towards natural, non-robotic Bengali
  const prompt = `
    Role: Professional Voiceover artist from Bangladesh.
    Language: Bengali (বাংলা).
    Instruction: Read the following text with human-like emotions, appropriate pauses, and standard 'Shuddho' pronunciation. 
    Tone: Natural, empathetic, and clear. Avoid robotic artifacts or monotonous speed.
    Text: ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("Could not retrieve audio data from the server.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Generation Error:", error);
    throw new Error(error.message || "ভয়েস জেনারেট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
};
