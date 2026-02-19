import React from 'react';
import { Skeleton } from '../ui/skeleton';

const SearchDetailsViewSkeleton = () => {
  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-8 w-3/4 rounded-md" />
        
        <div className="ml-auto flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-30 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <Skeleton className="h-[100vh] w-full rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
};

export default SearchDetailsViewSkeleton;
