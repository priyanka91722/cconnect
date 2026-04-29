import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChannelStore } from '../store/useChannelStore';

export const ChannelListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createChannel, getChannels } = useChannelStore();
  const [newChannelName, setNewChannelName] = useState('');

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      createChannel(newChannelName.trim());
      setNewChannelName('');
    } else {
      Alert.alert('Error', 'Please enter a channel name');
    }
  };

  const handleChannelPress = (channelId: string) => {
    navigation.navigate('ChannelDetail' as never, { channelId } as never);
  };

  const renderChannel = ({ item }: { item: { id: string; name: string; messages: any[] } }) => (
    <TouchableOpacity style={styles.channelItem} onPress={() => handleChannelPress(item.id)}>
      <Text style={styles.channelName}>{item.name}</Text>
      <Text style={styles.messageCount}>{item.messages.length} messages</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Channels</Text>
      
      <View style={styles.createContainer}>
        <TextInput
          style={styles.input}
          placeholder="New channel name"
          value={newChannelName}
          onChangeText={setNewChannelName}
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreateChannel}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getChannels()}
        keyExtractor={(item) => item.id}
        renderItem={renderChannel}
        ListEmptyComponent={<Text style={styles.emptyText}>No channels yet. Create one above!</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  createContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    backgroundColor: 'white',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  channelItem: {
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
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});
