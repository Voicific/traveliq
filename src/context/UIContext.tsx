import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UIContextType {
  isContactModalOpen: boolean;
  openContactModal: () => void;
  closeContactModal: () => void;
  isVeeChatOpen: boolean;
  openVeeChat: () => void;
  closeVeeChat: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isVeeChatOpen, setIsVeeChatOpen] = useState(false);

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  const openVeeChat = () => setIsVeeChatOpen(true);
  const closeVeeChat = () => setIsVeeChatOpen(false);

  return (
    <UIContext.Provider value={{ 
      isContactModalOpen, openContactModal, closeContactModal,
      isVeeChatOpen, openVeeChat, closeVeeChat
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
