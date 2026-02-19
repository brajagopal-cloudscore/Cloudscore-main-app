"use client";

import SideBar from "@/components/admin/sidebar/Sidebar";
import HomeMain from "@/components/admin/home";
import "./admin.css";

const Admin = () => {
  return (
    <div className="flex  flex-col justify-between ">
      <div className="flex "></div>
      <div className="flex w-full flex-1">
        <div className="flex flex-1 flex-col h-full scrollbar-hide scroll-smooth">
          <HomeMain />
        </div>
      </div>
    </div>
  );
};

export default Admin;
