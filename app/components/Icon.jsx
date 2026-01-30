"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUser,
  faEnvelope,
  faLock,
  faBell,
  faSearch,
  faChevronDown,
  faPlus,
  faTableCells,
  faUsers,
  faBriefcase,
  faChartBar,
  faGear,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faBars,
  faUserPlus,
  faCalendar,
  faXmark,
  faEye,
  faPenToSquare,
  faTrashCan,
  faCheck,
  faExclamationTriangle,
  faDownload,
  faFileExport,
  faFilter,
  faCamera,
  faArrowLeft,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library
library.add(
  faUser,
  faEnvelope,
  faLock,
  faBell,
  faSearch,
  faChevronDown,
  faPlus,
  faTableCells,
  faUsers,
  faBriefcase,
  faChartBar,
  faGear,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
  faBars,
  faUserPlus,
  faCalendar,
  faXmark,
  faEye,
  faPenToSquare,
  faTrashCan,
  faCheck,
  faExclamationTriangle,
  faDownload,
  faFileExport,
  faFilter,
  faCamera,
  faArrowLeft,
  faCheckCircle
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
  chevronDown: faChevronDown,
  plus: faPlus,
  grid: faTableCells,
  users: faUsers,
  briefcase: faBriefcase,
  'bar-chart-2': faChartBar,
  settings: faGear,
  'log-out': faRightFromBracket,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  menu: faBars,
  'user-plus': faUserPlus,
  calendar: faCalendar,
  x: faXmark,
  eye: faEye,
  'pen-to-square': faPenToSquare,
  'trash-can': faTrashCan,
  check: faCheck,
  'exclamation-triangle': faExclamationTriangle,
  download: faDownload,
  'file-export': faFileExport,
  filter: faFilter,
  camera: faCamera,
  'arrow-left': faArrowLeft,
  'check-circle': faCheckCircle
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
