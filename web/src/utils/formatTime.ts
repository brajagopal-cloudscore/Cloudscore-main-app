export const formatTimestamp = (createdAt: string) => {
  const date = new Date(createdAt.replace(/,(\d)/, ", $1")); // normalize input

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
