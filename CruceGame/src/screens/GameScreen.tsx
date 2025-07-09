import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, GameStatus, Player } from '../types';
import TcpSocket from 'react-native-tcp-socket';

type GameScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

const GameScreen: React.FC<GameScreenProps> = ({ navigation, route }) => {
  const { isHost, roomId } = route.params;
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.WAITING);
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Function to add log entries
  const addLog = (message: string) => {
    setLogs(prevLogs => [message, ...prevLogs]);
  };

  useEffect(() => {
    // Initialize game based on whether this is host or client
    if (isHost) {
      addLog('Game initialized as host');
      // The host already has the server running in CreateRoomScreen
      // We would just need to handle game state here
    } else {
      addLog(`Connected to room: ${roomId || 'Unknown'}`);
      // Client is already connected from JoinRoomScreen
      // We would just need to handle game state here
    }

    // Cleanup function
    return () => {
      // Any cleanup needed when leaving the game screen
    };
  }, [isHost, roomId]);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Cruce Game</Text>
        
        <Text style={styles.subtitle}>
          {isHost ? 'You are the host' : 'You joined as a player'}
        </Text>
        
        <Text style={styles.infoText}>
          Game Status: {gameStatus}
        </Text>
        
        <Text style={styles.sectionTitle}>
          Players: {players.length}
        </Text>
        {players.map((player, index) => (
          <Text key={index} style={styles.playerText}>
            {player.name} {player.isHost ? '(Host)' : ''} - Score: {player.score}
          </Text>
        ))}
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.sectionTitle}>Game Board</Text>
        <Text style={styles.infoText}>Game implementation coming soon...</Text>
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.sectionTitle}>Game Logs:</Text>
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
  gameArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 8,
  },
  playerText: {
    fontSize: 14,
    color: '#27ae60',
    marginLeft: 8,
    marginBottom: 4,
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

export default GameScreen;