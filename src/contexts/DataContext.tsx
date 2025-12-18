import React, { createContext, useContext, ReactNode } from 'react';

// Empty context as all data fetching has been moved to React Query hooks
const DataContext = createContext<any>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // No global state or preloading anymore
  return (
    <DataContext.Provider value={{}}>
      {children}
    </DataContext.Provider>
  );
}

// Deprecated: Do not use. Use specific query hooks instead.
export function useData() {
  return {};
}
