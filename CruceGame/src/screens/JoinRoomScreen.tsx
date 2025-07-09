import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type JoinRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>;
};

const PORT = 12346; // Changed from 12345 to match server port

const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({ navigation }) => {
  const [serverIp, setServerIp] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Use useRef to maintain the TCP client connection
  const clientRef = useRef<TcpSocket.Socket | null>(null);
  
  // Function to add log entries
  const addLog = (message: string) => {
    setLogs(prevLogs => [message, ...prevLogs]);
  };
  
  // Connect to server
  const connectToServer = () => {
    if (!serverIp.trim()) {
      Alert.alert('Error', 'Please enter the server IP address');
      return;
    }
    
    // Disconnect any existing connection first
    if (clientRef.current) {
      disconnectFromServer();
    }
    
    try {
      // If the user enters 'localhost' or '127.0.0.1', we're likely using ADB reverse
      const effectiveIp = serverIp.trim();
      addLog(`Attempting to connect to ${effectiveIp}:${PORT}...`);
      
      console.log(`[CLIENT] Creating TCP connection to ${effectiveIp}:${PORT}`);
      const newClient = TcpSocket.createConnection({
        host: effectiveIp,
        port: PORT,
        // timeout: 5000 // 5 second timeout on the socket itself
      }, () => {
        console.log(`[CLIENT] Connection callback fired for ${effectiveIp}:${PORT}`);
        addLog(`TCP connection established to ${effectiveIp}:${PORT}`);
        console.log(`[CLIENT] TCP connection established to ${effectiveIp}:${PORT}`);
        
        // Don't set isConnected until we get a response from the server
        // This helps prevent false positives where TCP connects but server isn't responding
        
        // Send player info to server
        const playerInfo = JSON.stringify({
          type: 'JOIN',
          name: 'Player', // Using a generic name as per requirements
        });
        newClient.write(playerInfo);
        addLog(`Sent player info: ${playerInfo}`);
        console.log(`[CLIENT] Sent player info: ${playerInfo}`);
      });
      
      // Handle data from server
      newClient.on('data', (data) => {
        const message = data.toString();
        console.log(`[CLIENT] Received from server: ${message}`);
        addLog(`Received from server: ${message}`);
        
        try {
          const parsedData = JSON.parse(message);
          
          // Now that we've received a response, we can consider ourselves connected
          if (!isConnected) {
            setIsConnected(true);
            addLog(`Verified connection to ${serverIp}:${PORT}`);
            Alert.alert('Success', 'Connected to server');
          }
          
          // Handle different message types from server
          if (parsedData.type === 'ROOM_JOINED') {
            addLog(`Successfully joined room, navigating to game screen`);
            console.log(`[CLIENT] Successfully joined room, navigating to game screen`);
            // Navigate to game screen (since there's no LobbyScreen in the navigation)
            // Use the original serverIp for the roomId to maintain consistency
            navigation.navigate('Game', { isHost: false, roomId: serverIp });
          } else if (parsedData.type === 'ERROR') {
            addLog(`Server error: ${parsedData.message}`);
            console.log(`[CLIENT] Server error: ${parsedData.message}`);
            Alert.alert('Server Error', parsedData.message);
          }
        } catch (error: unknown) {
          const errorMsg = `Error parsing server message: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`[CLIENT] ${errorMsg}`);
          addLog(errorMsg);
        }
      });
      
      // Handle connection close
      newClient.on('close', (hadError) => {
        console.log(`[CLIENT] Connection closed. Had error: ${hadError}`);
        setIsConnected(false);
        addLog(`Disconnected from server. Had error: ${hadError}`);
        clientRef.current = null;
      });
      
      // Handle socket timeout
      newClient.on('timeout', () => {
        console.log(`[CLIENT] Socket timeout occurred`);
        addLog(`Socket timeout occurred`);
        Alert.alert('Connection Error', 'Socket timeout occurred');
        setIsConnected(false);
        
        // Clean up the socket on timeout
        try {
          newClient.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        clientRef.current = null;
      });
      
      // Handle errors
      newClient.on('error', (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`[CLIENT] Connection error: ${errorMessage}`);
        addLog(`Connection error: ${errorMessage}`);
        Alert.alert('Connection Error', errorMessage);
        setIsConnected(false);
        
        // Clean up the socket on error
        if (clientRef.current) {
          try {
            clientRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
          clientRef.current = null;
        }
      });
      
      // Add a timeout handler to detect if the server doesn't respond
      setTimeout(() => {
        // If we're still not connected after the timeout and no error occurred
        if (clientRef.current === newClient && !isConnected) {
          addLog('Connection attempt timed out');
          Alert.alert('Connection Error', 'Failed to connect to server: timeout');
          
          try {
            newClient.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
          
          clientRef.current = null;
        }
      }, 6000); // Slightly longer than the socket timeout
      
      clientRef.current = newClient;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Failed to connect: ${errorMessage}`);
      Alert.alert('Connection Error', errorMessage);
    }
  };
  
  // Disconnect from server
  const disconnectFromServer = () => {
    if (clientRef.current) {
      try {
        console.log(`[CLIENT] Disconnecting from server ${serverIp}:${PORT}`);
        addLog(`Disconnecting from server ${serverIp}:${PORT}`);
        
        // Send a disconnect message to the server if we're connected
        if (isConnected) {
          try {
            const disconnectMsg = JSON.stringify({
              type: 'DISCONNECT',
              message: 'Client disconnecting'
            });
            clientRef.current.write(disconnectMsg);
          } catch (e) {
            // Ignore write errors during disconnect
          }
        }
        
        clientRef.current.destroy();
        setIsConnected(false);
        addLog('Disconnected from server');
        console.log(`[CLIENT] Disconnected from server`);
      } catch (error: unknown) {
        const errorMsg = `Error during disconnect: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`[CLIENT] ${errorMsg}`);
        addLog(errorMsg);
      } finally {
        clientRef.current = null;
      }
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log(`[CLIENT] Component unmounting, cleaning up connection`);
      // Use the disconnectFromServer function to ensure proper cleanup
      disconnectFromServer();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Room</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Server IP Address</Text>
        <TextInput
          style={styles.input}
          value={serverIp}
          onChangeText={setServerIp}
          placeholder="Enter server IP address (use 127.0.0.1 for ADB reverse)"
          keyboardType="numeric"
        />
        <TouchableOpacity 
          style={styles.helperButton}
          onPress={() => setServerIp('127.0.0.1')}
        >
          <Text style={styles.helperButtonText}>Use localhost (ADB reverse)</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, (!serverIp || isConnected) && styles.buttonDisabled]}
        disabled={!serverIp || isConnected}
        onPress={connectToServer}
      >
        <Text style={styles.buttonText}>{isConnected ? 'Connected' : 'Connect'}</Text>
      </TouchableOpacity>
      
      {isConnected && (
        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]}
          onPress={disconnectFromServer}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.logContainer}>
        <Text style={styles.sectionTitle}>Connection Logs:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
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
  disconnectButton: {
    backgroundColor: '#e74c3c',
    marginTop: 10,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  helperButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  helperButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default JoinRoomScreen;