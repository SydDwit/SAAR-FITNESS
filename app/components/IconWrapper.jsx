"use client";

export default function IconWrapper({ icon: Icon, className = "", ...props }) {
  // Default styling for icons with proper rendering
  return (
    <Icon 
      className={`${className}`} 
      strokeWidth={1.5}
      size={20}
      {...props}
    />
  );
}
