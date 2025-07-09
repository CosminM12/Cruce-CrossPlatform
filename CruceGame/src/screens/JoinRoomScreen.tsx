import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type JoinRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>;
};

const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({ navigation }) => {
  const [serverIp, setServerIp] = useState('');
  const [playerName, setPlayerName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Room</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={playerName}
          onChangeText={setPlayerName}
          placeholder="Enter your name"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Server IP Address</Text>
        <TextInput
          style={styles.input}
          value={serverIp}
          onChangeText={setServerIp}
          placeholder="Enter host's IP address"
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.button, (!serverIp || !playerName) && styles.buttonDisabled]}
        disabled={!serverIp || !playerName}
        onPress={() => {
          // Will implement connection logic later
          alert('Connection feature not implemented yet');
        }}
      >
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JoinRoomScreen;