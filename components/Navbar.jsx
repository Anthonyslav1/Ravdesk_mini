import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';
import Image from 'next/image';

function Navbar({ account }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileIcon, setProfileIcon] = useState(null);

  // Load profile icon from localStorage on mount
  useEffect(() => {
    const storedIcon = localStorage.getItem(`profileIcon_${account}`);
    if (storedIcon) {
      setProfileIcon(storedIcon);
    }
  }, [account]);

  // Handle profile icon upload
  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const iconData = reader.result;
        setProfileIcon(iconData);
        if (account) {
          localStorage.setItem(`profileIcon_${account}`, iconData); // Store in localStorage with account key
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <nav className="bg-[#1A1A1A] border-b border-[#4A4A4A] fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-[#00C4B4] text-2xl font-bold">Ravdesk</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/faqs" className="text-gray-300 hover:text-[#00C4B4] transition">
              FAQs
            </Link>
            <Link href="/freelancers" className="text-gray-300 hover:text-[#00C4B4] transition">
              Freelancers
            </Link>
            <Link href="/business" className="text-gray-300 hover:text-[#00C4B4] transition">
              Business
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-[#00C4B4] transition">
              Dashboard
            </Link>
            {account && (
              <div className="flex items-center space-x-2">
                {/* Profile Icon Display */}
                <div className="relative group">
                  {profileIcon ? (
                    <Image
                      src={profileIcon}
                      alt="Profile"
                      width={32}
                      height={32}
                      unoptimized
                      className="rounded-full object-cover cursor-pointer"
                      onClick={() => document.getElementById('profile-icon-upload').click()}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                      onClick={() => document.getElementById('profile-icon-upload').click()}
                    >
                      <User size={20} className="text-gray-300" />
                    </div>
                  )}
                  {/* Tooltip */}
                  {!profileIcon && (
                    <span className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to set your profile icon
                    </span>
                  )}
                  {/* Hidden File Input */}
                  <input
                    id="profile-icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                </div>
                {/* Removed account address display */}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1A1A1A] border-b border-[#4A4A4A]">
            <Link
              href="/faqs"
              className="block px-3 py-2 text-gray-300 hover:text-[#00C4B4] transition"
              onClick={() => setIsOpen(false)}
            >
              FAQs
            </Link>
            <Link
              href="/freelancers"
              className="block px-3 py-2 text-gray-300 hover:text-[#00C4B4] transition"
              onClick={() => setIsOpen(false)}
            >
              Freelancers
            </Link>
            <Link
              href="/business"
              className="block px-3 py-2 text-gray-300 hover:text-[#00C4B4] transition"
              onClick={() => setIsOpen(false)}
            >
              Business
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-gray-300 hover:text-[#00C4B4] transition"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            {account && (
              <div className="flex items-center space-x-2 px-3 py-2 group">
                {/* Profile Icon Display for Mobile */}
                <div className="relative">
                  {profileIcon ? (
                    <Image
                      src={profileIcon}
                      alt="Profile"
                      width={32}
                      height={32}
                      unoptimized
                      className="rounded-full object-cover cursor-pointer"
                      onClick={() => document.getElementById('profile-icon-upload-mobile').click()}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer"
                      onClick={() => document.getElementById('profile-icon-upload-mobile').click()}
                    >
                      <User size={20} className="text-gray-300" />
                    </div>
                  )}
                  {/* Tooltip for Mobile */}
                  {!profileIcon && (
                    <span className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to set your profile icon
                    </span>
                  )}
                  {/* Hidden File Input for Mobile */}
                  <input
                    id="profile-icon-upload-mobile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                </div>
                {/* Removed account address display */}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;