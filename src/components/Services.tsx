import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Brain, Rocket, Heart, Award } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Target,
      title: 'Goal Setting & Achievement',
      description: 'Define clear, actionable goals and create a roadmap to achieve them with proven strategies.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Leadership Development',
      description: 'Enhance your leadership skills and learn to inspire and motivate others effectively.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Brain,
      title: 'Mindset Transformation',
      description: 'Overcome limiting beliefs and develop a growth mindset for sustained success.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Rocket,
      title: 'Career Acceleration',
      description: 'Accelerate your career growth with strategic planning and skill development.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Heart,
      title: 'Work-Life Balance',
      description: 'Create harmony between your professional and personal life for overall well-being.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Award,
      title: 'Performance Optimization',
      description: 'Maximize your potential and achieve peak performance in all areas of life.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section id="services" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Coaching Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive coaching solutions designed to address every aspect of your personal and professional growth journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${service.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
              
              <div className="mt-6 flex items-center text-blue-600 font-medium">
                <span className="text-sm">Learn More</span>
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;