import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

// Create context for tab state
const TabsContext = createContext({
  value: "",
  setValue: () => {},
});

const Tabs = ({ defaultValue, children, className, ...props }) => {
  const [value, setValue] = useState(defaultValue || "");

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={`${className || ""}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className, ...props }) => {
  return (
    <div 
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className || ""}`} 
      role="tablist" 
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className, ...props }) => {
  const { value: selectedValue, setValue } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      role="tab"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? "bg-white shadow-sm text-teal-600" 
          : "text-gray-500 hover:text-gray-900"
      } ${className || ""}`}
      onClick={() => setValue(value)}
      aria-selected={isActive}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-2 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent }; 