export const fetchSyncDuration = (date: string) => {
  const now = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedDateTime = formatter.format(now);

  return formattedDateTime;
};

export const formatDateTime = (createdAt: string, showTime = true) => {
  const date = new Date(createdAt.replace(/,(\d)/, ", $1"));

  if (isNaN(date.getTime())) return "Invalid date";

  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${hours}:${minutes} ${suffix}`;
};

export function getTimestampAfter15Days(timestamp: string): string {
  // Parse the input timestamp
  const date = new Date(timestamp);

  // Add 15 days
  date.setDate(date.getDate() + 15);

  // Format the new date to match the input format
  return date.toISOString().replace(/\.\d{3}Z$/, ".000000Z");
}

export const getRandomDate = (): string => {
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  const randomTimestamp =
    Math.random() * (currentDate.getTime() - oneMonthAgo.getTime()) +
    oneMonthAgo.getTime();
  const randomDate = new Date(randomTimestamp);
  const year = randomDate.getFullYear();
  const month = String(randomDate.getMonth() + 1).padStart(2, "0");
  const day = String(randomDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function convertTimestampToDate(timestamp: string): string {
  // const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear().toString();

  return `${month}-${day}-${year}`;
}

export const convertDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp.replace(/,(\d)/, ", $1"));

  if (isNaN(date.getTime())) return "Invalid date";

  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${hours}:${minutes} ${suffix}`;
}

export const getcurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

export function convertDateToTimestamp(dateString: string) {
  const [year, month, day]: any = dateString.split("-");
  const date = new Date(+year, month - 1, +day).toISOString();
  return date;
}
