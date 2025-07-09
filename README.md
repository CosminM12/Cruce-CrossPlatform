# Cruce Card Game - Cross-Platform Mobile App

## Overview

This is a React Native implementation of the traditional Romanian card game "Cruce" that can be played offline in a local Wi-Fi network. The game allows multiple players to connect via TCP sockets, even in airplane mode (with Wi-Fi manually enabled).

## Features

- **Offline Multiplayer**: Play with friends on the same Wi-Fi network without internet
- **Cross-Platform**: Works on both Android and iOS
- **TCP Socket Communication**: One device acts as host, others connect as clients
- **Simple UI**: Easy to navigate game interface

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or newer)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cruce-game.git
   cd cruce-game
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install iOS dependencies (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### Android

```bash
npx react-native run-android
```

### iOS (macOS only)

```bash
npx react-native run-ios
```

## How to Play

1. **Create a Room**:
   - One player creates a room and becomes the host
   - The app will display the host's IP address

2. **Join a Room**:
   - Other players enter the host's IP address to join
   - All players must be on the same Wi-Fi network

3. **Start the Game**:
   - Once all players have joined, the host can start the game
   - The game follows traditional Cruce rules

## Game Rules

Cruce is a traditional Romanian card game played with a standard deck of cards. The basic rules are:

- Each player receives 4 cards
- Players take turns playing cards or saying "Pass"
- Players can say "Cruce" (Cross) when they have a specific combination
- The goal is to collect as many points as possible

## Technical Details

- Built with React Native and TypeScript
- Uses react-native-tcp-socket for TCP communication
- Implements a custom JSON protocol for game state synchronization
- Works in airplane mode with Wi-Fi manually enabled

## Troubleshooting

- **Connection Issues**: Ensure all devices are on the same Wi-Fi network
- **IP Address Not Found**: Try restarting the Wi-Fi on the host device
- **Game Crashes**: Check the logs for error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.