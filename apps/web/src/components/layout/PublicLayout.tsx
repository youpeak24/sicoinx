import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBanner } from '../common/AnnouncementBanner';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { PageTransition } from '../common/animations/PageTransition';
import { BottomNav } from './BottomNav';
import { ChatAssistant } from '../chatbot/ChatAssistant';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFF] text-[#10213A] selection:bg-[#175CFF]/15 selection:text-[#123B9A]">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 pb-24 sm:pb-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <BottomNav />
      <ChatAssistant />
    </div>
  );
};
