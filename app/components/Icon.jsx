"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUser,
  faEnvelope,
  faLock,
  faBell,
  faSearch,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library
library.add(
  faUser,
  faEnvelope,
  faLock,
  faBell,
  faSearch,
  faChevronDown
);

// Map of icon names to FontAwesome icons
const iconMap = {
  user: faUser,
  mail: faEnvelope,
  email: faEnvelope,
  lock: faLock,
  bell: faBell,
  notification: faBell,
  search: faSearch,
  chevronDown: faChevronDown
};

export default function Icon({ name, className = "", size = "lg", ...props }) {
  const icon = iconMap[name];
  
  if (!icon) {
    console.error(`Icon "${name}" not found in icon map`);
    return null;
  }
  
  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={`${className} fa-fw`} // Fixed width to ensure proper alignment
      size={size}
      fixedWidth={true} // Ensures icons take up same width
      {...props}
    />
  );
}
