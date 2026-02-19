import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FolderLoadingSkeleton = () => {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="flex flex-col">
        {[0, 1].map((userIndex) => (
          <div key={userIndex} className={`${userIndex !== 1 ? 'border-b' : ''}`}>
            {/* User header skeleton */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" /> {/* Chevron */}
                <div className="w-4 h-4 bg-blue-200 rounded-full animate-pulse" /> {/* User icon */}
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /> {/* Checkbox */}
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" /> {/* User name */}
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" /> {/* Email */}
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" /> {/* File count */}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="p-2">
              {[0, 1, 2].map((itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2 py-1.5" style={{ paddingLeft: '8px' }}>
                  <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" /> {/* Chevron */}
                  <div className="w-4 h-4 bg-blue-200 rounded animate-pulse" /> {/* Folder icon */}
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /> {/* Checkbox */}
                  <div className="flex items-center justify-between flex-1 gap-3">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" /> {/* Item name */}
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" /> {/* File size */}
                  </div>
                </div>
              ))}

              {/* Nested items skeleton */}
              {[0, 1].map((nestedIndex) => (
                <div key={nestedIndex} className="flex items-center gap-2 py-1.5 ml-8" style={{ paddingLeft: '28px' }}>
                  <div className="w-6" /> {/* Empty space for chevron */}
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /> {/* File icon */}
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" /> {/* Checkbox */}
                  <div className="flex items-center justify-between flex-1 gap-3">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" /> {/* File name */}
                    <div className="w-10 h-3 bg-gray-200 rounded animate-pulse" /> {/* File size */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderLoadingSkeleton;