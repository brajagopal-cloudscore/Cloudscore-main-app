"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import { Input, Button, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const financialServicesPolicies = [
  {
    policy_name:
      "Brokerage, Sales & Trading, and Asset Management Related Detections",
    policy_description: [
      "CFTC Dodd-Frank Swap Activity – Audio, Chat, and Emails",
      "CFTC Dodd-Frank Swap Activity – Videos",
      "FINRA Promotion, Promissory Statement, or Implied Performance Risks – Video, Audio, Chat, Attachment, and Emails",
      "SEC Reg BI Client Relationship Summary Form (Form CRS) – Attachment and Videos",
      "SEC Reg BI Client Relationship Summary Form (Form CRS) – Audio, Chat, and Emails",
    ],
    is_active: true,
  },
  {
    policy_name: "Banking Related Detections",
    policy_description: [
      "FFIEC Promotion, Credit Discussion, or Rate Comparison – Audio, Chat, and Emails",
      "FFIEC Promotion, Credit Discussion, or Rate Comparison – Videos",
    ],
    is_active: true,
  },
  {
    policy_name: "Insurance Detections",
    policy_description: [
      "Implied Performance Risks - Insurance Policies and Annuities – Audio, Chat, Attachment, and Emails",
      "Suitability Conversations – Audio and Chats",
    ],
    is_active: true,
  },
];

const financialServicesConcernPolicies = [
  {
    policy_name: "General Compliance Detections",
    policy_description: [
      "Change of Venue – Audio, Chat, Attachment, and Emails",
      "Coercive Behavior – Audio, Chat, and Emails",
      "Collusion – Audio, Chat, Attachment, and Emails",
      "Cryptocurrency Discussions – Video, Audio, Chat, Attachment, and Emails",
      "Customer Complaints - Financial Misconduct / Improprieties – Audio, Chat, and Emails",
      "Customer Complaints - General Financial – Audio, Chat, and Emails",
      "Financial Documents – Attachment, Video, and Emails",
      "Financial Logos – Videos",
      'Material Nonpublic Information ("MNPI") and Insider Tips – Audio, Chat, Attachment, and Emails',
      "Personal Self Promotion – Audio, Chat, Attachment, and Emails",
      "Risky Behavior – Audio, Chat, and Emails",
      "Stock or Mutual Fund Symbols – Audio, Chat, Attachment, and Emails",
      "Stock or Mutual Fund Symbols – Videos",
      "Trade Conversations – Audio, Chat, and Emails",
    ],
    is_active: true,
  },
];

const customPolicies = [
  {
    policy_name: "Custom Detection Rules",
    policy_description: [
      "Generic rate swap conversations",
      "Internal Projects",
      "Key watchwords",
      "Mutual Fund",
      "Proprietary documents",
    ],
    is_active: true,
  },
];

const OrganizationPolicies = () => {
  const [open, setOpen] = useState("");

  const Columns: ColumnDef<any>[] = [
    {
      accessorKey: "policy_name",
      header: "POLICY",
      cell: ({ row }) => {
        const item = row.original;
        return <div className="font-medium">{item.policy_name}</div>;
      },
    },
    {
      accessorKey: "policy_description",
      header: "DESCRIPTION",
      cell: ({ row }) => {
        const item = row.original;
        if (item.policy_description.length === 0) return null;

        return (
          <div className="space-y-2">
            {item.policy_description.map((text: string, index: number) => (
              <div key={index}>{text}</div>
            ))}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-center">
            <Switch
              checked={item.is_active}
              // onChange={() => handleUpdatePolicyStatus(item)}
              aria-label="Toggle policy status"
              className="data-[state=checked]:bg-black"
            />
          </div>
        );
      },
    },
  ];

  function DataTable<TData, TValue>({
    columns,
    data,
  }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-8 text-xs font-medium text-gray-700 uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-4 align-baseline text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-lg font-medium text-gray-500">
                      No data available
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="flex text-black flex-col h-screen">
        <div className="flex flex-1">
          <div className="flex-1  p-6">
            <div className="max-w-[1200px]">
              <div className="flex items-center  mb-4">
                <h1 className="text-xl font-semibold">Compliance Policies</h1>
                <span className="text-xs  text-gray-600 px-2 ">
                  (Coming Soon)
                </span>
              </div>

              <div className="space-y-10 mb-20">
                <section>
                  <h2 className="text-sm font-medium mb-4">
                    US Financial Services
                  </h2>
                  <DataTable
                    data={financialServicesPolicies}
                    columns={Columns}
                  />
                </section>

                <section>
                  <h2 className="text-sm font-medium mb-4">
                    General Financial Services Concerns
                  </h2>
                  <DataTable
                    data={financialServicesConcernPolicies}
                    columns={Columns}
                  />
                </section>

                <section>
                  <h2 className="text-sm font-medium mb-4">Custom</h2>
                  <DataTable data={customPolicies} columns={Columns} />
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open !== ""} onOpenChange={() => setOpen("")}>
        <DialogContent className="text-black">
          <DialogHeader>
            <span className="flex w-full items-center">
              <h2 className="flex mx-3 text-black font-semibold text-lg">
                Edit Short Text
              </h2>
            </span>
          </DialogHeader>
          {open === "edit" && (
            <>
              <Input
                label="Label*"
                name="name"
                type="text"
                placeholder="Enter Label"
                variant="bordered"
                className="text-black"
                isRequired={false}
              />
              <Textarea
                label="Message*"
                name="message"
                type="text"
                placeholder="Enter user email"
                variant="bordered"
                className="text-black"
                isRequired={false}
              />
            </>
          )}
          <DialogFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setOpen("");
              }}
            >
              Close
            </Button>
            <Button
              type="submit"
              color="primary"
              onPress={() => {
                setOpen("");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizationPolicies;
