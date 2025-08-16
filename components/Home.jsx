import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Shield, Users, CheckCircle, Wallet, Lock, Star, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Home({ account, onConnectWallet, onGoogleSignIn }) {
  const stats = [
    { label: 'Trusted Transactions', value: '12,500+', icon: Shield },
    { label: 'Active Freelancers', value: '6,200+', icon: Users },
    { label: 'Projects Completed', value: '18,000+', icon: CheckCircle },
  ];

  const features = [
    { title: 'Secure Escrow', description: 'Funds held safely until work is approved', icon: Wallet },
    { title: 'Smart Contracts', description: 'Automated payments via blockchain', icon: Lock },
    { title: 'Reputation Scores', description: 'Build trust with verified reviews', icon: Star },
    { title: 'Dispute Support', description: 'Resolve issues with admin mediation', icon: Scale },
  ];

  const opportunities = [
    { title: 'Web Developer for E-commerce Site', category: 'Development', budget: '0.5 ETH', posted: '2h ago', skills: ['React', 'Node.js'] },
    { title: 'Graphic Designer for Branding', category: 'Design', budget: '0.3 ETH', posted: '5h ago', skills: ['Adobe XD', 'Illustrator'] },
    { title: 'Content Writer for Blog Series', category: 'Writing', budget: '0.2 ETH', posted: '1d ago', skills: ['SEO', 'Copywriting'] },
  ];

  const testimonials = [
    { name: 'Alex M.', role: 'Freelancer', quote: 'Ravdesk’s escrow system ensures I get paid on time—best platform I’ve used.' },
    { name: 'Sarah K.', role: 'Client', quote: 'Finding top talent with smart contracts is a game-changer!' },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Navbar account={account} onGoogleSignIn={onGoogleSignIn} />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-24 pb-16 px-4 md:px-8 bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hello, <span className="text-[#00C4B4]">{account ? (account.startsWith('google-') ? account.slice(7, 13) : account.slice(0, 6)) : 'User'}</span>!
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              Your freelance journey starts here. Hire top talent or find your next gig with Ravdesk’s secure blockchain platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/dashboard"
                className="bg-[#00C4B4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00A89B] transition w-full sm:w-auto"
              >
                Connect Wallet
              </Link>
              <Link
                to="/business"
                className="border-2 border-[#00C4B4] text-[#00C4B4] px-6 py-3 rounded-lg font-semibold hover:bg-[#00C4B4] hover:text-white transition w-full sm:w-auto"
              >
                Browse Talent
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 md:mt-0 md:w-1/3"
          >
            <img
              src="https://images.unsplash.com/photo-1516321310766-66cf4bf3d0b2?auto=format&fit=crop&q=80&w=300"
              alt="Freelancer working"
              className="rounded-lg shadow-lg w-full"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Opportunities Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 md:px-8 bg-[#1A1A1A]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Explore Opportunities</h2>
            <Link to="/dashboard" className="text-[#00C4B4] hover:text-[#00A89B] font-semibold">See All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#2A2A2A] p-6 rounded-lg hover:shadow-lg transition"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Briefcase className="w-5 h-5 text-[#00C4B4]" />
                  <h3 className="text-lg font-semibold truncate">{opp.title}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">{opp.category}</p>
                <p className="text-gray-300 mb-2">Budget: {opp.budget}</p>
                <p className="text-gray-500 text-sm mb-3">Posted: {opp.posted}</p>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((skill, i) => (
                    <span key={i} className="bg-[#3A3A3A] text-gray-300 text-xs px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-block text-[#00C4B4] hover:text-[#00A89B] font-medium"
                >
                  Apply Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 md:px-8 bg-[#2A2A2A]"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <stat.icon className="w-10 h-10 text-[#00C4B4] mx-auto mb-4" />
                <div className="text-3xl font-bold text-[#00C4B4] mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 md:px-8 bg-[#1A1A1A]"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Tools for Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#2A2A2A] p-6 rounded-lg text-center"
              >
                <feature.icon className="w-10 h-10 text-[#00C4B4] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 md:px-8 bg-[#2A2A2A]"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Hear from Our Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#1A1A1A] p-6 rounded-lg"
              >
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#00C4B4] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 md:px-8 bg-[#1A1A1A] text-center"
      >
        <h3 className="text-2xl font-semibold mb-4">Take the Next Step</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Connect your wallet in the Dashboard to hire talent, post projects, or start earning with Ravdesk’s blockchain security.
        </p>
        <Link
          to="/dashboard"
          className="bg-[#00C4B4] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00A89B] transition"
        >
          Get Started in Dashboard
        </Link>
      </motion.section>

      <Footer />
    </div>
  );
}

export default Home;