import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Redefine Your Style with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Glo-Up.ai combines cutting-edge AI technology with sustainable fashion 
              to deliver personalized style recommendations, curated shopping experiences, 
              and interactive mood boards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#features" className="btn btn-primary text-center">
                Explore AI Features
              </a>
              <a href="#sustainable" className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-center">
                Shop Sustainable
              </a>
            </div>
            <div className="mt-10">
              <p className="text-sm font-medium text-gray-500 mb-2">Featured in</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-gray-400 font-semibold">VOGUE</div>
                <div className="text-gray-400 font-semibold">ELLE</div>
                <div className="text-gray-400 font-semibold">HARPER'S</div>
                <div className="text-gray-400 font-semibold">FASHION WEEKLY</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white p-2 rounded-2xl shadow-xl">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Model Image</span>
                    </div>
                    <div className="w-64 h-12 bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
                      <span className="text-sm text-primary font-medium">AI Fashion Recommendations</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="w-12 h-12 rounded-md bg-gray-200 shadow-sm"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 