import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

function Landing({ account, setAccount, onLoginSuccess }) { // Added setAccount for direct state update
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Added for navigation

  const handleGoogleSignIn = async (credentialResponse) => {
    setIsConnecting(true);
    setError('');
    try {
      setAccount(credentialResponse.credential); // Directly set account
      onLoginSuccess(); // Ensure this triggers in App.jsx
      navigate('/home'); // Explicit navigation
    } catch (error) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAppleSignIn = () => {
    setError('');
    alert('Apple Sign-In coming soon!');
    // In production, implement Apple login
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsConnecting(true);
    setError('');
    try {
      const endpoint = isSignup ? 'signup' : 'login';
      const response = await axios.post(`/api/ravdesk-server/api/auth/${endpoint}`, { email, password });
      setAccount(response.data.account); // Directly set account
      onLoginSuccess(); // Trigger in App.jsx
      navigate('/home'); // Explicit navigation
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.response?.data?.error || `${isSignup ? 'Signup' : 'Sign-in'} failed. Please try again.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Navbar account={account} />

      <div className="flex-grow flex flex-col items-center justify-center px-4 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg w-full"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-[#00C4B4]">Ravdesk</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            {isSignup
              ? 'Join a secure freelance platform powered by blockchain. No wallet needed yet!'
              : 'Sign in to collaborate with top talent and businesses worldwide.'}
          </p>

          {!account && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#2A2A2A] p-6 rounded-lg shadow-lg max-w-sm mx-auto w-full space-y-6"
            >
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-2 bg-[#3A3A3A] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                    required
                    disabled={isConnecting}
                  />
                </div>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2 bg-[#3A3A3A] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                    required
                    disabled={isConnecting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    disabled={isConnecting}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm text-left">{error}</p>}
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full bg-[#00C4B4] text-white py-3 rounded-lg font-semibold hover:bg-[#00A89B] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Processing...' : isSignup ? 'Sign Up' : 'Sign In'}
                </button>
              </form>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  {isSignup ? 'Already have an account?' : 'New to Ravdesk?'}{' '}
                  <button
                    onClick={toggleAuthMode}
                    className="text-[#00C4B4] hover:text-[#00A89B] font-medium"
                    disabled={isConnecting}
                  >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="h-px bg-gray-600 w-1/4"></div>
                  <span className="text-gray-400 text-sm">or</span>
                  <div className="h-px bg-gray-600 w-1/4"></div>
                </div>
                <GoogleOAuthProvider clientId="825437177579-rkrovd3kn5bhdgkro2r93b2ku2tgqi0o.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() => setError('Google Sign-In failed!')}
                    render={(renderProps) => (
                      <button
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled || isConnecting}
                        className="w-full bg-white text-gray-800 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.52 7.72 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 4.01 3.48 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                      </button>
                    )}
                  />
                </GoogleOAuthProvider>
                <button
                  onClick={handleAppleSignIn}
                  disabled={isConnecting}
                  className="w-full bg-black text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-900 transition disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .75-3.34.78-1.33-.02-2.22-1.23-3.05-2.47C7.5 19 6 15.92 6 12.69c0-2.22 1.21-4 2.76-5.25C9.91 6.19 11.58 6 12.85 6c1.27 0 2.58.68 3.46.68.87 0 2.34-.66 3.47 1.06-.15.47-.72 1.63-1.5 2.69-1.02 1.25-2.09 2.66-1.81 4.63.28 1.97.87 2.34 2.13 2.34zm-3.48-11.81c-.66.81-1.75.63-2.65.31-.89-.32-1.67-.96-2.24-1.68-.56-.73-.86-1.66-.56-2.56.3-.9 1.38-1.54 2.34-1.5.96.04 1.74.62 2.31 1.34.57.73.79 1.68.8 2.59z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-[#2A2A2A] py-12 px-4 text-center"
      >
        <h3 className="text-2xl font-semibold mb-4">Why Choose Ravdesk?</h3>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Secure payments, global talent, and blockchain transparency—all just a click away. Sign up to get started!
        </p>
        <p className="text-sm text-gray-400">No wallet required until you’re ready to collaborate.</p>
      </motion.div>

      <Footer />
    </div>
  );
}

export default Landing;