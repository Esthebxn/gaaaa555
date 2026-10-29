import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import './SocialFloat.css';

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/zoomtvcanal10', Icon: FaFacebookF },
  { name: 'Instagram', href: 'https://instagram.com/zoomtv', Icon: FaInstagram },
  { name: 'YouTube', href: 'https://www.youtube.com/@goyozoom', Icon: FaYoutube },
  { name: 'X', href: 'https://twitter.com/zoomtv', Icon: FaXTwitter },
];

export default function SocialFloat() {
  return (
    <nav className="social-float" aria-label="Redes sociales de Zoom TV">
      {socialLinks.map(({ name, href, Icon }) => (
        <a
          key={name}
          className={`social-float-link social-float-${name.toLowerCase()}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visitar Zoom TV en ${name}`}
          title={name}
        >
          <Icon aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}
