// "use client";

// import type React from "react";
// import { useState, use } from "react";
// import { useRouter } from "next/navigation";
// import { BarChart3, Shield } from "lucide-react";
// import BiasAndFairnessPage from "../../../../../bias-and-fairness/BiasAndFairnessPage";
// import BiasMonitoringTab from "./bias-monitoring-mitigation-tab";
// import {
//   UnifiedBiasFairnessDashboardProps,
//   BiasCheck,
// } from "../../../../../bias-and-fairness/page";

// interface PageProps {
//   params: Promise<{
//     tenant: string;
//     applicationId: string;
//   }>;
// }

// const UnifiedBiasFairnessDashboard: React.FC<
//   UnifiedBiasFairnessDashboardProps & { params?: PageProps["params"] }
// > = ({
//   hasBiasReadPermission = true,
//   hasBiasWritePermission = true,
//   setComponent,
//   params,
// }) => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState(0);
//   const resolvedParams = params ? use(params) : null;

//   // Modal handlers (simplified for now)
//   const handleValidateFairness = () => {
//     console.log("Opening validate fairness modal");
//   };

//   const handleAddBiasCheck = () => {
//     console.log("Opening add bias check modal");
//   };

//   const handleEditBiasCheck = (check: BiasCheck) => {
//     console.log("Opening edit bias check modal", check);
//   };

//   const handleDeleteBiasCheck = (id: string) => {
//     console.log("Opening delete confirmation modal", id);
//   };

//   const handleViewDetails = (check: BiasCheck) => {
//     console.log("Opening details modal", check);
//   };

//   const tabs = [
//     {
//       id: 0,
//       name: "Bias & fairness",
//       icon: BarChart3,
//       enabled: hasBiasReadPermission,
//     },
//     {
//       id: 1,
//       name: "Bias Monitoring",
//       icon: Shield,
//       enabled: hasBiasReadPermission,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="w-full p-4">
//         {/* Tab Navigation */}
//         <div className="mb-8">
//           <div className="border-b border-gray-200">
//             <nav className="-mb-px flex space-x-8">
//               {tabs.map((tab) => {
//                 const Icon = tab.icon;
//                 const isActive = activeTab === tab.id;
//                 const isEnabled = tab.enabled;

//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => isEnabled && setActiveTab(tab.id)}
//                     disabled={!isEnabled}
//                     className={`
//                       flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
//                       ${
//                         isActive
//                           ? "border-black text-black"
//                           : isEnabled
//                             ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                             : "border-transparent text-gray-300 cursor-not-allowed"
//                       }
//                     `}
//                   >
//                     <Icon className="w-5 h-5" />
//                     {tab.name}
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="bg-gray-50 min-h-[600px]">
//           {activeTab === 0 && <BiasAndFairnessPage />}
//           {activeTab === 1 && resolvedParams && (
//             <BiasMonitoringTab
//               tenant={resolvedParams.tenant}
//               applicationId={resolvedParams.applicationId}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function GovIQBiasMonitoringMitigationPage({
//   params,
// }: PageProps) {
//   return <UnifiedBiasFairnessDashboard params={params} />;
// }
