import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const Dialog = ({ children, open, onClose }) => {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            className="bg-white rounded-lg shadow-lg max-w-md w-full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

const DialogContent = ({ children, className, ...props }) => {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
};

const DialogHeader = ({ children, className, ...props }) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center mb-4", className)} {...props}>
            {children}
        </div>
    );
};

const DialogTitle = ({ children, className, ...props }) => {
    return (
        <h2 className={cn("text-xl font-semibold", className)} {...props}>
            {children}
        </h2>
    );
};

const DialogDescription = ({ children, className, ...props }) => {
    return (
        <p className={cn("text-sm text-gray-500", className)} {...props}>
            {children}
        </p>
    );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }; 