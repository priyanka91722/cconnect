export interface Channel {
  id: string;
  name: string;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: number;
}
