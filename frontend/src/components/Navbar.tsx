// components/Navbar.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="text-xl font-semibold">
            <Link to="/">CardTracker</Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-6">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="focus:outline-none">
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <NavLinks onClick={() => setIsOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function NavLinks({ onClick }: { onClick?: () => void }) {
  const linkClass = "block hover:underline transition";
  return (
    <>
      <Link to="/" className={linkClass} onClick={onClick}>
        Home
      </Link>
      <Link to="/sets" className={linkClass} onClick={onClick}>
        Sets
      </Link>
      <Link to="/sealed" className={linkClass} onClick={onClick}>
        Sealed
      </Link>
    </>
  );
}
