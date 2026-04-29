import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useChannelStore } from '../store/useChannelStore';

export const ChannelDetailScreen: React.FC = () => {
  const route = useRoute();
  const { channelId } = route.params as { channelId: string };
  const { getChannels, addMessage } = useChannelStore();

  const channel = getChannels().find((c) => c.id === channelId);

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text>Channel not found</Text>
      </View>
    );
  }

  const handleAddDummyMessage = () => {
    const dummyMessages = [
      'Hello everyone!',
      'This is a test message.',
      'Welcome to the channel!',
      'How is everyone doing?',
      'Great work on the project!',
    ];
    const randomMessage = dummyMessages[Math.floor(Math.random() * dummyMessages.length)];
    addMessage(channelId, randomMessage);
  };

  const renderMessage = ({ item }: { item: { id: string; content: string; timestamp: number } }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{channel.name}</Text>
      
      <FlatList
        data={channel.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Add one below!</Text>}
        contentContainerStyle={styles.messagesContainer}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddDummyMessage}>
        <Text style={styles.addButtonText}>Add Dummy Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for button
  },
  messageContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
