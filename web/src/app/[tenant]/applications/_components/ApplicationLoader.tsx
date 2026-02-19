import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
export default function ApplicationLoader() {
  return (
    <>
      <TableRow className="animate-pulse">
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-6  " />
        </TableCell>
      </TableRow>
      <TableRow className="animate-pulse">
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-6  " />
        </TableCell>
      </TableRow>
      <TableRow className="animate-pulse">
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-56  " />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-6  " />
        </TableCell>
      </TableRow>
    </>
  );
}
