import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface ListSkeletonProps {
  columns?: number;
}

const ListSkeleton = ({ columns = 10 }: ListSkeletonProps) => {
  const rows = 10;

  return (
    <div className="w-full space-y-4 py-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 pt-1"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-[20px] w-[95%] rounded-md"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
