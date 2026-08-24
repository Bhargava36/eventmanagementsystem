

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Mail,
  Check,
  Bell,
  ShieldCheck,
  Globe,
} from "lucide-react";

// Social SVG Icons
const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
  </svg>
);

const DiscordIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const logoElement = (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white top-0 left-1/2 transform -translate-x-1/2 opacity-90" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white left-0 top-1/2 transform -translate-y-1/2 opacity-90" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white right-0 top-1/2 transform -translate-y-1/2 opacity-90" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white bottom-0 left-1/2 transform -translate-x-1/2 opacity-90" />
    </div>
  );

  const footerNavigation = {
    product: [
      { name: "Event Dashboards", href: "/sidebar" },
      { name: "Attendee Management", href: "#" },
      { name: "Ticketing & Passes", href: "#" },
      { name: "Live Analytics", href: "#" },
      { name: "Schedule Planner", href: "#" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Community Guides", href: "#" },
      { name: "System Status", href: "#" },
      { name: "Release Notes", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Manifesto", href: "#1" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
    social: [
      { name: "GitHub", href: "https://github.com", icon: GithubIcon },
      { name: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
      { name: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
      { name: "Discord", href: "https://discord.com", icon: DiscordIcon },
    ],
  };

  return (
    <motion.footer 
    initial={{opacity:0, y: 100}}
    animate={{opacity:1, y: 0}}
    exit={{opacity:0, y: 100}}
    transition={{duration: 0.5,delay:0.5,repeat: 1,ease: "easeInOut"}}
    className="relative z-20 border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/90 backdrop-blur-md transition-colors duration-300">
      {/* Decorative top ambient glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gray-400 dark:via-white/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-gray-200 dark:border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              {logoElement}
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Hack_Hub
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              The next-generation event management ecosystem. Streamline registrations, engage attendees, and analyze performance effortlessly.
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Enterprise Ready
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-blue-500" />
                99.99% Uptime
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              {footerNavigation.social.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 bg-gray-50 dark:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={item.name}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-sm">
                {footerNavigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Resources
              </h3>
              <ul className="space-y-3 text-sm">
                {footerNavigation.resources.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-sm">
                {footerNavigation.company.map((item) => (
                  <li key={item.name} className="flex items-center gap-1.5">
                    <a
                      href={item.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                    {item.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Stay Updated
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Get product updates, event tips, and platform insights straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:border-gray-500 dark:focus:border-white/40 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 text-white dark:text-black w-7 h-7 flex items-center justify-center rounded-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                  aria-label="Subscribe"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
              </div>

              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium pt-1"
                >
                  <Check className="w-3.5 h-3.5" /> Thank you for subscribing!
                </motion.p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} HackHub. All rights reserved.</p>

          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Cookies
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Security
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 transition-all duration-200"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
