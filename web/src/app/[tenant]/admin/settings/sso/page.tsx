"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import { Button, Input, Textarea, Checkbox } from "@nextui-org/react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";

const SSOSettings = () => {
  const [isOpen, setIsOpen] = useState(false);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: [
        "bg-transparent",
        "text-default-500 text-sm",
        "border-b",
        "border-divider",
      ],
      td: [
        // changing the rows border radius
        // first
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    []
  );

  return (
    <>
      <div className="flex text-black flex-col justify-between w-full">
        <div className="flex w-full flex-1">
          <div className="flex w-full flex-col px-4">
            <div className="flex flex-row items-center justify-between">
              <span className=" font-bold ">SSO Settings </span>
              <Button
                onClick={() => setIsOpen(true)}
                color="primary"
                className="font-bold"
              >
                Add New
              </Button>
            </div>
            <div className="h-[60vh] w-full flex flex-col items-center justify-center bg-none">
              <div>
                <div className="flex flex-col w-[150px] h-[150px] items-center justify-center bg-[#F6F6F6] rounded-full mb-4"></div>
                <p className="text-center text-[#737373] text-lg">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <span className="flex w-full items-center">
              <h2 className="flex mx-3 text-black font-semibold text-lg">
                New SSO
              </h2>
            </span>
          </DialogHeader>
          <Input
            label="SSO Name*"
            placeholder="Enter the SSO Name"
            type="text"
            variant="bordered"
            className="text-black"
            isRequired={false}
          />
          <Input
            label="SAML 2.0 Endpoint URL*"
            placeholder="http://"
            type="text"
            variant="bordered"
            className="text-black"
            isRequired={false}
          />
          <Input
            label="Identity provider Issuer URL*"
            placeholder="http://"
            type="text"
            variant="bordered"
            className="text-black"
            isRequired={false}
          />
          <Input
            label="Service provider Issuer URL*"
            placeholder="Enter Url"
            type="text"
            variant="bordered"
            className="text-black"
            isRequired={false}
          />
          <Textarea
            label="Public (X.509) Certificate*"
            placeholder="Active"
            type="text"
            variant="bordered"
            className="text-black"
            isRequired={false}
          />
          <div className="">
            <p className="font-normal text-gray-600 text-xs mb-[6px]">
              Service provider Issuer URL
            </p>
            <Checkbox defaultSelected>File Name</Checkbox>
          </div>
          <DialogFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button color="primary" onPress={() => setIsOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SSOSettings;
