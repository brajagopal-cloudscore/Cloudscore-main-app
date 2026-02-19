"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ComplianceFormDataType } from "@/types/compliance";
import { eu_ai_compliance } from "./constant";

type RecordType = Record<string, ComplianceFormDataType>;

interface EUComplianceTrackingType {
  update: (label: string, data: ComplianceFormDataType) => void;
  get: () => RecordType;
  data: RecordType;
  search: string;
  category: string;
  setCategory: (val: string) => void;
  setSearch: (val: string) => void;
  list: {
    label: string;
    title: string;
    description: string;
    category: string;
  }[];
}

const Context = createContext<EUComplianceTrackingType | null>(null);

export const EUComplianceTrackingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const LOCALSTORAGE_KEY = "eu.tracking";
  const [data, setData] = useState<RecordType>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const get = () => {
    const stringData = localStorage.getItem(LOCALSTORAGE_KEY);
    return JSON.parse(stringData === null ? "{}" : stringData) as RecordType;
  };

  const update = (label: string, data: ComplianceFormDataType) => {
    let exist = get();
    exist[label] = data;
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(exist));
    setData(exist);
  };

  // ✅ Load saved data once
  useEffect(() => {
    setData(get());
  }, []);

  // ✅ Compute filtered list dynamically
  const list = useMemo(() => {
    let filtered = eu_ai_compliance;

    // Priority 1: Category filter (if selected)
    if (category.trim() !== "") {
      filtered = filtered.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Priority 2: Search filter (only applies if search is not empty)
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [category, search]);

  return (
    <Context.Provider
      value={{
        get,
        update,
        data,
        search,
        setSearch,
        category,
        setCategory,
        list,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useEUComplianceTracking = () => {
  const context = useContext(Context);
  if (!context) throw new Error("This can only be used inside the provider");
  return context;
};
