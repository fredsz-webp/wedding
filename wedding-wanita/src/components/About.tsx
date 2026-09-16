import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Database, 
  Cloud, 
  Wrench, 
  MapPin, 
  Mail,
  ChevronRight,
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { FaServer } from 'react-icons/fa';
// Import ikon teknologi
import { 
  SiNextdotjs, 
  SiReact, 
  SiTypescript, 
  SiMui, 
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiFirebase,
  SiVercel,
  SiGithub,
  SiFigma,
  SiNotion
} from 'react-icons/si';

import { VscVscode } from "react-icons/vsc";
// Import gambar profil (gantilah dengan path yang sesuai)
import profileImage from '../assets/profile.webp';

const About = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  // Data untuk skill sets dengan ikon
  const skillCategories = [
    {
      id: 'FRONTEND',
      title: "Frontend Development",
      icon: Palette,
      skills: [
        { name: "Next.js", icon: <SiNextdotjs className="w-5 h-5" /> },
        { name: "React", icon: <SiReact className="w-5 h-5" /> },
        { name: "TypeScript", icon: <SiTypescript className="w-5 h-5" /> },
        { name: "Material-UI", icon: <SiMui className="w-5 h-5" /> },
        { name: "Tailwind", icon: <SiTailwindcss className="w-5 h-5" /> }
      ],
      description: "I specialize in creating responsive and interactive user interfaces with modern frameworks and libraries."
    },
    {
      id: 'BACKEND',
      title: "Backend Development",
      icon: Database,
      skills: [
        { name: "Node.js", icon: <SiNodedotjs className="w-5 h-5" /> },
        { name: "Express", icon: <SiExpress className="w-5 h-5" /> },
         { name: "Firebase", icon: <SiFirebase className="w-5 h-5" /> },
        { name: "MongoDB", icon: <SiMongodb className="w-5 h-5" /> },
        { name: "MySQL", icon: <SiMysql className="w-5 h-5" /> },
        { name: "PostgreSQL", icon: <SiPostgresql className="w-5 h-5" /> }
      ],
      description: "While backend development is not my primary expertise, I have foundational knowledge and experience in developing APIs and server-side logic."
    },
    {
      id: 'CLOUD',
      title: "Cloud",
      icon: Cloud,
      skills: [
        { name: "Vercel", icon: <SiVercel className="w-5 h-5" /> },
        { name: "Hosting Providers", icon: <FaServer className="w-5 h-5" /> },
      ],
      description: "Experienced in deploying applications on cloud platforms, including serverless, with a focus on scalability and performance."
    },
    {
      id: 'UTILITIES',
      title: "Utilities & Tools",
      icon: Wrench,
      skills: [
        { name: "GitHub", icon: <SiGithub className="w-5 h-5" /> },
        { name: "Figma", icon: <SiFigma className="w-5 h-5" /> },
        { name: "Notion", icon: <SiNotion className="w-5 h-5" /> },
        { name: "VS Code", icon: <VscVscode className="w-5 h-5" /> },
      ],
      description: "Proficient with development tools and utilities that enhance productivity and collaboration in software projects."
    }
  ];

  // Data untuk experience - TAMBAHKAN URL PADA SETIAP EXPERIENCE
  const experiences = [
    {
  role: "Web Developer Intern",
  company: "PT Indonesia Creative Technologi",
  location: "Indonesia",
  period: "Aug 2024 - Jan 2025",
  type: "Hybrid Internship",
  description: "Contributed to the development of a web-based photo booth application called Livephoto.id, focusing on both backend and frontend implementation.",
  achievements: [
    "Developed core features using Laravel, PHP, HTML5, CSS, and Intervention Image library.",
    "Implemented QR code functionality for seamless photo access and sharing.",
    "Optimized photo processing workflow to improve efficiency and user experience."
  ],
  image: "../assets/exp/livephoto.webp",
  url: "https://www.livephoto.id" // URL untuk perusahaan
}
    ,
    {
      role: "Web3 Promoter",
      company: "Candy Launchpad",
      location: "Remote",
      period: "2024",
      type: "Freelance",
      description: "Promoted Candy Launchpad, a Web3 platform that enables users to freely launch tokens on the BNB network, through various social media channels and online communities.",
      achievements: [
        "Increased awareness of Candy Launchpad by actively promoting on multiple social platforms.",
        "Built engagement with potential users and crypto communities through content sharing and discussions.",
        "Contributed to growing the visibility of a Web3 startup in a competitive blockchain ecosystem."
      ],
      image: "../assets/exp/candy.webp",
      url: "https://x.com/candy_launchpad" // URL untuk Candy Launchpad
    },
    {
      role: "Gaming Partner",
      company: "Batuta Technology Pte.Ltd (Lita App)",
      location: "Remote",
      period: "2023",
      type: "Freelance",
      description: "Provided freelance gaming services through the Lita platform, focusing on building communication skills and delivering enjoyable experiences for clients.",
      achievements: [
        "Successfully delivered 50+ sessions with consistent 5/5 star ratings from clients.",
        "Developed strong communication and teamwork skills through real-time gaming interactions.",
        "Built positive client relationships, ensuring engaging and enjoyable experiences."
      ],
      image: "../assets/exp/lita.webp",
      url: "https://www.lita.gg/user/1172999" // URL untuk Lita App
    },
    {
      role: "College Student",
      company: "Politeknik Bhakti Semesta",
      location: "Salatiga, Central Java, Indonesia",
      period: "2021 - 2025",
      type: "Student",
      description: "Currently pursuing a degree in Digital Business with a focus on technology, entrepreneurship, and web development.",
      achievements: [
        "Explored various programming languages such as Python, HTML, CSS, etc",
        "Designed and developed landing pages for small businesses, while also managing digital marketing initiatives to support their online presence.",
        "Engaged in startup projects and digital business development initiatives."
      ],
      image: "../assets/exp/poltek.webp",
      url: "https://bhaktisemesta.ac.id" // URL untuk Politeknik Bhakti Semesta
    }
  ];

  // Filter skills based on active category
  const filteredSkills = activeCategory === 'ALL' 
    ? skillCategories 
    : skillCategories.filter(cat => cat.id === activeCategory);

  return (
    <section id="about" className="relative z-20 pt-16 pb-48 overflow-hidden bg-[#0a0a1a]/70 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Profile Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cyber-text">
            MY PROFILE
          </h2>
          
        </motion.div>

        {/* Hero Section with Profile Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl mx-auto mb-16"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#0afbff]/30 shadow-lg shadow-[#0afbff]/20">
            <img 
              src={profileImage} 
              alt="Ferdy Deva Pangestu" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0afbff] font-['Orbitron']">
              Hi there!
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              I'm Ferdy Deva Pangestu
            </h2>
            <p className="text-lg text-[#0afbff]/80 font-['Share_Tech_Mono']">
              Passionate Web Engineer with 2+ years of experience specializing in modern frontend technologies and responsive design.
          </p>
            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
              <div className="flex items-center text-[#0afbff]/80 font-['Share_Tech_Mono']">
                <MapPin className="w-4 h-4 mr-2 text-[#0afbff]" />
                <span>Indonesia</span>
              </div>
              <div className="flex items-center text-[#0afbff]/80 font-['Share_Tech_Mono']">
                <Mail className="w-4 h-4 mr-2 text-[#0afbff]" />
                <span>ferdydeva@gmail.com</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0afbff] mb-2 font-['Orbitron']">LIST OF MY SKILLS SET</h2>
            <p className="text-[#0afbff]/60 font-['Share_Tech_Mono']">15+ skills across 4 categories</p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['ALL', 'FRONTEND', 'BACKEND', 'CLOUD', 'UTILITIES'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all font-['Share_Tech_Mono'] ${
                  activeCategory === category
                    ? 'bg-[#0afbff] text-[#0a0a1a]'
                    : 'bg-[#0d0d23] text-[#0afbff]/80 hover:bg-[#0afbff]/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Skills Grid - Diperbaiki agar benar-benar terpusat */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              {filteredSkills.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="cyber-card rounded-xl p-6 border border-[#0afbff]/20 hover:border-[#0afbff]/40 transition-all duration-300 mb-6"
                >
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center">
                      <category.icon className="w-6 h-6 text-[#0afbff] mr-3" />
                      <h3 className="text-xl font-bold text-[#0afbff] text-center font-['Orbitron']">{category.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {category.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-2 bg-[#0afbff]/10 text-[#0afbff]/80 rounded-full text-sm flex items-center gap-2 font-['Share_Tech_Mono']"
                        >
                          <span className="text-[#0afbff]">{skill.icon}</span>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-[#0afbff]/60 text-sm text-center font-['Share_Tech_Mono']">{category.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Biography Section dengan Expand/Collapse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="cyber-card rounded-xl p-8 border border-[#0afbff]/20">
            {/* Header dengan garis pemisah */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center mb-4">
                <div className="h-1 w-12 bg-[#0afbff] rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-[#0afbff] text-center font-['Orbitron']">
                  THE STORY OF <span className="text-[#ffffff]">FREDSZ</span>
                </h2>
                <div className="h-1 w-12 bg-[#0afbff] rounded-full ml-4"></div>
              </div>
              
              <div className="flex items-center">
                <div className="h-0.5 w-8 bg-[#0afbff]/40 mr-2"></div>
                <h3 className="text-lg font-semibold text-[#0afbff]/60 uppercase tracking-wider font-['Share_Tech_Mono']">
                  STORY OF MY LIFE
                </h3>
                <div className="h-0.5 w-8 bg-[#0afbff]/40 ml-2"></div>
              </div>
            </div>
            
            <AnimatePresence>
              {isBioExpanded ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-[#0afbff]/80 mb-4 font-['Share_Tech_Mono']">
                    Since childhood, I have been familiar with gadgets such as mobile phones and computers, although at first they were only for entertainment. During high school, I started using computers for something more productive, like creating house architecture designs. From there, my interest in the digital world began to grow.
                  </p>
                  <p className="text-[#0afbff]/80 mb-4 font-['Share_Tech_Mono']">
                    After graduating from high school, I decided to take my passion more seriously by pursuing a degree in Digital Business. In college, I began to dive deeper into programming, starting with Python, HTML, and CSS. I also explored various projects, from building landing pages for small businesses using third-party tools to experimenting with startup ideas.
                  </p>
                  <p className="text-[#0afbff]/80 mb-6 font-['Share_Tech_Mono']">
                    Today, I focus on developing myself in the field of digital business, particularly in web development. Continuing to learn, explore new technologies, and create solutions that are both practical and user-friendly. Every experience and project I take on becomes a valuable step in growing within the dynamic digital world.
                  </p>
                </motion.div>
              ) : (
                <motion.p 
                  className="text-[#0afbff]/80 mb-6 text-center font-['Share_Tech_Mono']"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Ferdy Deva Pangestu (born November 22, 2001), also known as Fredsz, is passionate about the digital business world. Starting from simple interests in gadgets and computers, he has grown into a developer who explores web development and programming while continuously learning and expanding his knowledge.
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex justify-center mt-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="flex items-center text-[#0afbff] font-medium group border border-[#0afbff]/30 px-4 py-2 rounded-lg hover:bg-[#0afbff]/10 transition-colors font-['Share_Tech_Mono']"
              >
                {isBioExpanded ? (
                  <>
                    HIDE <ChevronUp className="ml-1 h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    READ MORE <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0afbff] mb-2 font-['Orbitron']">EXPERIENCE</h2>
            <p className="text-[#0afbff]/60 font-['Share_Tech_Mono']">MY CAREER AND EDUCATION JOURNEY</p>
            <p className="text-[#0afbff]/80 mt-2 font-['Share_Tech_Mono']">
              Here's a timeline of my journey through both professional roles and educational experiences.
            </p>
          </div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div key={index} className="relative pl-8 border-l-2 border-[#0afbff]/50">
                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-[#0afbff]"></div>
                
                <div className="flex flex-col md:flex-row gap-6">
                 <div className="w-32 md:w-48 h-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d0d23] flex items-center justify-center border border-[#0afbff]/20">
  {exp.image ? (
    <img 
      src={exp.image} 
      alt={exp.company} 
      className="max-w-full max-h-full object-contain"
    />
  ) : (
    <div className="w-16 h-16 bg-[#0afbff]/20 rounded-full flex items-center justify-center">
      <ExternalLink className="w-8 h-8 text-[#0afbff]" />
    </div>
  )}
</div>


                  
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-[#0afbff] font-['Orbitron']">{exp.role}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[#0afbff] font-medium font-['Share_Tech_Mono']">{exp.company}</span>
                        <span className="text-[#0afbff]/40">•</span>
                        <span className="text-[#0afbff]/60 flex items-center font-['Share_Tech_Mono']">
                          <MapPin className="w-4 h-4 mr-1" /> {exp.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#0afbff]/60 text-sm bg-[#0afbff]/10 px-3 py-1 rounded-full font-['Share_Tech_Mono']">
                          {exp.period}
                        </span>
                        <span className="text-[#0afbff]/40 text-sm">|</span>
                        <span className="text-[#0afbff]/60 text-sm font-['Share_Tech_Mono']">{exp.type}</span>
                      </div>
                    </div>
                    
                    <p className="text-[#0afbff]/80 mb-4 font-['Share_Tech_Mono']">{exp.description}</p>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-[#0afbff] font-semibold mb-2 font-['Share_Tech_Mono']">Achievements</h4>
                        <ul className="space-y-2">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start font-['Share_Tech_Mono']">
                              <span className="text-[#0afbff] mr-2">-</span>
                              <span className="text-[#0afbff]/80">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* TAMBAHKAN TOMBOL UNTUK MENGUNJUNGI URL */}
                    {exp.url && (
                      <motion.a
                        href={exp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center text-[#0afbff] font-medium group border border-[#0afbff]/30 px-4 py-2 rounded-lg hover:bg-[#0afbff]/10 transition-colors font-['Share_Tech_Mono']"
                      >
                        Visit
                        <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;