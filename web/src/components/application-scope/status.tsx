"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast"; 

const LOCAL_STORAGE_KEY = "applicationStatus_draft";
const STATUS_OPTIONS = [
  "ideation",
  "inreview",
  "approved",
  "archived",
];

const getInitialStatus = (): string => {
  if (typeof window !== "undefined") {
    const savedStatus = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedStatus || "ideation"; 
  }
  return "ideation"; 
};

export default function ApplicationStatus() {

  const [status, setStatus] = useState<string>(getInitialStatus);
  useEffect(() => {
    
    const lastSavedStatus = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (status !== lastSavedStatus) {
    
      localStorage.setItem(LOCAL_STORAGE_KEY, status);
      console.log(`Status auto-saved: ${status}`);
   
      toast.success(`Status updated to ${status.toUpperCase()}`, { duration: 1500 });
    }
  }, [status]);


  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  
  };

  return (
    <div className="flex gap-2 items-center text-black">
      <h2 className="text-[0.8rem]">Status:</h2>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px] text-black">
       
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="">
         
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
        
              {option.charAt(0).toUpperCase() +
                option.slice(1).replace("inreview", "In Review")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
