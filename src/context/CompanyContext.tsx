"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface CompanyContextType { companyId: number | string; companyTitle?: string; }

const CompanyContext = createContext<CompanyContextType>({ companyId: '2', companyTitle: "companyTitle" });

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ companyId, companyTitle = "", children }: {
    companyId: number | string;
    companyTitle?: string;
    children: ReactNode;
}) => {
    return (
        <CompanyContext.Provider value={{ companyId, companyTitle }}>
            {children}
        </CompanyContext.Provider>
    );
};
