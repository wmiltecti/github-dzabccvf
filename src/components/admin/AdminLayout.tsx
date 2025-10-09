import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}