import React, { useState } from 'react';
import { X, Home, Settings, Phone, LogIn, BarChart3 } from 'lucide-react';
import AuthModal from './auth/AuthModal';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'home' | 'settings' | 'contact' | 'signin') => void;
  currentPage: string;
  translations: any;
  onAuthSuccess?: (user: any) => void;
  isLoggedIn?: boolean;
  userRole?: string;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate, currentPage, translations, onAuthSuccess, isLoggedIn, userRole }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

  let menuItems = [
    { id: 'home', icon: Home, key: 'home' },
    { id: 'settings', icon: Settings, key: 'settings' },
    { id: 'contact', icon: Phone, key: 'contact' },
    { id: 'signin', icon: LogIn, key: 'signIn' },
  ];

  // Add dashboard option for logged-in users
  if (isLoggedIn) {
    menuItems = [
      { id: 'home', icon: Home, key: 'home' },
      { id: 'dashboard', icon: BarChart3, key: 'dashboard' },
      { id: 'settings', icon: Settings, key: 'settings' },
      { id: 'contact', icon: Phone, key: 'contact' },
    ];
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-purple-800">Menu</h2>
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
                    if (id === 'signin' && !isLoggedIn) {
                      setShowAuthModal(true);
                    } else {
                      onNavigate(id as any);
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                    currentPage === id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">
                    {key === 'dashboard' ? 'Dashboard' : translations[key]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            if (onAuthSuccess) {
              onAuthSuccess(user);
            }
            setShowAuthModal(false);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default Menu;