import React from 'react';
import { Skeleton } from '../ui/skeleton';

const ListLoadingSkeleton = () => {
  return (
    <div className="flex p-4 gap-4 flex-col">
      {[0, 1, 2, 3].map((_, index) => (
        <div className="flex gap-2" key={index}>
          <Skeleton className="w-[20px] h-[20px] rounded-md" />
          <Skeleton className="flex-1 h-[20px] rounded-md" />
        </div>
      ))}
    </div>
  );
};

export default ListLoadingSkeleton;
