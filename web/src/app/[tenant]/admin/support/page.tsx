"use client";

import SideBar from "@/components/admin/sidebar/Sidebar";
// Removed Navbar import - using static layout instead
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

const Support = () => {
  return (
    <div className="flex-1 overflow-auto p-6">
      <h1 className="text-lg leading-[100%] font-semibold ">
        Contact Us
      </h1>
      <p className="text-[14px] font-inter leading-[22px]  mt-[23px] max-w-[650px]">
        We&lsquo;re here to help! Whether you have questions or need support,
        we&apos;re always happy to hear from you. Our team is dedicated to
        providing prompt and helpful responses to all inquiries.
      </p>
      <div className="flex flex-col items-start pl-1 ">
        <div className="mt-[26px]">
          <MessagesSquare size={36} strokeWidth={1.2} />
        </div>
        <div className="flex  mt-6">
          <div>
            <p className="font-normal text-[14px] leading-[100%] ">
              Email Us
            </p>
            <p className="text-[14px] pt-4 leading-[100%] ">
              <a href="mailto:feedback@kentron.ai" className="hover:underline">
                feedback@kentron.ai
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[38px]">
        <h1 className="text-lg  leading-[100%] font-semibold">
          Frequently Asked Questions
        </h1>
        <p className="text-[14px] leading-[22px]  mt-[38px]">
          Check out our comprehensive{" "}
          <Link
            href="https://docs.kentron.ai"
            target="_blank"
            className="text-blue-600 border-b border-[#3D3D3D] "
          >
            FAQ
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Support;
