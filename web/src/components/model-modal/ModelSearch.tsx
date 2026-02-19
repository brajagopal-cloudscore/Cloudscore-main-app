import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WorkspaceSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const WorkspaceSearch: React.FC<WorkspaceSearchProps> = ({ search, onSearchChange }) => {
  return (
    <div className="flex items-center justify-start">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search"
          name="workspace-search"
          className="rounded-md w-[343px] h-[36px] pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
          aria-label="workspace-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search
          size={12}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#71717A]"
        />
      </div>
    </div>
  );
};

export default WorkspaceSearch;
