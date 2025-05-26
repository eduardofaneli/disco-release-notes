export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface ConversionResult {
  messages: DiscordMessage[];
  metadata: {
    messageCount: number;
    totalCharacters: number;
    embedCount: number;
    fieldCount: number;
  };
}

export interface ServerConfig {
  discordToken?: string;
  defaultChannelId?: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
