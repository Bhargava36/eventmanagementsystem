import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically scrolls the browser window to top (0, 0)
 * whenever the user navigates to a new route.
 */
export default function ScrollToTopOnNavigate() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Instantly reset scroll to top so new page does not stay at the bottom
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname, search]);

  return null;
}
