import { Navbar } from "../Molecules/Navbar";
import { Footer } from "../Organisms/Footer";
import { Outlet } from "react-router-dom";
import ByteChatbot from "../Organisms/ByteChatbot";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ByteChatbot />
    </div>
  );
}

export default PublicLayout;