import { Sun, Moon } from "lucide-react";
import useTheme from "../../Hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = ({ variant = "default", canShowText = false, className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={!canShowText ? (theme === "dark" ? "Dark Mode" : "Light Mode") : ""}
        className={`w-full flex items-center ${
          !canShowText ? "justify-center" : "justify-between"
        } px-4 py-3 rounded-full transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-800/60 text-gray-700 dark:text-gray-200 cursor-pointer ${className}`}
      >
        <div className={`flex items-center ${!canShowText ? "" : "gap-3"}`}>
          <div className="relative shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-emerald-500 dark:text-emerald-400"
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-amber-500"
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {canShowText && (
            <span className="font-medium text-sm whitespace-nowrap">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </div>

        {canShowText && (
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 p-0.5 flex items-center shrink-0 ${
              theme === "dark" ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              animate={{ x: theme === "dark" ? 20 : 0 }}
              className="w-5 h-5 rounded-full bg-white shadow-md"
            />
          </div>
        )}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-[#333] bg-white/50 dark:bg-[rgba(31,31,31,0.62)] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 backdrop-blur-sm cursor-pointer ${className}`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="moon"
            initial={{ y: 15, opacity: 0, rotate: 30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: -30 }}
            transition={{ duration: 0.2 }}
            className="text-emerald-600"
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 15, opacity: 0, rotate: 30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: -30 }}
            transition={{ duration: 0.2 }}
            className="text-emerald-600"
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
