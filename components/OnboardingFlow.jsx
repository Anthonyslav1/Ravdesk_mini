import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Wallet, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Lock,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const OnboardingFlow = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    {
      title: "Welcome to Ravdesk Escrow",
      subtitle: "The Future of Secure Multi-Party Transactions",
      icon: <Award className="w-12 h-12" />,
      content: {
        title: "Industry-Leading Security",
        description: "Built on blockchain technology with smart contracts audited for maximum security and reliability.",
        features: [
          { icon: <Shield />, text: "Military-grade encryption" },
          { icon: <Lock />, text: "Decentralized consensus" },
          { icon: <Zap />, text: "Instant settlements" },
          { icon: <Globe />, text: "Global accessibility" }
        ]
      },
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "How Escrow Works",
      subtitle: "Simple, Secure, Seamless",
      icon: <Users className="w-12 h-12" />,
      content: {
        title: "Three-Step Process",
        description: "Our streamlined process ensures everyone gets paid fairly and on time.",
        steps: [
          { number: "01", title: "Create Contract", desc: "Set up milestones and terms" },
          { number: "02", title: "Deposit Funds", desc: "Secure payment in escrow" },
          { number: "03", title: "Release Payment", desc: "Automatic or consensus-based release" }
        ]
      },
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Connect Your Wallet",
      subtitle: "Secure & Simple Integration",
      icon: <Wallet className="w-12 h-12" />,
      content: {
        title: "Web3 Made Easy",
        description: "Connect your preferred wallet to start using our platform securely.",
        wallets: [
          { name: "MetaMask", icon: "🦊", popular: true },
          { name: "WalletConnect", icon: "🔗", popular: true },
          { name: "Coinbase Wallet", icon: "🔵", popular: false },
          { name: "Trust Wallet", icon: "💙", popular: false }
        ]
      },
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "You're All Set!",
      subtitle: "Welcome to the Future of Escrow",
      icon: <CheckCircle className="w-12 h-12" />,
      content: {
        title: "Ready to Get Started",
        description: "Your account is ready. Create your first escrow contract or explore our features.",
        achievements: [
          "✅ Wallet connected securely",
          "✅ Network configured",
          "✅ Ready for transactions",
          "✅ Welcome bonus activated"
        ]
      },
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-blue-500 text-white shadow-lg scale-110'
                      : completedSteps.has(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                    completedSteps.has(index) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden" padding="xl">
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l ${currentStepData.gradient} opacity-10 rounded-r-2xl`} />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${currentStepData.gradient} mb-4`}>
                    <div className="text-white">
                      {currentStepData.icon}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {currentStepData.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {currentStepData.subtitle}
                  </p>
                </div>

                {/* Step Content */}
                <div className="mb-8">
                  {currentStep === 0 && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {currentStepData.content.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {currentStepData.content.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {currentStepData.content.features.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            <div className="text-blue-500">
                              {feature.icon}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {feature.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                        {currentStepData.content.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                        {currentStepData.content.description}
                      </p>
                      
                      <div className="space-y-4">
                        {currentStepData.content.steps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                              {step.number}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {step.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {step.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {currentStepData.content.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {currentStepData.content.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {currentStepData.content.wallets.map((wallet, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 ${
                              wallet.popular ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                            }`}
                          >
                            {wallet.popular && (
                              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                Popular
                              </div>
                            )}
                            <div className="text-3xl mb-2">{wallet.icon}</div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {wallet.name}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        {currentStepData.content.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {currentStepData.content.description}
                      </p>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                        <div className="space-y-2">
                          {currentStepData.content.achievements.map((achievement, index) => (
                            <motion.p
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-green-700 dark:text-green-300 font-medium"
                            >
                              {achievement}
                            </motion.p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {currentStep > 0 && (
                      <Button
                        variant="ghost"
                        onClick={prevStep}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                      >
                        Back
                      </Button>
                    )}
                    
                    <button
                      onClick={onSkip}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                    >
                      Skip for now
                    </button>
                  </div>

                  <Button
                    onClick={nextStep}
                    rightIcon={currentStep < steps.length - 1 ? <ArrowRight className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  >
                    {currentStep < steps.length - 1 ? 'Continue' : 'Get Started'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
