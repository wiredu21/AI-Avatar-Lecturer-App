import React, { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import iconImage from "../../assets/images/icon.png";

const navItems = [
    { name: "Home", to: "hero" },
    { name: "Features", to: "features" },
    { name: "Demo", to: "demo" },
    { name: "Testimonials", to: "testimonials" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(42,92,141,0.95)] shadow-md" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center space-x-2">
                        <ScrollLink to="hero" smooth={true} duration={500} className="cursor-pointer flex items-center">
                            <span
                                className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? "text-white" : "text-teal-400"}`}
                            >
                                Virtu
                                <span className="bg-gradient-to-r from-teal-400 to-purple-600 text-transparent bg-clip-text">AId</span>
                            </span>
                            <div className="ml-2 w-8 h-8">
                                <img
                                    src={iconImage}
                                    alt="VirtuAId Logo"
                                    className="object-contain w-8 h-8"
                                />
                            </div>
                        </ScrollLink>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <ScrollLink
                                key={item.name}
                                to={item.to}
                                smooth={true}
                                duration={500}
                                className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out relative group ${isScrolled ? "text-white hover:text-teal-400" : "text-purple-600 hover:text-teal-400"
                                    }`}
                                activeClass="text-teal-400"
                                spy={true}
                            >
                                {item.name}
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
                            </ScrollLink>
                        ))}
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-md text-teal-400 border border-teal-400 hover:bg-teal-400 hover:text-white transition-all hover:scale-105"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="px-4 py-2 rounded-md bg-gradient-to-r from-teal-400 to-purple-600 text-white hover:from-teal-500 hover:to-purple-700 transition-all hover:scale-105"
                        >
                            Sign Up
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-900">
                        {navItems.map((item) => (
                            <ScrollLink
                                key={item.name}
                                to={item.to}
                                smooth={true}
                                duration={500}
                                className="text-gray-300 hover:text-teal-400 block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-all duration-300 ease-in-out"
                                activeClass="text-teal-400 bg-blue-800"
                                spy={true}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </ScrollLink>
                        ))}
                        <div className="mt-4 space-y-2">
                            <Link
                                to="/login"
                                className="block w-full px-4 py-2 rounded-md text-teal-400 border border-teal-400 hover:bg-teal-400 hover:text-white transition-all text-center"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="block w-full px-4 py-2 rounded-md bg-gradient-to-r from-teal-400 to-purple-600 text-white hover:from-teal-500 hover:to-purple-700 transition-all text-center"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
} 