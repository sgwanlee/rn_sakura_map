import React, { createContext, useContext, useState, ReactNode } from "react";

interface UpdateContextType {
  updateAvailable: boolean;
  storeVersion: string | null;
  isRequired: boolean;
  setUpdateInfo: (
    available: boolean,
    version: string | null,
    required: boolean
  ) => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider = ({ children }: { children: ReactNode }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [storeVersion, setStoreVersion] = useState<string | null>(null);
  const [isRequired, setIsRequired] = useState(false);

  const setUpdateInfo = (
    available: boolean,
    version: string | null,
    required: boolean
  ) => {
    setUpdateAvailable(available);
    setStoreVersion(version);
    setIsRequired(required);
  };

  return (
    <UpdateContext.Provider
      value={{ updateAvailable, storeVersion, isRequired, setUpdateInfo }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error("useUpdate must be used within UpdateProvider");
  }
  return context;
};
