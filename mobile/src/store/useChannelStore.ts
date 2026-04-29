import { create } from 'zustand';
import { Channel, Message } from '../types';

interface ChannelState {
  channels: Channel[];
  createChannel: (name: string) => void;
  addMessage: (channelId: string, content: string) => void;
  getChannels: () => Channel[];
}

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: [],
  createChannel: (name: string) => {
    const id = Date.now().toString();
    const newChannel: Channel = {
      id,
      name,
      messages: [],
    };
    set((state) => ({
      channels: [...state.channels, newChannel],
    }));
  },
  addMessage: (channelId: string, content: string) => {
    const id = Date.now().toString();
    const timestamp = Date.now();
    const newMessage: Message = {
      id,
      content,
      timestamp,
    };
    set((state) => ({
      channels: state.channels.map((channel) =>
        channel.id === channelId
          ? { ...channel, messages: [...channel.messages, newMessage] }
          : channel
      ),
    }));
  },
  getChannels: () => get().channels,
}));
