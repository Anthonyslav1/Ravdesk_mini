import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  const handleSocialClick = (platform) => {
    alert(`${platform} integration coming soon!`);
  };

  return (
    <footer className="bg-[#2A2A2A] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold text-[#00C4B4] mb-4">Ravdesk</h3>
          <p className="text-gray-300 mb-4">
            Redefining collaboration through blockchain technology and smart contracts.
          </p>
          <div className="flex space-x-4">
            <button onClick={() => handleSocialClick('Facebook')} className="text-gray-300 hover:text-[#00C4B4]">
              <Facebook size={20} />
            </button>
            <button onClick={() => handleSocialClick('Twitter')} className="text-gray-300 hover:text-[#00C4B4]">
              <Twitter size={20} />
            </button>
            <button onClick={() => handleSocialClick('LinkedIn')} className="text-gray-300 hover:text-[#00C4B4]">
              <Linkedin size={20} />
            </button>
            <button onClick={() => handleSocialClick('Instagram')} className="text-gray-300 hover:text-[#00C4B4]">
              <Instagram size={20} />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-gray-300 hover:text-[#00C4B4]">
                About Us
              </Link>
            </li>
            {/* <li>
              <Link to="/how-it-works" className="text-gray-300 hover:text-[#00C4B4]">
                How It Works
              </Link>
            </li> */}
            <li>
              <Link to="/freelancers" className="text-gray-300 hover:text-[#00C4B4]">
                For Freelancers
              </Link>
            </li>
            <li>
              <Link to="/business" className="text-gray-300 hover:text-[#00C4B4]">
                For Business
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service page coming soon!'); }} className="text-gray-300 hover:text-[#00C4B4]">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy page coming soon!'); }} className="text-gray-300 hover:text-[#00C4B4]">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/cookies" onClick={(e) => { e.preventDefault(); alert('Cookie Policy page coming soon!'); }} className="text-gray-300 hover:text-[#00C4B4]">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
          <p className="text-gray-300 mb-4">Stay updated with our latest features and releases.</p>
          <form className="space-y-2" onSubmit={handleNewsletterSubmit}>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-[#1A1A1A] text-white px-4 py-2 rounded-l-lg flex-1 focus:outline-none focus:ring-1 focus:ring-[#00C4B4]"
                required
              />
              <button
                type="submit"
                className="bg-[#00C4B4] px-4 py-2 rounded-r-lg hover:bg-[#00A89B] transition flex items-center"
              >
                <Mail size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#4A4A4A]">
        <p className="text-center text-gray-300">
          © {new Date().getFullYear()} Ravdesk. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;