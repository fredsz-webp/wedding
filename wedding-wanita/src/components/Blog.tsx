import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Code, ExternalLink, Github } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  date: string;
  image: string;
  liveUrl: string;
  githubUrl: string;
  role: 'Frontend' | 'Backend' | 'Fullstack';
}

interface NotificationState {
  show: boolean;
  message: string;
}

const Portfolio = () => {
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '' });

  const showNotification = (message: string): void => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const handleLinkClick = (url: string, type: 'live' | 'github'): boolean => {
    if (url === '#' || url === '') {
      if (type === 'live') {
        showNotification('Live demo is not available for this project yet.');
      } else if (type === 'github') {
        showNotification('GitHub repository is not available for this project yet.');
      }
      return false;
    }
    return true;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Frontend':
        return 'bg-blue-500/60 text-blue-100 border-blue-500/80';
      case 'Backend':
        return 'bg-green-500/60 text-green-100 border-green-500/80';
      case 'Fullstack':
        return 'bg-purple-500/60 text-purple-100 border-purple-500/80';
      default:
        return 'bg-slate-500/60 text-slate-100 border-slate-500/80';
    }
  };

  const projects: Project[] = [
    {
      id: 1,
      title: 'Sobat Ngelak - UMKM Landing Page',
      description: 'Landing page developed for UMKM Sobat Ngelak using Weebly as a third-party platform, focusing on branding and online presence.',
      techStack: 'Weebly',
      date: 'March 2022',
      image: 'assets/portofolio/sobat.webp',
      liveUrl: 'https://sobatngelak.weebly.com',
      githubUrl: '#',
      role: 'Frontend'
    },
    {
      id: 2,
      title: 'YUCO Kitchen - UMKM Website',
      description: 'Custom website for UMKM YUCO Kitchen built on Blogspot with HTML and CSS customization to enhance branding and online presence.',
      techStack: 'Blogspot, HTML, CSS',
      date: 'July 2023',
      image: 'assets/portofolio/yuco.webp',
      liveUrl: 'https://yucokitchen.blogspot.com',
      githubUrl: '#',
      role: 'Frontend'
    },
    {
      id: 3,
      title: 'Rikma Care - Professional Hair Consultant (Prototipe)',
      description: 'Prototype hair consultant app with chatbot API, built collaboratively with my role in frontend.',
      techStack: 'Flutter, Dart, Bootstrap',
      date: 'August 2023',
      image: 'assets/portofolio/rikma.webp',
      liveUrl: 'https://youtu.be/KZfg1-0eYog?si=rT0iwkYyR1-FJ7Se',
      githubUrl: '#',
      role: 'Frontend'
    },
    {
      id: 4,
      title: "Rumah Karya Semesta - Company Profile Website",
      description: "A modern company profile website built for PT Rumah Karya Semesta (Rumaksa), designed to showcase company identity, services, and portfolio with a clean and responsive interface.",
      techStack: "React, TypeScript, Tailwind CSS, Firebase",
      date: "Mei 2025",
      image: "assets/portofolio/rumaksa.webp",
      liveUrl: "https://rumaksa.com",
      githubUrl: "#",
      role: "Fullstack"
    },
    {
  id: 5,
  title: 'Nikhu Studio - Booking Website',
  description: 'Studio photo booking website with integrated Midtrans payment, realtime Firestore booking, mobile-friendly and responsive.',
  techStack: 'Next.js, Next Auth, Tailwind CSS, Zustand, ShadCN UI, Firebase Auth, Firestore, Midtrans, Cron-job.org, EmailJS',
  date: 'August 2025',
  image: 'assets/portofolio/naka.webp',
  liveUrl: 'https://nikhustudio.com',
  githubUrl: 'https://github.com/iFredsz/nikhu-next',
  role: 'Fullstack'
}

  ];

  return (
    <section 
      id="portfolio" 
      className="relative z-20 pt-16 pb-12 overflow-hidden bg-gradient-to-b from-transparent to-[#0a0a1a]/70"
    >
      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-[#0d0d23] text-[#0afbff] px-6 py-4 rounded-lg shadow-lg border-l-4 border-[#0afbff] max-w-md mx-4 cyber-card">
            <div className="flex items-center">
              <div className="mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0afbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium font-['Orbitron']">NOTICE</p>
                <p className="text-[#0afbff]/80 text-sm mt-1 font-['Share_Tech_Mono']">{notification.message}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cyber-text">
            FEATURED PROJECTS
          </h2>
          <p className="text-lg text-[#0afbff]/80 max-w-2xl mx-auto font-['Share_Tech_Mono']">
            A selection of my recent projects that I've had the opportunity to work on
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice().reverse().map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cyber-card rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#0afbff]/10 transition-all duration-300 border border-[#0afbff]/20 hover:border-[#0afbff]/40 flex flex-col min-h-[520px]"
            >
              <div className="relative overflow-hidden h-48 flex-shrink-0">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent opacity-80"></div>
                {/* Badge untuk role developer */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(project.role)}`}>
                  {project.role} Developer
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-2 text-[#0afbff] group-hover:text-[#0afbff] transition-colors font-['Orbitron']">
                  {project.title}
                </h3>
                <p className="text-[#0afbff]/80 mb-3 text-sm flex-grow font-['Share_Tech_Mono']">
                  {project.description}
                </p>
                
                <div className="mb-3">
                  <div className="flex items-start space-x-2 text-xs text-[#0afbff]/60 mb-2 font-['Share_Tech_Mono']">
                    <Code className="w-3 h-3 flex-shrink-0 mt-1" />
                    <span className="flex-1 break-words">{project.techStack}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-[#0afbff]/60 font-['Share_Tech_Mono']">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{project.date}</span>
                  </div>
                </div>
                
                <div className="flex justify-end items-center mt-auto pt-3 border-t border-[#0afbff]/20">
                  <div className="flex space-x-2">
                    <a 
                      href={project.githubUrl}
                      onClick={(e) => {
                        if (!handleLinkClick(project.githubUrl, 'github')) {
                          e.preventDefault();
                        }
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#0afbff]/60 hover:text-[#0afbff] hover:bg-[#0afbff]/10 rounded-lg transition-colors flex items-center justify-center font-['Share_Tech_Mono']"
                      aria-label="View code on GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>

                    <a 
                      href={project.liveUrl}
                      onClick={(e) => {
                        if (!handleLinkClick(project.liveUrl, 'live')) {
                          e.preventDefault();
                        }
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#0afbff]/60 hover:text-[#0afbff] hover:bg-[#0afbff]/10 rounded-lg transition-colors flex items-center justify-center font-['Share_Tech_Mono']"
                      aria-label="View live project"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;