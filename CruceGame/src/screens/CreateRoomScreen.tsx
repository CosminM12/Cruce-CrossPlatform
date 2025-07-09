import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import TcpSocket from 'react-native-tcp-socket';
import { NetworkInfo } from 'react-native-network-info';

type CreateRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;
};

const PORT = 12346; // Changed from 12345 to avoid port conflict

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ navigation }) => {
  const [server, setServer] = useState<TcpSocket.Server | null>(null);
  const [ipAddress, setIpAddress] = useState<string>('Loading...');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [connectedClients, setConnectedClients] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Function to add log entries
  const addLog = (message: string) => {
    setLogs(prevLogs => [message, ...prevLogs]);
  };

  // Get the device's IP address
  useEffect(() => {
    NetworkInfo.getIPV4Address().then(ip => {
      if (ip) {
        setIpAddress(ip);
      } else {
        setIpAddress('IP not available');
        addLog('Failed to get IP address');
      }
    }).catch((error: unknown) => {
      console.error('Error getting IP address:', error);
      setIpAddress('Error getting IP');
      addLog(`Error getting IP: ${error instanceof Error ? error.message : String(error)}`);
    });
  }, []);

  // Start the TCP server
  const startServer = () => {
    try {
      const newServer = TcpSocket.createServer((socket) => {
        const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`[SERVER] New client connected: ${clientAddress}`);
        addLog(`New client connected: ${clientAddress}`);
        setConnectedClients(prev => [...prev, clientAddress]);

        // Set a timeout to detect dead connections
        socket.setTimeout(30000); // 30 seconds timeout
        
        // Handle data from client
        socket.on('data', (data) => {
          const message = data.toString();
          console.log(`[SERVER] Received from ${clientAddress}: ${message}`);
          addLog(`Received from ${clientAddress}: ${message}`);
          
          try {
            const parsedData = JSON.parse(message);
            
            // Handle different message types
            if (parsedData.type === 'JOIN') {
              const playerName = parsedData.name;
              console.log(`[SERVER] Player ${playerName} is trying to join from ${clientAddress}`);
              addLog(`Player ${playerName} is trying to join from ${clientAddress}`);
              
              // Send confirmation back to client
              const response = JSON.stringify({
                type: 'ROOM_JOINED',
                success: true,
                message: `Welcome ${playerName}!`,
                roomId: ipAddress, // Using IP as room ID for simplicity
              });
              
              socket.write(response);
              console.log(`[SERVER] Sent join confirmation to ${playerName}`);
              addLog(`Sent join confirmation to ${playerName}`);
              
              // Here you would add the player to your game state
            } else if (parsedData.type === 'DISCONNECT') {
              // Handle client disconnect message
              console.log(`[SERVER] Received disconnect message from ${clientAddress}: ${parsedData.message || 'No message'}`);
              addLog(`Client ${clientAddress} sent disconnect message`);
              
              // Send acknowledgment
              try {
                socket.write(JSON.stringify({
                  type: 'DISCONNECT_ACK',
                  message: 'Disconnect acknowledged'
                }));
              } catch (e) {
                // Ignore write errors during disconnect
              }
              
              // Close the socket gracefully
              socket.end();
            } else {
              // Handle other message types as needed
              console.log(`[SERVER] Unknown message type from ${clientAddress}: ${parsedData.type}`);
              socket.write(JSON.stringify({
                type: 'ERROR',
                message: 'Unknown message type'
              }));
            }
          } catch (error: unknown) {
            const errorMsg = `Error parsing message from ${clientAddress}: ${error instanceof Error ? error.message : String(error)}`;
            console.error(`[SERVER] ${errorMsg}`);
            addLog(errorMsg);
            socket.write(JSON.stringify({
              type: 'ERROR',
              message: 'Invalid JSON format'
            }));
          }
        });
        
        // Handle socket timeout
        socket.on('timeout', () => {
          console.log(`[SERVER] Client connection timed out: ${clientAddress}`);
          addLog(`Client connection timed out: ${clientAddress}`);
          socket.end();
        });

        // Handle client disconnection
        socket.on('close', () => {
          console.log(`[SERVER] Client disconnected: ${clientAddress}`);
          addLog(`Client disconnected: ${clientAddress}`);
          setConnectedClients(prev => prev.filter(client => client !== clientAddress));
        });

        // Handle errors
        socket.on('error', (error: unknown) => {
          const errorMsg = `Error with client ${clientAddress}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`[SERVER] ${errorMsg}`);
          addLog(errorMsg);
          
          // Clean up the connection on error
          try {
            socket.end();
          } catch (e) {
            // Ignore end errors
          }
          
          setConnectedClients(prev => prev.filter(client => client !== clientAddress));
        });
      });

      console.log(`[SERVER] Attempting to listen on port ${PORT} with host 0.0.0.0`);
      newServer.listen({ port: PORT, host: '0.0.0.0' }, () => {
        setIsListening(true);
        console.log(`[SERVER] Server listening on port ${PORT} with IP ${ipAddress}`);
        addLog(`Server listening on port ${PORT}`);
        addLog(`Server IP address: ${ipAddress}`);
        addLog(`Note: When using ADB reverse, clients should connect to 127.0.0.1`);
      });

      newServer.on('error', (error: unknown) => {
        const errorMsg = `Server error: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`[SERVER] ${errorMsg}`);
        addLog(errorMsg);
        setIsListening(false);
        setServer(null);
      });
      
      // Add a connection event listener
      newServer.on('connection', (socket) => {
        console.log(`[SERVER] Connection event from ${socket.remoteAddress}:${socket.remotePort}`);
        
        // Add additional error handler at connection level
        socket.on('error', (error) => {
          console.log(`[SERVER] Socket error at connection level: ${error.message}`);
          addLog(`Socket error: ${error.message}`);
        });
      });

      setServer(newServer);
    } catch (error: unknown) {
      console.error('Failed to start server:', error);
      addLog(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Stop the TCP server
  const stopServer = () => {
    if (server) {
      console.log(`[SERVER] Stopping server...`);
      addLog('Stopping server...');
      
      // Notify all connected clients that the server is shutting down
      // This would require tracking all client sockets, which we're not doing in this simple example
      // In a more complete implementation, you would store all client sockets and notify them here
      
      server.close(() => {
        console.log(`[SERVER] Server stopped`);
        addLog('Server stopped');
        setIsListening(false);
        setConnectedClients([]);
      });
      
      setServer(null);
    }
  };

  // Cleanup server when component unmounts
  useEffect(() => {
    return () => {
      if (server) {
        console.log(`[SERVER] Component unmounting, shutting down server`);
        addLog('Component unmounting, shutting down server');
        // Use the stopServer function to ensure proper cleanup
        stopServer();
      }
    };
  }, [server]);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Cruce Game Server</Text>
        
        <Text style={styles.subtitle}>
          {isListening ? 'Waiting for players...' : 'Server not started'}
        </Text>
        
        <Text style={styles.infoText}>
          Listening on: {ipAddress}:{PORT}
        </Text>
        
        <View style={styles.buttonContainer}>
          {!isListening ? (
            <Button title="Start Server" onPress={startServer} />
          ) : (
            <View style={styles.buttonRow}>
              <Button title="Stop Server" onPress={stopServer} color="#e74c3c" />
              <View style={styles.buttonSpacer} />
              <Button 
                title="Start Game" 
                onPress={() => navigation.navigate('Game', { isHost: true })} 
                color="#27ae60"
                disabled={connectedClients.length === 0}
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Connected Clients: {connectedClients.length}
        </Text>
        {connectedClients.map((client, index) => (
          <Text key={index} style={styles.clientText}>{client}</Text>
        ))}
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.sectionTitle}>Server Logs:</Text>
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3498db',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 8,
  },
  clientText: {
    fontSize: 14,
    color: '#27ae60',
    marginLeft: 8,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default CreateRoomScreen;