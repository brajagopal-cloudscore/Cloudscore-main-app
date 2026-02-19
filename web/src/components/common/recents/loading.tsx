import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Loading = ({
  hideApplicationName = false,
}: {
  hideApplicationName?: boolean;
}) => {
  return (
    <TableRow>
      {/* Created At */}
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>

      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      {/* Request URL */}

      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>

      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>

      {/* Request Blocked */}
      {hideApplicationName ? (
        <></>
      ) : (
        <>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
        </>
      )}

      {/* Latency */}
      <TableCell>
        <Skeleton className="h-4 w-14" />
      </TableCell>
      {/* Request Payload button */}
      <TableCell>
        <Skeleton className="h-8 w-20  rounded-md" />
      </TableCell>
    </TableRow>
  );
};
