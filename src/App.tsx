import React, { useState } from 'react';
import { Package2, Truck, Shield } from 'lucide-react';
import LanguageToggle from './components/LanguageToggle';
import MenuButton from './components/MenuButton';
import Menu from './components/Menu';
import SettingsPage from './components/SettingsPage';
import ContactPage from './components/ContactPage';
import PayPalButton from './components/PayPalButton';
import AdminDashboard from './components/admin/AdminDashboard';
import FormSection from './components/FormSection';
import CategorySelector from './components/CategorySelector';
import PersonInfoForm from './components/PersonInfoForm';
import CostSummary from './components/CostSummary';
import { ShippingData, Currency } from './types';
import { translations } from './utils/translations';
import { currencies } from './utils/currencies';
import { useShippingCalculator } from './hooks/useShippingCalculator';
import { sendShippingConfirmation } from './services/emailService';

function App() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [currentPage, setCurrentPage] = useState<'home' | 'settings' | 'contact' | 'admin'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies[0]); // Default to EUR
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [userRole, setUserRole] = useState<'admin' | 'courier' | 'client'>('client');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shippingData, setShippingData] = useState<ShippingData>({
    category: '',
    details: '',
    country: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    sender: {
      address: '',
      firstName: '',
      lastName: '',
      contact: '',
      email: '',
      country: ''
    },
    recipient: {
      address: '',
      firstName: '',
      lastName: '',
      contact: '',
      email: '',
      country: ''
    },
    insurance: false,
    message: ''
  });

  const costs = useShippingCalculator(shippingData, currentCurrency);

  const t = (key: string) => translations[key]?.[language] || key;

  const updateShippingData = (updates: Partial<ShippingData>) => {
    setShippingData(prev => ({ ...prev, ...updates }));
  };

  const handlePaymentSuccess = async (details: any) => {
    setPaymentStatus('success');
    
    // Send confirmation email
    try {
      await sendShippingConfirmation(shippingData, costs.total, currentCurrency, details);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
    
    setTimeout(() => {
      setShowPayment(false);
      setPaymentStatus('idle');
      // Reset form or redirect as needed
    }, 3000);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    setPaymentStatus('error');
    setTimeout(() => setPaymentStatus('idle'), 3000);
  };

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };
  const countries = ['Benin', 'China', 'France'];

  // Admin login simulation
  const handleAdminLogin = () => {
    setUserRole('admin');
    setIsLoggedIn(true);
    setCurrentPage('admin');
  };

  const handleLogout = () => {
    setUserRole('client');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    
    // Set user role based on profile
    if (user.profile) {
      setUserRole(user.profile.role);
      
      // Navigate to admin if admin user
      if (user.profile.role === 'admin') {
        setCurrentPage('admin');
      }
    }
  };

  // Render different pages based on current page
  if (currentPage === 'admin') {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        userRole={userRole}
      />
    );
  }

  if (currentPage === 'settings') {
    return (
      <SettingsPage
        onBack={() => setCurrentPage('home')}
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
        translations={{
          settings: t('settings'),
          currency: t('currency'),
          selectCurrency: t('selectCurrency')
        }}
      />
    );
  }

  if (currentPage === 'contact') {
    return (
      <ContactPage
        onBack={() => setCurrentPage('home')}
        translations={{
          contactUs: t('contactUs'),
          emailAddress: t('emailAddress'),
          phoneNumber: t('phoneNumber'),
          easySimpleFast: t('easySimpleFast')
        }}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        onAuthSuccess={handleAuthSuccess}
        translations={{
          home: t('home'),
          settings: t('settings'),
          contact: t('contact'),
          signIn: 'Sign in / up'
        }}
      />

      {/* Top Navigation */}
      <div className="flex justify-between items-center p-6">
        <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
        
        <div className="flex flex-col items-center">
          <Package2 size={32} className="text-purple-600 mb-2" />
          <h1 className="text-2xl font-bold text-purple-800">Axoxia</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <MenuButton 
            onClick={() => setIsMenuOpen(true)}
            translations={{ menu: t('menu') }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center py-8 mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {t('easySimpleFast')}
        </h2>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <form className="space-y-8" onSubmit={handleShipSubmit}>
          {/* Category Selection */}
          <FormSection title={t('category')}>
            <CategorySelector
              value={shippingData.category}
              onChange={(category) => updateShippingData({ category })}
              translations={{
                mail: t('mail'),
                parcel: t('parcel'),
                container: t('container')
              }}
            />
          </FormSection>

          {/* Details */}
          <FormSection title={t('details')}>
            <textarea
              value={shippingData.details}
              onChange={(e) => updateShippingData({ details: e.target.value })}
              placeholder={t('detailsPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
            />
          </FormSection>

          {/* Country and Weight/Dimensions */}
          <FormSection title={t('weight')}>
              <input
                type="number"
                value={shippingData.weight || ''}
                onChange={(e) => updateShippingData({ weight: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
              />
          </FormSection>

          {/* Dimensions */}
          <FormSection title={t('dimensions')}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('length')}
                </label>
                <input
                  type="number"
                  value={shippingData.dimensions.length || ''}
                  onChange={(e) => updateShippingData({
                    dimensions: { ...shippingData.dimensions, length: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('width')}
                </label>
                <input
                  type="number"
                  value={shippingData.dimensions.width || ''}
                  onChange={(e) => updateShippingData({
                    dimensions: { ...shippingData.dimensions, width: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('height')}
                </label>
                <input
                  type="number"
                  value={shippingData.dimensions.height || ''}
                  onChange={(e) => updateShippingData({
                    dimensions: { ...shippingData.dimensions, height: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>
          </FormSection>

          {/* Sender Information */}
          <FormSection title={t('sender')}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('country')}
              </label>
              <select
                value={shippingData.sender.country || ''}
                onChange={(e) => updateShippingData({ 
                  sender: { ...shippingData.sender, country: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">{t('selectCountry')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <PersonInfoForm
              data={shippingData.sender}
              onChange={(sender) => updateShippingData({ sender })}
              translations={{
                address: t('address'),
                firstName: t('firstName'),
                lastName: t('lastName'),
                contactLabel: t('contactLabel'),
                email: t('email'),
                addressPlaceholder: t('addressPlaceholder'),
                firstNamePlaceholder: t('firstNamePlaceholder'),
                lastNamePlaceholder: t('lastNamePlaceholder'),
                contactPlaceholder: t('contactPlaceholder'),
                emailPlaceholder: t('emailPlaceholder')
              }}
            />
          </FormSection>

          {/* Recipient Information */}
          <FormSection title={t('recipient')}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('country')}
              </label>
              <select
                value={shippingData.recipient.country || ''}
                onChange={(e) => updateShippingData({ 
                  recipient: { ...shippingData.recipient, country: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">{t('selectCountry')}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <PersonInfoForm
              data={shippingData.recipient}
              onChange={(recipient) => updateShippingData({ recipient })}
              translations={{
                address: t('address'),
                firstName: t('firstName'),
                lastName: t('lastName'),
                contactLabel: t('contactLabel'),
                email: t('email'),
                addressPlaceholder: t('addressPlaceholder'),
                firstNamePlaceholder: t('firstNamePlaceholder'),
                lastNamePlaceholder: t('lastNamePlaceholder'),
                contactPlaceholder: t('contactPlaceholder'),
                emailPlaceholder: t('emailPlaceholder')
              }}
            />
          </FormSection>

          {/* Insurance and Message */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormSection title={t('insurance')}>
              <p className="text-sm text-gray-600 mb-4">{t('insuranceDescription')}</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="insurance"
                    checked={shippingData.insurance === true}
                    onChange={() => updateShippingData({ insurance: true })}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{t('yes')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="insurance"
                    checked={shippingData.insurance === false}
                    onChange={() => updateShippingData({ insurance: false })}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{t('no')}</span>
                </label>
              </div>
            </FormSection>

            <FormSection title={t('message')}>
              <textarea
                value={shippingData.message}
                onChange={(e) => updateShippingData({ message: e.target.value })}
                placeholder={t('messagePlaceholder')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
              />
            </FormSection>
          </div>

          {/* Cost Summary */}
          <CostSummary
            shipping={costs.shipping}
            insurance={costs.insurance}
            total={costs.total}
            currency={currentCurrency}
            translations={{
              totalCost: t('totalCost'),
              shipping: t('shipping'),
              insuranceFee: t('insuranceFee')
            }}
          />

          {/* Payment Section */}
          {!showPayment ? (
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={costs.total === 0}
                className="flex items-center gap-3 px-12 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Truck size={24} />
                {t('ship')}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('payNow')}
              </h3>
              
              {paymentStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">{t('paymentSuccess')}</p>
                </div>
              )}
              
              {paymentStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">{t('paymentError')}</p>
                </div>
              )}
              
              <PayPalButton
                amount={costs.total}
                currency={currentCurrency}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={paymentStatus === 'processing'}
              />
              
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="mt-4 w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;