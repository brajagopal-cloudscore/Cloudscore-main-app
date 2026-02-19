import React, { useMemo } from "react";
import { useEUComplianceTracking } from "./provider";

export default function Progress() {
  const { data } = useEUComplianceTracking();
  const percentage = useMemo(() => {
    const done = Object.keys(data).length;
    return (done / 20) * 100;
  }, [data]);

  const done = useMemo(() => {
    return Object.keys(data).length;
  }, [data]);
  return (
    <div className="p-4 border rounded-md flex flex-col gap-2 justify-start">
      <div>
        <h2 className="text-[1rem] font-semibold mb-1">Compliance Progress</h2>
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[0.7rem] text-gray-600">
          {done} of 20 controls documented
        </span>

        <div className="flex gap-4 items-center ">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <span className="text-[0.7rem] text-gray-500 text-right">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
