import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  onPress: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{channel.name}</Text>
      <Text style={styles.messageCount}>
        {channel.messages.length} message{channel.messages.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
