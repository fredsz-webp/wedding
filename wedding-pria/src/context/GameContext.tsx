import React, { createContext, useContext, useState, ReactNode } from 'react';

type GameContextType = {
  showGame: boolean;
  setShowGame: React.Dispatch<React.SetStateAction<boolean>>;
  showGuide: boolean;
  setShowGuide: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [showGame, setShowGame] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <GameContext.Provider value={{ showGame, setShowGame, showGuide, setShowGuide }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
