// 'use client';
// import SideBar from '@/components/admin/sidebar/Sidebar';
// import Navbar from '../../../../components/layout/navbar/Navbar';
// import React, { useEffect } from 'react';
// import { GetApplicationUsage, GetUsage } from '@/lib/api/home';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { TbCloudNetwork } from 'react-icons/tb';
// import { PiFolderOpenLight } from 'react-icons/pi';
// import { Users } from 'lucide-react';
// import Image from 'next/image';
// import { convertKBToGB } from '@/lib/utils/helpers';

// const AdminUsage = () => {
//   const queryClient = useQueryClient();

//   const { data: usage } = useQuery({
//     queryKey: ['usage'],
//     queryFn: GetUsage,
//     select: (response) => response?.data,
//   });

//   const { data: appMetrics } = useQuery({
//     queryKey: ['appMetrics'],
//     queryFn: GetApplicationUsage,
//     select: (response) => response?.data,
//   });

//   useEffect(() => {
//     queryClient.invalidateQueries({ queryKey: ['usage'] });
//     queryClient.invalidateQueries({ queryKey: ['appMetrics'] });
//   }, []);

//   return (
//     <div className="flex text-black bg-white flex-col h-screen overflow-y-scroll justify-between w-full relative">
//       <div className="flex w-full flex-1 relative z-0">
//         <div className="fixed left-0 top-0 h-full">
//           <SideBar />
//         </div>

//         <div className="flex flex-col z-30 overflow-auto p-4 w-full mb-[30px] ml-[256px] pl-[15px] ">
//           {/* Platform Usage Metrics Section */}
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold text-[#18181B] mb-2  font-sans leading-[100%]">
//               Platform Usage Metrics
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Active Users Card */}
//               <div className="bg-white border border-[#E4E4E7] rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <Users size={32} className="h-6 w-6 text-[#71717A]" />
//                   {/* <span className="text-xs text-[#16A34A]">12% ↑</span> */}
//                 </div>
//                 <div className="">
//                   <p className="text-sm text-[#71717A]">All Users</p>
//                   <p className="text-xl font-semibold text-[#18181B]">
//                     {usage?.user_count}
//                   </p>
//                 </div>
//               </div>

//               {/* Active Workspaces Card */}
//               <div className="bg-white border border-[#E4E4E7] rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <PiFolderOpenLight
//                     size={32}
//                     className="h-6 w-6 stroke-[3px]  text-[#71717A]"
//                   />
//                   {/* <span className="text-xs text-[#16A34A]">12% ↑</span> */}
//                 </div>
//                 <div className="">
//                   <p className="text-sm text-[#71717A]">All Workspaces</p>
//                   <p className="text-xl font-semibold text-[#18181B]">
//                     {usage?.workspace_count}
//                   </p>
//                 </div>
//               </div>

//               {/* Active Connectors Card */}
//               <div className="bg-white border border-[#E4E4E7] rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <TbCloudNetwork
//                     size={32}
//                     className="h-6 w-6 text-[#71717A]"
//                   />
//                   {/* <span className="text-xs text-[#16A34A]">12% ↑</span> */}
//                 </div>
//                 <div className="">
//                   <p className="text-sm text-[#71717A]">Active connectors</p>
//                   <p className="text-xl font-semibold text-[#18181B]">
//                     {usage?.connector_sources_count}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Application Usage Metrics Section */}
//           <div>
//             <h2 className="text-xl font-semibold text-[#18181B] mb-2 font-sans leading-[100%]">
//               Application Usage Metrics
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               {appMetrics &&
//                 Object.keys(appMetrics).map((key, index) => (
//                   <div
//                     key={index}
//                     className="bg-white border border-[#E4E4E7] rounded-lg p-4"
//                   >
//                     <div className="flex items-start gap-2 w-full">
//                       <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
//                         <Image
//                           src={`https://storage.googleapis.com/ken-dev-static-files/static/${appMetrics[key].logo}`}
//                           width={20}
//                           height={20}
//                           alt={key}
//                           className="object-contain w-5 h-5"
//                         />
//                       </div>
//                       <div className="flex flex-col gap-1">
//                         <span className="text-sm font-sans leading-5 text-[#71717A]">
//                           {key}
//                         </span>
//                         <p className="text-[18px] font-sans leading-[100%] font-semibold text-[#18181B]">
//                           {convertKBToGB(appMetrics[key].size)} GB
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsage;
