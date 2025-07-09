import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type CreateRoomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;
};

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Server not started</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#e74c3c',
  },
});

export default CreateRoomScreen;