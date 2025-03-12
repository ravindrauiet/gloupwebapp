import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ShoppingBagIcon,
  BookOpenIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Custom LeafIcon component
const LeafIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c4.97 0 9-3.694 9-8.25 0-1.02-.164-1.97-.456-2.833A8.096 8.096 0 0 1 12 4.5c-6.627 0-12 5.373-12 12 0 2.486.962 4.728 2.5 6.5 1.273-3.12 3.75-4.5 7.5-4.5 2.485 0 4.728.962 6.5 2.5-.214-4.657-1.547-8-6.5-8.5-4.953-.5-8 3-9 7.5z" />
  </svg>
);

const features = [
  {
    name: 'AI-Powered Mood Board',
    description: 'Our advanced AI technology analyzes your preferences to create personalized fashion mood boards that evolve with your style.',
    icon: SparklesIcon,
    href: '#features',
  },
  {
    name: 'Sustainable Fashion Focus',
    description: 'Discover and shop from eco-friendly brands committed to sustainable practices and ethical production methods.',
    icon: LeafIcon,
    href: '#sustainable',
  },
  {
    name: 'Curated Shopping Experience',
    description: 'Enjoy a handpicked selection of items tailored to your taste, with an emphasis on earth-friendly materials and practices.',
    icon: ShoppingBagIcon,
    href: '#shop',
  },
  {
    name: 'Personalized Lookbook',
    description: 'Create and save personalized lookbooks that evolve based on your activity and preferences for easy outfit planning.',
    icon: BookOpenIcon,
    href: '#lookbook',
  },
  {
    name: 'Seamless Shopping & Fulfillment',
    description: 'Purchase items from multiple brands in one checkout, with a focus on sustainable packaging and delivery options.',
    icon: TruckIcon,
    href: '#shop',
  },
  {
    name: 'AI-Driven Style Evolution',
    description: 'Our AI learns from your interactions to continuously refine recommendations and help you evolve your personal style.',
    icon: ArrowPathIcon,
    href: '#features',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Redefine Your Fashion Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Glo-Up.ai combines artificial intelligence with sustainable fashion principles to provide a uniquely personalized shopping journey.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <a href={feature.href} className="block">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 