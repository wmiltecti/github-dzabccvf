import React from 'react';


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullscreen?: boolean;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, size = 'md', fullscreen = false, children }: ModalProps) {
  if (!isOpen) return null;

  let widthClass = 'max-w-lg';
  if (size === 'xl') widthClass = 'max-w-4xl';
  else if (size === 'lg') widthClass = 'max-w-2xl';
  else if (size === 'sm') widthClass = 'max-w-sm';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${fullscreen ? '!items-start !justify-start' : ''}`} style={fullscreen ? {padding: 0, margin: 0} : {}}>
      <div
        className={
          fullscreen
            ? 'bg-white w-screen h-screen rounded-none shadow-none relative'
            : `bg-white rounded-lg shadow-lg w-full ${widthClass} mx-4 relative`
        }
        style={fullscreen ? {maxWidth: '100vw', maxHeight: '100vh'} : {}}
      >
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        </div>
        <div className={fullscreen ? '' : 'p-6 overflow-y-auto'} style={fullscreen ? {height: 'calc(100vh - 64px)', padding: 0, overflow: 'hidden'} : {maxHeight: '80vh'}}>
          {children}
        </div>
      </div>
    </div>
  );
}
