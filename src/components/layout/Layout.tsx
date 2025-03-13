// src/components/layout/Layout.tsx
import { useState, useEffect } from "react";
import { Menu, X, Home, MessageSquare } from "lucide-react";
import { Link } from "@tanstack/react-router";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Check on mount
    checkIfMobile();

    // Check on resize
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div className="content flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white fixed md:relative transition-all duration-300 ease-in-out z-10 h-full ${
          isSidebarOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
        }`}
      >
        <div className="p-4 flex justify-between items-center">
          <h1 className={`font-bold text-lg ${!isSidebarOpen && "md:hidden"}`}>
            Tools
          </h1>
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <nav className="mt-6">
          <ul>
            <li className="mb-2">
              <Link
                to="/"
                className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
                activeProps={{ className: "bg-gray-700" }}
              >
                <Home size={20} />
                <span className={`ml-4 ${!isSidebarOpen && "md:hidden"}`}>
                  Home
                </span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/companies"
                className="flex items-center px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
                activeProps={{ className: "bg-gray-700" }}
              >
                <MessageSquare size={20} />
                <span className={`ml-4 ${!isSidebarOpen && "md:hidden"}`}>
                  Empresas
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">
            Dashboard
          </h1>
        </header>

        {/* Content */}
        <main className="overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
