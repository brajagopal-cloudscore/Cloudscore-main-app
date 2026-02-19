import { format } from "date-fns";
import { URL_REGEX } from "./constants";
import { RuleGroupType, RuleType } from "react-querybuilder";
// import { QueryStack } from '@/components/Dashboard/Workspaces/ESearch/search-bar';

export const getNameInitials = (name: string) => {
  const [firstname = "", lastname = ""] = name.split(" ");
  return `${firstname[0]}${lastname[0]}`;
};

export const stringToHexCode = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let h = hash % 360;
  return `hsl(${h}, 54%, 67%)`;
};

export const isURL = (url: string): boolean => {
  return URL_REGEX.test(url);
};

/**
 * @param value value is in the format `has_xyz_abc`
 * @returns return 'Xyx Abc'
 */
export const getClassifierLabelFromValue = (value: string): string => {
  const valueWithoutVerb = value.replace("has_", "");
  const label = valueWithoutVerb
    .split("_")
    .map((str) => str.charAt(0).toUpperCase() + str.slice(1));

  return label.join(" ");
};

export const formatBytes = (bytes: number) => {
  var marker = 1024; // Change to 1000 if required
  var decimal = 2; // Change as required
  var kiloBytes = marker; // One Kilobyte is 1024 bytes
  var megaBytes = marker * marker; // One MB is 1024 KB
  var gigaBytes = marker * marker * marker; // One GB is 1024 MB

  // return bytes if less than a KB
  if (bytes < kiloBytes) return bytes + " Bytes";
  // return KB if less than a MB
  else if (bytes < megaBytes)
    return (bytes / kiloBytes).toFixed(decimal) + " KB";
  // return MB if less than a GB
  else if (bytes < gigaBytes)
    return (bytes / megaBytes).toFixed(decimal) + " MB";
  // return GB if less than a TB
  else return (bytes / gigaBytes).toFixed(decimal) + " GB";
};

export const convertBytesToMB = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

export const convertKBToGB = (kb: number): string => {
  return (kb / (1024 * 1024)).toFixed(3);
};

export const convertKBToMB = (kb: number): number => {
  return Number((Number(kb) / 1024).toFixed(2));
};

export const formatFileSize = (size: number) => {
  const bytes = size < 1 ? size * 1024 : size;

  if (isNaN(bytes) || bytes <= 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const convertedSize = bytes / Math.pow(k, i);

  return `${i === 0 ? convertedSize.toFixed(0) : convertedSize.toFixed(1)} ${sizes[i]}`;
};

export const sortConnectorMessages = (messages: any[]) => {
  const monthOrder: { [key: string]: number } = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  return messages.sort((a, b) => {
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;

    return monthOrder[b.month] - monthOrder[a.month];
  });
};

export const getISOStartOfDay = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const isoDate = new Date(Date.UTC(year, month, day, 0, 0, 0)).toISOString();
  return isoDate;
};

export const getISOEndOfDay = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const isoDate = new Date(
    Date.UTC(year, month, day, 23, 59, 59)
  ).toISOString();
  return isoDate;
};

/**
 *
 * @param timestamp in UTC or ISO format
 * @returns returns formatted date and time in current time
 */
export const getFormattedTimestamp = (
  timestamp: string,
  includeTime: boolean = true
) => {
  const date = format(timestamp, "MM/dd/yyyy");

  if (includeTime) {
    const time = format(timestamp, "hh:mm a");
    return `${date}, ${time}`;
  }
  return date;
};

export const getFormattedDateString = (
  timestamp: string,
  includeTime = true,
  includeUTCSuffix = true
) => {
  const date = new Date(timestamp.replace(/,(\d)/, ", $1")); // normalize input

  if (isNaN(date.getTime())) return "Invalid date";

  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert to 12-hour clock

  return `${month} ${day}, ${year} ${hours}:${minutes} ${suffix}`;
};

export const generateObjOfHTMLAttribute = (html: string) => {
  // Regular expression to match key-value pairs for attributes
  const regex = /(\w+)=["']([^"']+)["']/g;

  let match;
  const attributes: Record<string, string> = {};

  // Loop through all matches and add to the attributes object
  while ((match = regex.exec(html)) !== null) {
    const key = match[1];
    const value = match[2];

    attributes[key] = value;
  }

  return attributes;
};

export const getSourceValueFromLabel = (sourceName: string) => {
  return sourceName?.toLowerCase().replace(" ", "_");
};

// export const convertSearchDataToQueryBuilderFormat = (
//   queryStack: QueryStack
// ): RuleGroupType => {
//   const output: RuleGroupType = {
//     combinator: 'and', //and is default
//     not: false,
//     rules: [],
//   };

//   let currentRule: RuleType<string, string, string, string> = {
//     field: '',
//     operator: '',
//     value: '',
//   };

