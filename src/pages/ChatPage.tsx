import React from 'react';
import { KrishiMitraModal } from '../components/chat/KrishiMitraModal';

export const ChatPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      <KrishiMitraModal isFullPage={true} />
    </div>
  );
};
