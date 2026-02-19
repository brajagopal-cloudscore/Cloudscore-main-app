import React from "react";

export default function Loading() {
  return (
    <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
      <div className="mx-auto m-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Application Overview...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