//   for (const item of queryStack) {
//     switch (item.type) {
//       case 'field':
//         if (Object.keys(currentRule).length > 0) {
//           // Push the completed rule
//           if (currentRule.field) {
//             output.rules.push(currentRule);
//           }
//         }
//         currentRule = { field: item.value, operator: '', value: '' }; // Start a new rule
//         break;
//       case 'operator':
//         currentRule.operator = item.value;
//         break;
//       case 'value':
//         currentRule.value = item.value;
//         break;
//       case 'combinator':
//         output.combinator = item.value;
//         break;
//     }
//   }

//   // Push the last rule if not already added
//   if (Object.keys(currentRule).length > 0) {
//     output.rules.push(currentRule);
//   }

//   console.log(output);
//   return output;
// };

export interface customRule {
  combinator: string;
  type: string;
  rules: (RuleType | RuleGroupType)[];
}

export function transformQueriesToPayload(
  queryOne: RuleGroupType,
  queryTwo: any[]
): RuleGroupType {
  const rules: customRule[] = [];

  if (queryOne?.rules?.length > 0) {
    rules.push({
      combinator: queryOne.combinator,
      type: "query",
      rules: queryOne.rules,
    });
  }

  const groupedRules: customRule[] = [];

  const groupedByTypeOnly = ["classifier", "file_type"];

  const rest = queryTwo.filter(
    (rule) => !groupedByTypeOnly.includes(rule.type)
  );
  const groupedByField = new Map();

  for (const rule of rest) {
    const key = `${rule.type}-${rule.field}`;
    if (!groupedByField.has(key)) {
      groupedByField.set(key, []);
    }
    groupedByField.get(key).push(rule);
  }

  for (const [key, rulesForField] of groupedByField.entries()) {
    const [type] = key.split("-");
    groupedRules.push({
      combinator: "or",
      type: "dynamic",
      rules: rulesForField,
    });
  }

  for (const type of groupedByTypeOnly) {
    const rulesOfType = queryTwo.filter((rule) => rule.type === type);
    if (rulesOfType.length > 0) {
      groupedRules.push({
        combinator: "or",
        type,
        rules: rulesOfType,
      });
    }
  }

  if (groupedRules.length > 0) {
    rules.push({
      combinator: "and",
      type: "search",
      rules: groupedRules,
    });
  }

  return {
    combinator: "and",
    not: false,
    rules,
  };
}

export const getStatusLabel = (status: string) =>
  ({
    paused: "Paused",
    inprogress: "In Progress",
    completed: "Completed",
    failed: "Failed",
    notstarted: "Not Started",
    attachmentfailed: "Attachment Failed",
    partiallycompleted: "Partially Completed",
  })[status] || status;

export type StatusType =
  | "inprogress"
  | "completed"
  | "paused"
  | "notstarted"
  | "failed"
  | "active";

export const getStatusStyle = (status: StatusType): string => {
  const styles: Record<StatusType, string> = {
    inprogress:
      "text-[#1797B8] border border-[#D4D4D4] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
    completed:
      "text-[#1C9852] border border-[#CBD5E1] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
    paused:
      "text-[#777777] border border-[#D4D4D4] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
    failed:
      "text-[#D84040] border border-[#D4D4D4] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
    notstarted:
      "text-[#D6A100] border border-[#D4D4D4] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
    active:
      "text-[#1C9852] border border-[#CBD5E1] border-[0.5px] font-semibold leading-normal hover:bg-white hover:text-neutral-600",
  };
  return styles[status] || styles.paused;
};

export const getStatusIconStyle = (status: StatusType): string =>
  ({
    inprogress: "w-2 h-2 rounded-full bg-[#1797B8] mr-2",
    paused: "w-2 h-2 rounded-full bg-[#777777] mr-2",
    notstarted: "w-2 h-2 rounded-full bg-[#D6A100] mr-2",
    failed: "w-2 h-2 rounded-full bg-[#D84040] mr-2",
    completed: "w-2 h-2 rounded-full bg-[#1C9852] mr-2",
    active: "w-2 h-2 rounded-full bg-[#1797B8] mr-2",
  })[status] || "";

export const getStaticFileUrl = (fileName: string) => {
  // Require environment variable - fail if not set
  const bucketName = process.env.NEXT_PUBLIC_STATIC_FILES_BUCKET;
  
  if (!bucketName) {
    throw new Error('NEXT_PUBLIC_STATIC_FILES_BUCKET environment variable is required');
  }
  
  return `https://storage.googleapis.com/${bucketName}/static/${fileName}`;
};

export const deepCompare = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    // If order matters:
    // return a.every((item, index) => deepCompare(item, b[index]));

    // If order DOESN'T matter, use this instead:
    return a.every((itemA) => b.some((itemB) => deepCompare(itemA, itemB)));
  }

  if (typeof a === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepCompare(a[key], b[key]));
  }

  return false;
};
