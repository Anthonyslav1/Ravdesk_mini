import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Lock,
  Globe,
  Award,
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import OnboardingFlow from './OnboardingFlow';
import WalletConnect from './WalletConnect';
import { useToast } from './ui/Toast';

const EnhancedLanding = ({ 
  account, 
  setAccount, 
  onGoogleSignIn, 
  onLoginSuccess,
  web3,
  isConnecting,
  networkCorrect,
  onConnect,
  onDisconnect,
  onNetworkSwitch
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const { toast } = useToast();

  const stats = [
    { label: 'Contracts Secured', value: '10,000+', icon: <Shield className="w-8 h-8" /> },
    { label: 'Total Volume', value: '$50M+', icon: <TrendingUp className="w-8 h-8" /> },
    { label: 'Users Protected', value: '25,000+', icon: <Users className="w-8 h-8" /> },
    { label: 'Uptime', value: '99.9%', icon: <Clock className="w-8 h-8" /> }
  ];

  const features = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Military-Grade Security",
      description: "Smart contracts audited by industry experts with zero security vulnerabilities found.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Lightning Fast",
      description: "Instant settlements and real-time transaction processing on Polygon network.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Multi-Party Support",
      description: "Seamlessly handle complex contracts with multiple clients and freelancers.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Access",
      description: "Available worldwide with support for multiple currencies and payment methods.",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Freelance Developer",
      content: "Ravdesk has revolutionized how I work with clients. The security and transparency are unmatched.",
      rating: 5,
      avatar: "👩‍💻"
    },
    {
      name: "Michael Rodriguez",
      role: "Startup Founder",
      content: "Perfect for managing complex project payments. The milestone system is exactly what we needed.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emily Johnson",
      role: "Digital Agency Owner",
      content: "Our team loves the transparency and security. Client trust has increased significantly.",
      rating: 5,
      avatar: "👩‍🎨"
    }
  ];

  const handleGetStarted = () => {
    if (account) {
      onLoginSuccess();
    } else {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowWallet(true);
    toast.success("Welcome to Ravdesk!", { title: "Onboarding Complete" });
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setShowWallet(true);
  };

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Award className="w-4 h-4 mr-2" />
                  Industry Leading Security
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Secure Escrow
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Revolutionary multi-party escrow platform built on blockchain technology. 
                Secure, transparent, and lightning-fast payments for the modern world.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="xl"
                  onClick={handleGetStarted}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started Free
                </Button>
                
                <Button
                  variant="secondary"
                  size="xl"
                  leftIcon={<Eye className="w-5 h-5" />}
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Zero Security Breaches</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {showWallet ? (
                <WalletConnect
                  web3={web3}
                  account={account}
                  isConnecting={isConnecting}
                  networkCorrect={networkCorrect}
                  onConnect={onConnect}
                  onDisconnect={onDisconnect}
                  onNetworkSwitch={onNetworkSwitch}
                />
              ) : (
                <Card className="p-8" gradient>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Join thousands of users who trust Ravdesk for secure escrow services.
                    </p>
                    <Button
                      className="w-full"
                      onClick={handleGetStarted}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Start Your Journey
                    </Button>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Built for the Future
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Cutting-edge technology meets intuitive design to deliver the most secure 
              and user-friendly escrow experience available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <Card.Content className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl text-white mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our users are saying about their Ravdesk experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <Card.Content className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Ready to Revolutionize Your Payments?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join the future of secure, transparent, and efficient escrow services.
            </p>
            <Button
              size="xl"
              onClick={handleGetStarted}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedLanding;
