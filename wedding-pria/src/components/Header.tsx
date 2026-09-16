import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Instagram } from 'lucide-react';
import Logo from '../assets/fredsz-logo.webp';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Fungsi untuk mengubah active section saat scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setScrollProgress(progress);

      // Menandai section aktif berdasarkan posisi scroll
      const sections = [
        { id: 'blog', offset: document.getElementById('blog')?.offsetTop || 0 },
        { id: 'about', offset: document.getElementById('about')?.offsetTop || 0 },
        { id: 'contact', offset: document.getElementById('contact')?.offsetTop || 0 },
      ].filter(section => section.offset > 0);

      if (sections.length === 0) {
        setActiveSection('');
        return;
      }

      const scrollPosition = window.scrollY + 100;
      
      let currentSection = '';
      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].offset) {
          currentSection = sections[i].id;
          break;
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      if (sectionId === 'blog' && window.scrollY === 0) {
        setActiveSection('');
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('');
    setMenuOpen(false); // Tutup menu saat klik logo
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Header utama */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 font-montserrat ${
          isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between relative">

          {/* Logo dan Nama */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer z-50"
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-20 h-20 md:w-14 md:h-14 overflow-hidden rounded-full">
              <img
                src={Logo}
                alt="Fredsz Logo"
                className="w-full h-full object-cover transform scale-[1.6]"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-white">FREDSZ</span>
              <p className="text-xs text-sky-400">Web Engineer</p>
            </div>
          </motion.div>

          {/* Menu di tengah - posisi absolute agar di tengah layar */}
          <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8 hidden md:flex">
            {[
              { name: 'Project', id: 'blog' },
              { name: 'Profile', id: 'about' },
              { name: 'Contact', id: 'contact' },
            ].map((item) => (
              <motion.li
                key={item.name}
                whileHover={{ scale: 1.1 }}
                className={`cursor-pointer list-none transition ${
                  activeSection === item.id ? 'text-sky-400 font-semibold' : 'text-white'
                }`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </motion.li>
            ))}
          </nav>

          {/* Social icons di kanan */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.a
              href="https://id.linkedin.com/in/fredsz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-sky-400 transition"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.1 }}
            >
              <Linkedin className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://instagram.com/fredsz_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-500 transition"
              aria-label="Instagram"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.1 }}
            >
              <Instagram className="w-6 h-6" />
            </motion.a>
          </div>

          {/* Hamburger menu untuk mobile - IMPROVED ANIMATION */}
          <motion.div
            className="md:hidden z-50 cursor-pointer w-8 h-8 flex flex-col items-center justify-center"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{
                rotate: menuOpen ? 45 : 0,
                y: menuOpen ? 8 : 0,
                backgroundColor: menuOpen ? '#38bdf8' : '#ffffff'
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-6 h-0.5 mb-1.5 origin-center"
            />
            <motion.div
              animate={{
                opacity: menuOpen ? 0 : 1,
                scale: menuOpen ? 0 : 1,
                backgroundColor: menuOpen ? '#38bdf8' : '#ffffff'
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-6 h-0.5 mb-1.5"
            />
            <motion.div
              animate={{
                rotate: menuOpen ? -45 : 0,
                y: menuOpen ? -8 : 0,
                backgroundColor: menuOpen ? '#38bdf8' : '#ffffff'
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-6 h-0.5 origin-center"
            />
          </motion.div>
        </div>

        {/* Scroll Progress Bar */}
        {scrollProgress > 0 && (
          <div
            className="h-1 w-full"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          >
            <motion.div
              className="h-full bg-sky-400"
              style={{
                width: `${scrollProgress}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </motion.header>

      {/* Menu overlay mobile dengan animasi menggunakan framer-motion */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-full h-screen bg-slate-900/95 backdrop-blur-md z-40"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu items dengan stagger animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 w-full h-screen z-40 flex flex-col items-center justify-center space-y-8"
            >
              {[
                { name: 'Project', id: 'blog' },
                { name: 'Profile', id: 'about' },
                { name: 'Contact', id: 'contact' },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: 'easeOut'
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -20,
                    scale: 0.8,
                    transition: { 
                      delay: (2 - index) * 0.05,
                      duration: 0.2
                    }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    color: '#38bdf8',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`cursor-pointer text-2xl font-bold ${
                    activeSection === item.id ? 'text-sky-400' : 'text-white'
                  }`}
                  onClick={() => {
                    scrollToSection(item.id);
                    setMenuOpen(false);
                  }}
                >
                  {item.name}
                </motion.div>
              ))}

              {/* Social icons di menu mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.4, duration: 0.4 }
                }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-6 mt-8"
              >
                <motion.a
                  href="https://id.linkedin.com/in/fredsz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-sky-400 transition"
                  aria-label="LinkedIn"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Linkedin className="w-8 h-8" />
                </motion.a>
                <motion.a
                  href="https://instagram.com/fredsz_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-pink-500 transition"
                  aria-label="Instagram"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Instagram className="w-8 h-8" />
                </motion.a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer agar tidak tertutup */}
      <div className="h-24"></div>
    </>
  );
};

export default Header;