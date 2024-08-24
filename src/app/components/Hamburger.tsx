import { NAV_LINKS } from "@/constants"
import Link from "next/link"
import { useEffect, useRef } from "react"

type HamburgerMenuProps = {
  isOpen: boolean,
  onClose: () => void
}

const Hamburger = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 right-0 h-full w-96 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col items-end p-8">
        {NAV_LINKS.map((link) => (
          <Link
            href={link.href}
            key={link.key}
            className="text-lg font-semibold py-2"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Hamburger;