"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Switch,
} from "@nextui-org/react";
import React from "react";

const DataClassificationPolicies = () => {
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

  const data = [
    {
      id: 1,
      classifier: "Adult, racy, and gory images",
      description:
        "Detects images that are potentially inappropriate. Scanning and detection are supported for Exchange Online email messages, and Microsoft Teams channels and chats.",
      fileTypes: "Detects content in .jpeg, .png, .gif, and .bmp files.",
      languages: "N/A",
      summary: "N/A",
      isEnabled: false,
    },
    {
      id: 2,
      classifier: "Agreements",
      description:
        "Detects content related to legal agreements such as nondisclosure agreements, statements of work, loan and lease agreements, employment and noncompete agreements.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 3,
      classifier: "Bank statement",
      description:
        "Detects items that contain a financial transaction of a bank account including account information, deposits, withdrawals, account balance, interest accrued and bank charges within a given period.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 4,
      classifier: "Budget",
      description:
        "Detects budget documents, budget forecasts and current budget statements including income and expenses of an organization.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .eml, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa, .xlsx, .xlsm, .xlsb, .xls, .csv, .xltx, .xltm, .xlt, .xlam, .xla files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 5,
      classifier: "Business context",
      description:
        "Detects presence of business-related content such as organizational structure, policy updates, contracts, HR policies, crucial financial data such as revenue and profits, healthcare forms, employee contracts ect",
      fileTypes:
        "Detects content in docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa, .txt files.",
      languages: "English",
      summary: "N.A.",
      isEnabled: false,
    },
    {
      id: 6,
      classifier: "Business plan",
      description:
        "Detects components of a business plan including business opportunity, plan of achieving the outcomes, market study and competitor analysis.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .eml, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa files.",
      languages: "English",
      summary: "No",
      isEnabled: false,
    },
    {
      id: 7,
      classifier: "Completion certificates",
      description:
        "Detects official documents that are issued at the end of a project or work by a project manager or a contractor. This document is used to testify that work on a particular project has been completed as per a contract or an agreement.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 8,
      classifier: "Construction specifications",
      description:
        "Detects construction specifications for commercial and industrial projects like factories, plants, commercial offices, airports, roads.",
      fileTypes:
        "Captures guidelines on the quality, quantity, types of building material, processes etc. Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 9,
      classifier: "Corporate sabotage",
      description:
        "Detects content in .msg, .docx, .pdf, .txt, .rtf, .jpeg, .jpg, .png, .gif, .bmp, .svg files.",
      fileTypes:
        "Detects content in .msg, .docx, .pdf, .txt, .rtf, .jpeg, .jpg, .png, .gif, .bmp, .svg files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 10,
      classifier: "Customer complaints",
      description:
        "The customer complaints classifier detects feedback and complaints made about your organization's products or services. This classifier can help you meet regulatory requirements on the detection and triage of complaints, like the Consumer Financial Protection Bureau and Food and Drug Administration requirements.",
      fileTypes:
        "For Communications Compliance, it detects content in .msg, and .eml files. For the rest of Microsoft Purview Information Protection services, it detects content in .docx, .pdf, .txt, .rtf, .jpg, .jpeg, .png, .gif, .bmp, .svg files.",
      languages: "English",
      summary: "No",
      isEnabled: false,
    },
    {
      id: 11,
      classifier: "Discrimination",
      description:
        "Detects explicit discriminatory language and is sensitive to discriminatory language against the African American/Black communities when compared to other communities.",
      fileTypes:
        "This applies to Communications Compliance, it's a text based classifier.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 12,
      classifier: "Employee disciplinary action",
      description:
        "Detects files relating to disciplinary action including a reprimand or corrective action in response to employee misconduct, rule violation, or poor performance.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 13,
      classifier: "Employee insurance",
      description:
        "Detects documents pertaining to employee medical insurance and workplace disability insurance.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 14,
      classifier: "Employment agreement",
      description:
        "Detects employment agreement containing details like the starting date, salary, compensation, duties of employment.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 15,
      classifier: "Employee pension records",
      description:
        "Detects documents that are related to employee's pension records such as claim forms, declaration forms, schemes, and benefit statement.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa, .txt, .one, .msg, .eml files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 16,
      classifier: "Employee stocks and financial bond records",
      description:
        "Detects documents that are related stock and financial bonds award by organization to employees. This classifier identifies employee stocks and financial bonds details that fall under employee's payroll. Contains details like bond clause, allocations, equity.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa, .txt, .one, .msg, .eml files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 17,
      classifier: "Enterprise risk management",
      description:
        "Enterprise risk management includes financial risks, strategic risks, operational risks and risks associated with accidental losses. This category consists of methods used by organizations to manage risks and seize opportunities related to the achievement of their objectives.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 18,
      classifier: "Finance",
      description:
        "Detects content in corporate finance, accounting, economy, banking, and investment categories.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml, .pptx, .pptm, .ppt, .potx, .potm, .pot, .ppsx, .ppsm, .pps, .ppam, .ppa, .xlsx, .xlsm, .xlsb, .xls, .csv, .xltx, .xltm, .xlt, .xlam, .xla files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
    {
      id: 19,
      classifier: "Financial audit",
      description:
        "Detects files, documents and reports pertaining to financial audit, both external or internal audit undertaken in an organization.",
      fileTypes:
        "Detects content in .docx, .docm, .doc, .dotx, .dotm, .dot, .pdf, .rtf, .txt, .one, .msg, .eml files.",
      languages: "English",
      summary: "Yes",
      isEnabled: false,
    },
  ];

  return (
    <div className="flex text-black flex-col justify-between w-full">
      <div className="flex w-full">
        <div className="flex w-full flex-col px-4">
          <span className=" font-bold ">Data Classification Policies </span>

          <div className="w-full mt-4">
            <Table
              classNames={classNames}
              removeWrapper
              aria-label="Example static collection table"
            >
              <TableHeader>
                <TableColumn className="text-sm w-[20%]">
                  CLASSIFIER
                </TableColumn>
                <TableColumn className="text-sm w-[30%]">
                  DESCRIPTION
                </TableColumn>
                <TableColumn className="text-sm w-[20%]">
                  FILE TYPES
                </TableColumn>
                <TableColumn className="text-sm w-[10%]">LANGUAGE</TableColumn>
                <TableColumn className="text-sm w-[10%]">
                  CONTEXTUAL SUMMARY
                </TableColumn>
                <TableColumn className="text-sm w-[10%]">STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index} className="border-b-1">
                    <TableCell>
                      <p className="flex text-sm font-bold">
                        {item.classifier}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[#1616168A] text-sm">
                        {item.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[#1616168A] text-sm">
                        {item.fileTypes}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[#1616168A] text-sm">
                        {item.languages}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-[#1616168A] text-sm">{item.summary}</p>
                    </TableCell>
                    <TableCell>
                      <Switch defaultSelected aria-label="Automatic updates" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataClassificationPolicies;
