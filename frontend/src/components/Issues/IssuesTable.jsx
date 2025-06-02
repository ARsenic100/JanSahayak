import { FaHourglassHalf, FaClipboardCheck, FaCheckCircle, FaFireAlt, FaExclamationTriangle, FaLeaf } from "react-icons/fa";

export default function IssuesTable({ issues, openModal }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Assigned":
        return "bg-blue-100 text-blue-800";
      case "Closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglassHalf className="text-yellow-500" />;
      case "Assigned":
        return <FaClipboardCheck className="text-blue-500" />;
      case "Closed":
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "High":
        return <FaFireAlt className="text-red-500" />;
      case "Medium":
        return <FaExclamationTriangle className="text-yellow-600" />;
      case "Low":
        return <FaLeaf className="text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-1 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl ring-1 ring-blue-100">
      <div className="overflow-x-auto rounded-lg sm:rounded-xl">
        <table className="w-full text-[10px] sm:text-sm text-left">
          <thead className="bg-blue-200 text-blue-900 text-center uppercase text-[8px] sm:text-xs tracking-wide rounded-t-lg sm:rounded-t-xl">
            <tr>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3 rounded-tl-lg sm:rounded-tl-xl">ID</th>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3">Department</th>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3">Date</th>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3">Status</th>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3">Urgency</th>
              <th className="px-1 sm:px-5 py-1.5 sm:py-3 rounded-tr-lg sm:rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {issues.map((issue, index) => (
              <tr
                key={issue._id}
                className={`transition duration-150 ${
                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100`}
              >
                <td className="px-1 sm:px-5 py-1.5 sm:py-4 font-semibold text-gray-800">{issue.ticketId}</td>
                <td className="px-1 sm:px-5 py-1.5 sm:py-4">{issue.department}</td>
                <td className="px-1 sm:px-5 py-1.5 sm:py-4">
                  {new Date(issue.timestamp).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-1 sm:px-5 py-1.5 sm:py-4">
                  <span
                    className={`inline-flex items-center gap-0.5 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getStatusStyle(
                      issue.status
                    )}`}
                  >
                    {getStatusIcon(issue.status)}
                    {issue.status}
                  </span>
                </td>
                <td className="px-1 sm:px-5 py-1.5 sm:py-4">
                  <span
                    className={`inline-flex items-center gap-0.5 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-medium ${getUrgencyStyle(
                      issue.urgency
                    )}`}
                  >
                    {getUrgencyIcon(issue.urgency)}
                    {issue.urgency}
                  </span>
                </td>
                <td className="px-1 sm:px-5 py-1.5 sm:py-4">
                  <button
                    onClick={() => openModal(issue)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-sm font-medium shadow-md transition cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
