import React from "react";
import { motion } from "framer-motion";
import {
  SiDiscord,
  SiInstagram,
  SiTelegram,
  SiLinkedin,
  SiGithub,
  SiBlogger,
  SiLine,
  SiGmail,
} from "react-icons/si";

const Contact = () => {
  const contacts = [
    {
      name: "Email",
      icon: <SiGmail className="contact-icon text-pink-500" />,
      desc: "I always check up on my email daily, this is my primary contact method",
      link: "mailto:ferdydeva@gmail.com",
    },
    {
      name: "Discord",
      icon: <SiDiscord className="contact-icon text-indigo-400" />,
      desc: "I use this daily for multi purposes, add me if you need real-time conversation",
      link: "https://discordapp.com/users/758305903631138826",
    },
    {
      name: "Instagram",
      icon: <SiInstagram className="contact-icon text-pink-400" />,
      desc: "My daily basis SNS, follow me to see my daily life!",
      link: "https://instagram.com/fredsz_",
    },
    {
      name: "Telegram",
      icon: <SiTelegram className="contact-icon text-sky-400" />,
      desc: "I rarely use Telegram, but feel free to text me here anytime",
      link: "https://t.me/fredsz",
    },
    {
      name: "LinkedIn",
      icon: <SiLinkedin className="contact-icon text-blue-500" />,
      desc: "Learn more about my professional career background on LinkedIn",
      link: "https://id.linkedin.com/in/fredsz",
    },
    {
      name: "Github",
      icon: <SiGithub className="contact-icon text-gray-300" />,
      desc: "Find all my public project source code and contributions here",
      link: "https://github.com/iFredsz",
    },
   {
      name: "Blogspot",
      icon: <SiBlogger className="contact-icon text-orange-500" />,
      desc: "Read all of my published articles about tech and career journal on Blogspot",
      link: "https://bd202126.blogspot.com/",
    },

    {
      name: "Line",
      icon: <SiLine className="contact-icon text-green-500" />,
      desc: "I usually use Line to communicate with my friends in Japan",
      link: "https://line.me/ti/p/~ferdy_ghee",
    },
  ];

  return (
    <section id="contact" className="contact-section">

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 cyber-text">
            STAY IN TOUCH
          </h2>
          <p className="contact-subtitle">
            If you're interested in hiring me or collaborating, feel free to
            reach out for recruitment, partnership or follow to stay in touch
          </p>
        </motion.div>

        {/* Grid kontak */}
        <div className="contact-grid">
          {contacts.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="contact-card"
            >
              <div className="contact-card-header">
                {item.icon}
                <h3 className="contact-card-title">
                  {item.name}
                </h3>
              </div>
              <p className="contact-card-desc">{item.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Contact;