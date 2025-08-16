import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gauge, PiggyBank } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Business() {
  const benefits = [
    {
      title: 'Global Talent Pool',
      description: 'Access skilled freelancers from around the world',
      icon: Users,
    },
    {
      title: 'Improved Efficiency',
      description: 'Streamlined processes and automated payments',
      icon: Gauge,
    },
    {
      title: 'Reduced Costs',
      description: 'Competitive rates and lower overhead expenses',
      icon: PiggyBank,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Project posted successfully! This feature will be available soon.');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Navbar /> {/* Added Navbar */}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#2A2A2A] py-12" /* Reduced from py-20 */
      >
        <div className="max-w-5xl mx-auto px-4"> {/* Tightened max width */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4"> {/* Reduced font size */}
              For Businesses
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto"> {/* Smaller max width */}
              Find the perfect talent and manage projects efficiently with our blockchain-powered platform.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <section className="py-12"> {/* Reduced from py-20 */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Reduced gap-8 to gap-6 */}
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#2A2A2A] p-6 rounded-lg" /* Reduced p-8 to p-6 */
              >
                <div className="bg-[#1A1A1A] w-12 h-12 rounded-full flex items-center justify-center mb-4"> {/* Smaller icon container */}
                  <benefit.icon className="w-6 h-6 text-[#00C4B4]" /> {/* Adjusted size */}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white"> {/* Smaller text */}
                  {benefit.title}
                </h3>
                <p className="text-gray-300 text-sm">{benefit.description}</p> {/* Smaller text */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Form */}
      <section className="py-12 bg-[#2A2A2A]"> {/* Reduced from py-20 */}
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-white"> {/* Smaller text */}
            Post a Project
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}> {/* Reduced space-y-6 to space-y-4 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                placeholder="Enter project title"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Project Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                placeholder="Describe your project requirements"
                required
              />
            </div>
            <div>
              <label htmlFor="milestones" className="block text-sm font-medium text-gray-300 mb-1">
                Milestones
              </label>
              <textarea
                id="milestones"
                rows={3}
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                placeholder="List your project milestones"
                required
              />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-1">
                Budget (ETH)
              </label>
              <input
                type="number"
                id="budget"
                step="0.01"
                className="w-full bg-[#1A1A1A] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C4B4]"
                placeholder="0.00"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#00C4B4] text-white py-2 rounded-lg hover:bg-[#00A89B] transition" /* Smaller padding */
            >
              Post Project
            </button>
          </form>
        </div>
      </section>

      <Footer /> {/* Added Footer */}
    </div>
  );
}

export default Business;