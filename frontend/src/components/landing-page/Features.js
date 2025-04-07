import React from "react";
import { motion } from "framer-motion";
import { Brain, Bell, Users } from "lucide-react";

const features = [
    {
        title: "AI Tutoring",
        description: "Get personalized help with your Computer Science coursework",
        icon: Brain,
    },
    {
        title: "Real-time Updates",
        description: "Stay informed about university news and events",
        icon: Bell,
    },
    {
        title: "Avatar Customization",
        description: "Choose your preferred AI lecturer avatar",
        icon: Users,
    },
];

export default function Features() {
    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <feature.icon className="w-12 h-12 text-teal-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
} 