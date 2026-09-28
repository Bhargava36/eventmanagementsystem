"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ThemeToggle from "../Organisms/ThemeToggler";
import {motion} from "framer-motion";
const AnimatedNavLink = ({ href, children }) => {
  return (
    <Link 
      to={href} 
      className="group relative inline-flex flex-col justify-start overflow-hidden h-[20px] px-2 text-sm font-medium whitespace-nowrap"
    >
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-[20px]">
        <span className="h-[20px] leading-[20px] text-gray-700 dark:text-gray-300 flex items-center whitespace-nowrap">
          {children}
        </span>
        <span className="h-[20px] leading-[20px] text-emerald-600 dark:text-emerald-400 flex items-center whitespace-nowrap">
          {children}
        </span>
      </div>
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (!isOpen) {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const currentHeaderShapeClass = isOpen ? 'rounded-xl' : headerShapeClass;

  const logoElement = (
    <Link to="/" className="relative w-5 h-5 flex items-center justify-center shrink-0">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-emerald-600 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-emerald-600 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    </Link>
  );

  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'Explore Events', href: '/user/login' },
    { label: 'Organizers', href: '/admin/login' },
  ];

  const loginButtonElement = (
    <Link to="/user/login" className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-gray-300 dark:border-[#333] bg-white/70 dark:bg-[rgba(31,31,31,0.62)] text-gray-700 dark:text-gray-300 rounded-full hover:border-emerald-600 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 whitespace-nowrap text-center">
      Log In
    </Link>
  );

  const signupButtonElement = (
    <div className="relative group shrink-0">
      <div className="absolute inset-0 -m-1.5 rounded-full
                     hidden sm:block
                     bg-emerald-500
                     opacity-20 dark:opacity-20 filter blur-xl pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-40 group-hover:blur-2xl group-hover:-m-2"></div>
      <Link to="/user/register" className="relative z-10 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold border border-transparent text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm hover:shadow-emerald-600/30 transition-all duration-200 whitespace-nowrap block text-center">
        Join Free
      </Link>
    </div>
  );

  return (
    <motion.header className={cn(
      `fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       pl-5 pr-5 py-2.5 sm:pl-6 sm:pr-6 sm:py-3 backdrop-blur-sm
                       ${currentHeaderShapeClass}
                       border border-gray-300 dark:border-[#333] bg-white/80 dark:bg-[#1f1f1f70] shadow-sm dark:shadow-none
                       w-auto max-w-[calc(100%-2rem)] whitespace-nowrap
                       transition-[border-radius] duration-0 ease-in-out`
    )}
    animate={{
              y: [-20, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 0,
              ease: "easeInOut",
            }}
    >

      <div className="flex items-center justify-between w-full flex-nowrap gap-x-4 sm:gap-x-7 whitespace-nowrap">
        <div className="flex gap-2.5 items-center shrink-0">
          {logoElement}
          <h5 className="text-sm sm:text-base font-bold text-gray-700 dark:text-white whitespace-nowrap">HACK_<span className="text-emerald-600">HUB</span></h5>
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm flex-nowrap whitespace-nowrap">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.label} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap whitespace-nowrap">
          <ThemeToggle />
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <Link key={link.href} to={link.href} className="text-gray-200 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-700 transition-colors w-full text-center">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          <div className="flex justify-center w-full">
            <ThemeToggle />
          </div>
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </motion.header>
  );
}
