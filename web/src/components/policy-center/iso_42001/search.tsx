import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { useISO_42001ComplianceTracking } from "./provider";
import { iso_42001_compliance } from "./constant";

export default function Search() {
  const { setSearch, search, category, setCategory } =
    useISO_42001ComplianceTracking();

  const categories = useMemo(() => {
    const allCategories = iso_42001_compliance.map((item) => item.category);
    return Array.from(new Set(allCategories.filter(Boolean)));
  }, []);

  return (
    <div className="p-4 border rounded-md flex gap-10">
      <div className="relative w-full">
        <SearchIcon
          className="absolute top-1/2 -translate-y-1/2 stroke-[#c1c1c1] translate-x-2"
          size={20}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 pl-8"
        />
      </div>
      <Select
        value={category || "all"}
        onValueChange={(val) => setCategory(val === "all" ? "" : val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>

          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
