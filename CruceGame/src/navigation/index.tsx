import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import JoinRoomScreen from '../screens/JoinRoomScreen';
import GameScreen from '../screens/GameScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Cruce Game' }} 
        />
        <Stack.Screen 
          name="CreateRoom" 
          component={CreateRoomScreen} 
          options={{ title: 'Create Room' }} 
        />
        <Stack.Screen 
          name="JoinRoom" 
          component={JoinRoomScreen} 
          options={{ title: 'Join Room' }} 
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ title: 'Cruce Game', headerBackVisible: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;