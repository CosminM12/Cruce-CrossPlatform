export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
};

export enum CardSuit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

export enum CardRank {
  ACE = 'ace',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'jack',
  QUEEN = 'queen',
  KING = 'king',
}

export type Card = {
  id: string;
  suit: CardSuit;
  rank: CardRank;
};

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export type GameState = {
  status: GameStatus;
  players: Player[];
  currentPlayerId: string | null;
  deck: Card[];
  playedCards: Card[];
  winner: Player | null;
};

export type RootStackParamList = {
  Home: undefined;
  CreateRoom: undefined;
  JoinRoom: undefined;
  Game: { isHost: boolean; roomId?: string };
};