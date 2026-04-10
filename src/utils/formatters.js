import { format } from "date-fns";

export const formatDate = (value) => {
  if (!value) return "N/A";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return format(date, "dd MMM yyyy");
};

export const gradeFromScore = (score, total) => {
  if (!total) return "N/A";
  const percentage = (Number(score) / Number(total)) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};
