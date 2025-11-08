import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  InstaVuLogo,
  Search,
  Upload,
  Key,
  User,
  Logout,
  Settings,
  Menu,
  Close,
} from '../../assets/icons';
import FileUpload from '../storage/FileUpload';
import ApiDashboard from '../api/ApiDashboard';

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showApiDashboard, setShowApiDashboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Main Navbar - Premium Glass Effect */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-dark-700/50 shadow-lg">
        <div className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section - Mobile First */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Menu Button - Mobile Only */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-gold-500 to-blue-500 rounded-lg sm:rounded-xl shadow-glow-sm">
                <InstaVuLogo className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <span className="hidden sm:block text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                InstaVu
              </span>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:block ml-4 lg:ml-8">
              <div className="relative group">
                <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-48 lg:w-64 xl:w-80 pl-10 lg:pl-12 pr-4 py-2 lg:py-2.5 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg lg:rounded-xl text-sm lg:text-base focus:bg-white dark:focus:bg-dark-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Mobile First */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Upload Button - Responsive */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-blue-500 rounded-lg sm:rounded-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-blue-400 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 flex items-center gap-1.5 sm:gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline text-sm lg:text-base font-bold text-white">
                  Upload
                </span>
              </div>
            </button>

            {/* API Button */}
            <button
              onClick={() => setShowApiDashboard(true)}
              className="p-2 lg:p-2.5 hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 rounded-lg lg:rounded-xl transition-all group"
              title="API Management"
              aria-label="API Management"
            >
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg lg:rounded-xl transition-colors group"
                aria-label="Profile menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-gold-500 to-blue-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                  <span className="text-white font-bold text-sm sm:text-base lg:text-lg">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden xl:block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {profile?.username}
                </span>
              </button>

              {/* Dropdown Menu - Responsive */}
              {showProfileMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowProfileMenu(false)}
                  ></div>

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-dark-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 py-2 z-40 animate-scale-in">
                    {/* Profile Header */}
                    <div className="px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-glow-sm">
                          <span className="text-white font-bold text-lg">
                            {profile?.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {profile?.username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Navigate to settings
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors group"
                      >
                        <Settings className="w-5 h-5 group-hover:text-primary-600 transition" />
                        <span className="font-medium">Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleSignOut();
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center gap-3 text-error-600 dark:text-error-400 transition-colors group"
                      >
                        <Logout className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        {showMobileSearch && (
          <div className="md:hidden px-3 pb-3 animate-slide-down">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm focus:bg-white dark:focus:bg-dark-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all"
                autoFocus
              />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Close className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      {showUploadModal && <FileUpload onClose={() => setShowUploadModal(false)} />}
      {showApiDashboard && <ApiDashboard onClose={() => setShowApiDashboard(false)} />}
    </>
  );
}