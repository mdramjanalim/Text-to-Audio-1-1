
export interface AudioGenerationState {
  isLoading: boolean;
  error: string | null;
  audioUrl: string | null;
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Zephyr = 'Zephyr',
  Charon = 'Charon',
  Fenrir = 'Fenrir'
}

export interface VoiceOption {
  id: VoiceName;
  label: string;
  description: string;
}
