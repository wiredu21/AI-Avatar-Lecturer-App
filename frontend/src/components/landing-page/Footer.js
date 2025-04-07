import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-blue-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">VirtuAId</h3>
                        <p>Transforming education with AI</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:underline">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-teal-400">
                                <Facebook />
                            </a>
                            <a href="#" className="hover:text-teal-400">
                                <Twitter />
                            </a>
                            <a href="#" className="hover:text-teal-400">
                                <Instagram />
                            </a>
                            <a href="#" className="hover:text-teal-400">
                                <Linkedin />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-blue-800 text-sm text-center">
                    <p>&copy; {new Date().getFullYear()} VirtuAId. All rights reserved.</p>
                    <p className="mt-2">
                        <a href="#" className="hover:underline">
                            Privacy Policy
                        </a>{" "}
                        |
                        <a href="#" className="hover:underline ml-2">
                            Terms of Service
                        </a>{" "}
                        |
                        <a href="#" className="hover:underline ml-2">
                            GDPR Compliance
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
} 