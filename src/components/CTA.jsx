import { motion } from 'framer-motion';
import { useState } from 'react';

const CTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email);
      setSubmitted(true);
      setEmail('');
      
      // Reset the submitted state after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container-custom">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-accent text-white p-8 md:p-12">
          <div className="absolute inset-0 pattern-dots opacity-10"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Fashion Revolution</h2>
              <p className="text-lg opacity-90 mb-6">
                Experience the future of fashion with personalized AI recommendations and sustainable shopping options. 
                Be the first to access exclusive features and collections.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Personalized AI style recommendations', 
                  'Exclusive access to sustainable brands', 
                  'Create your digital fashion identity'
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white text-gray-900 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Get Early Access</h3>
              <p className="text-gray-600 mb-6">
                Join our waiting list for exclusive early access to the Glo-Up.ai platform.
              </p>
              
              {submitted ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <p>Thank you! You're on the list for early access.</p>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      I'm interested in sustainable fashion and AI-powered recommendations
                    </span>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full btn btn-primary py-3"
                >
                  Join Waiting List
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 