import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function FAQs() {
  const faqs = [
    { question: "What is Ravdesk?", answer: "Ravdesk is a blockchain-based platform built on Base that simplifies and secures freelance and business collaborations using smart contract escrow." },
    { question: "How does the escrow work?", answer: "Clients deposit funds into a smart contract. Funds are released based on milestones or a time lock, with approval from all parties or the admin." },
    { question: "Who can deploy a contract?", answer: "Any user with a connected Base-compatible wallet or third-party sign-in (Google, Apple) can deploy a contract via the Dashboard." },
    { question: "What’s the difference between milestone lock and time lock?", answer: "Milestone lock releases funds as tasks are completed; time lock releases funds after a set date, both requiring approval." },
    { question: "Can I use Google or Apple to sign in?", answer: "Yes, sign in with Google or Apple to access the platform, then connect your wallet for blockchain features." },
    { question: "How are disputes handled?", answer: "The fixed admin can cancel contracts, or all parties must agree to cancel and refund remaining funds." },
    { question: "Why Base?", answer: "Base provides fast, low-cost transactions, ideal for frequent contract interactions." },
    { question: "Is my data secure?", answer: "Third-party sign-ins use secure OAuth protocols, and wallet interactions are managed by MetaMask." },
    { question: "How do I get started?", answer: "Sign in with Google, Apple, or connect your wallet on the home page, then access the Dashboard." },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Navbar /> {/* Added Navbar */}

      <div className="flex-grow pt-16 pb-12 px-4 max-w-3xl mx-auto"> {/* Reduced spacing, tightened max width */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-6 text-center text-white" /* Reduced font size */
        >
          Frequently Asked Questions
        </motion.h1>
        <div className="space-y-4"> {/* Reduced from space-y-6 */}
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#2A2A2A] p-4 rounded-xl" /* Reduced p-6 to p-4 */
            >
              <h2 className="text-lg font-semibold mb-2 text-white"> {/* Smaller text */}
                {faq.question}
              </h2>
              <p className="text-gray-300 text-sm">{faq.answer}</p> {/* Smaller text */}
            </motion.div>
          ))}
        </div>
      </div>

      <Footer /> {/* Added Footer */}
    </div>
  );
}

export default FAQs;