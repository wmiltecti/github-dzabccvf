import React, { createContext, useContext } from 'react';

interface InscricaoContextType {
  processoId: string | null;
}

const InscricaoContext = createContext<InscricaoContextType | undefined>(undefined);

export function InscricaoProvider({ 
  children, 
  processoId 
}: { 
  children: React.ReactNode; 
  processoId: string | null;
}) {
  return (
    <InscricaoContext.Provider value={{ processoId }}>
      {children}
    </InscricaoContext.Provider>
  );
}

export function useInscricaoContext() {
  const context = useContext(InscricaoContext);
  if (context === undefined) {
    throw new Error('useInscricaoContext must be used within InscricaoProvider');
  }
  return context;
}
