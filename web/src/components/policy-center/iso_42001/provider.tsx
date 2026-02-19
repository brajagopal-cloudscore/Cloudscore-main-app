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
import { iso_42001_compliance } from "./constant";

type RecordType = Record<string, ComplianceFormDataType>;

interface ISO_42001ComplianceTrackingType {
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

const Context = createContext<ISO_42001ComplianceTrackingType | null>(null);

export const ISO_42001ComplianceTrackingProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const LOCALSTORAGE_KEY = "iso_42001.tracking";
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


  useEffect(() => {
    setData(get());
  }, []);

  const list = useMemo(() => {
    let filtered = iso_42001_compliance;

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

export const useISO_42001ComplianceTracking = () => {
  const context = useContext(Context);
  if (!context) throw new Error("This can only be used inside the provider");
  return context;
};
