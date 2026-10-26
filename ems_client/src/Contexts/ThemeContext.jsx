/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useRef } from "react";

export const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const isTransitioningRef = useRef(false);

  const applyThemeToDOM = (newTheme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = (e) => {
    if (isTransitioningRef.current) return;
    const nextTheme = theme === "light" ? "dark" : "light";

    // Check if View Transitions API is supported and motion is not reduced
    const supportsViewTransition =
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (supportsViewTransition) {
      isTransitioningRef.current = true;

      // Determine origin point of the ripple from click event or center of screen
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (
        e &&
        typeof e.clientX === "number" &&
        typeof e.clientY === "number" &&
        (e.clientX > 0 || e.clientY > 0)
      ) {
        x = e.clientX;
        y = e.clientY;
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      try {
        const transition = document.startViewTransition(() => {
          applyThemeToDOM(nextTheme);
          setTheme(nextTheme);
        });

        transition.ready
          .then(() => {
            const animation = document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 500,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );

            animation.onfinish = () => {
              isTransitioningRef.current = false;
            };
          })
          .catch(() => {
            isTransitioningRef.current = false;
          });

        transition.finished
          .then(() => {
            isTransitioningRef.current = false;
          })
          .catch(() => {
            isTransitioningRef.current = false;
          });
      } catch {
        applyThemeToDOM(nextTheme);
        setTheme(nextTheme);
        isTransitioningRef.current = false;
      }
      return;
    }

    // Fallback for browsers without View Transitions (smooth CSS transition)
    isTransitioningRef.current = true;
    document.documentElement.classList.add("theme-transitioning");
    applyThemeToDOM(nextTheme);
    setTheme(nextTheme);

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
      isTransitioningRef.current = false;
    }, 450);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
