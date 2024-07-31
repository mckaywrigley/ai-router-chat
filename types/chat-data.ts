export interface StreamMessagePayload {
  model: string;
  messages: {
    role: string;
    content: string;
  }[];
  temperature: number;
}
