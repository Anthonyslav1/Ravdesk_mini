import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, ClipboardList } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

function Freelancers() {
  const benefits = [
    {
      title: 'Increased Earning Potential',
      description: 'Access high-value projects and earn more with transparent pricing',
      icon: DollarSign,
    },
    {
      title: 'Faster Payments',
      description: 'Get paid instantly upon milestone completion with smart contracts',
      icon: Zap,
    },
    {
      title: 'Reduced Admin Burdens',
      description: 'Focus on your work while our platform handles the paperwork',
      icon: ClipboardList,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for signing up! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#2A2A2A] py-12"
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              For Freelancers
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Join our platform and take control of your freelance career with blockchain-powered security and efficiency.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#2A2A2A] p-6 rounded-lg"
              >
                <div className="bg-[#1A1A1A] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-[#00C4B4]" /> {/* Company teal */}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">{benefit.title}</h3>
                <p className="text-gray-300 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section className="py-12 bg-[#2A2A2A]">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Get Started Today</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]" /* Company teal */
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]" /* Company teal */
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                id="wallet"
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]" /* Company teal */
                placeholder="0x..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00C4B4] text-white py-2 rounded-lg hover:bg-[#00A89B] transition" /* Company teal */
            >
              Sign Up as Freelancer
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Freelancers;