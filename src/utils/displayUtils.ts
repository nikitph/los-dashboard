import { format } from "date-fns";

export function formatDate(date: Date | string) {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy");
}
