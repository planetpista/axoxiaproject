import React, { useState } from 'react';
import { X, Home, Settings, Phone, LogIn } from 'lucide-react';
import AuthModal from './auth/AuthModal';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'home' | 'settings' | 'contact' | 'signin') => void;
  currentPage: string;
  translations: any;
  onAuthSuccess?: (user: any) => void;
}

const Menu: React.FC<MenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentPage,
  translations,
  onAuthSuccess
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', icon: Home, key: 'home' },
    { id: 'settings', icon: Settings, key: 'settings' },
    { id: 'contact', icon: Phone, key: 'contact' },
    { id: 'signin', icon: LogIn, key: 'signIn' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-purple-800">{translations.menu}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <nav className="p-6">
          <ul className="space-y-4">
            {menuItems.map(({ id, icon: Icon, key }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    if (id === 'signin') {
                      setShowAuthModal(true);
                    } else {
                      onNavigate(id as any);
                      onClose();
                    }
                  }}
