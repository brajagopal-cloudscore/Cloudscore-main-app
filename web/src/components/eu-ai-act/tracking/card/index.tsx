import React, { useState } from "react";
import Link from "next/link";
import { Upload, Clock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Form from "./form";
import { useEUComplianceTracking } from "../provider";
export default function Card({
  label,
  title,
  description,
  category,
}: {
  label: string;
  title: string;
  description: string;
  category: string;
}) {
  const [isOpen, toggleOpen] = useState(false);
  const { data } = useEUComplianceTracking();
  return (
    <>
      <div className="p-4 border rounded-md flex gap-2 flex-col relative">
        <div className="absolute top-3 right-3 ">
          {!data[label] ? (
            <>
              <span className="p-1.5 rounded-md text-[0.7rem] flex gap-1 items-center  bg-yellow-200 text-yellow-600">
                <Clock size={16}></Clock>
                <span>Pending</span>
              </span>
            </>
          ) : (
            <>
              <span className="p-1.5 rounded-md text-[0.7rem] flex gap-1 items-center  bg-green-200 text-green-600">
                <CheckCheck size={16}></CheckCheck>
                <span>Uploaded</span>
              </span>
            </>
          )}
        </div>
        <h2 className="text-[1rem] font-semibold">{title}</h2>
        <p className="text-[0.8rem]">{description}</p>
        <div className="w-full justify-between items-center flex mt-4">
          <p className="flex gap-1 items-center text-[0.8rem]">
            <span className="font-semibold">Category:</span>
            <span>{category}</span>
          </p>

          <Button
            onClick={() => toggleOpen((val) => !val)}
            size={"sm"}
            className="gap-2 !bg-black hover:bg-[#141414] "
          >
            {" "}
            <Upload size={14} />
            <span>Add Document</span>
          </Button>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={toggleOpen}>
        <DialogContent className="max-w-[600px] w-full max-h-[85%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[1.4rem]">Add Document</DialogTitle>
            <DialogDescription>
              <span className="text-gray-400">{title}</span>
            </DialogDescription>
            <div>
              <div className="bg-blue-200 mt-4 mb-2 border-blue-300 rounded-lg flex flex-col text-black p-3 ">
                <h2 className="text-[1rem]  text-blue-950 font-bold">
                  Document Template Available
                </h2>
                <p className="text-[0.7rem] text-blue-700">
                  Use our standardized template to ensure your document meet all
                  compliance requirements
                </p>

                <Link
                  href="#"
                  className="mt-4 font-bold text-[0.7rem]  text-blue-700"
                >
                  View Template
                </Link>
              </div>
            </div>
            <Form label={label} close={() => toggleOpen(false)}></Form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
