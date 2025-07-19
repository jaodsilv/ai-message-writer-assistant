export interface SavedMessage {
  id: number;
  title: string;
  content: string;
  messageContent: string;
  timingRecommendation: string;
  hasTimingRecommendation: boolean;
  tones: string[];
  platform: string;
  customPlatform: string;
  isPublic: boolean;
  messageMode: string;
  messageDateTime: string;
  fromField: string;
  toField: string;
  toTitle: string;
  company: string;
  channel: string;
  originalThoughts: string;
  context: string;
  savedAt: string;
  savedAtFormatted: string;
}

export interface ManualEntry {
  title: string;
  content: string;
  from: string;
  to: string;
  toTitle: string;
  company: string;
  dateTime: string;
  channel: string;
}

export interface Signatures {
  email: string;
  linkedin: string;
  support: string;
  custom: string;
}

export interface SectionsCollapsed {
  thoughts: boolean;
  tones: boolean;
  platform: boolean;
  visibility: boolean;
  mode: boolean;
  datetime: boolean;
  recipient: boolean;
  context: boolean;
  signatures: boolean;
}

export interface Tone {
  value: string;
  label: string;
  description: string;
}

export interface Platform {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface MessageMode {
  value: string;
  label: string;
  description: string;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Note: Removed window.claude interface as we now use server-side API integration 