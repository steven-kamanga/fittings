export const getStatusStyles = (status) => {
  switch (status) {
    case "submitted":
      return "bg-green-100 text-green-600";
    case "scheduled":
      return "bg-amber-100 text-amber-700";
    case "completed":
      return "bg-blue-100 text-blue-700";
    case "canceled":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
};
