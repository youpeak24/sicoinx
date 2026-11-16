import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import { chatConfig } from './chatConfig';

/** Floating AI assistant, shared by the public site and the user dashboard (not mounted in /admin). */
export const ChatAssistant: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return <Chatbot config={chatConfig} page={pathname} onNavigate={(path) => navigate(path)} />;
};
