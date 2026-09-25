import { createContext, useContext, useState } from "react";

const InvestigationContext = createContext();

export function InvestigationProvider({ children }) {
    const [analysis, setAnalysis] = useState(null);

    return (
        <InvestigationContext.Provider
            value={{ analysis, setAnalysis }}
        >
            {children}
        </InvestigationContext.Provider>
    );
}

export function useInvestigation() {
    return useContext(InvestigationContext);
}