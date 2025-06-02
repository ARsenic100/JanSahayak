import { useState, useEffect } from "react";
import { updateIssue, assignIssue } from "../../services/issueService";
import { authService } from "../../services/authService";
import ImageViewer from "./ImageViewer";
import CustomSelect from "./CustomSelect";
import { AiOutlineClose } from "react-icons/ai";
import toast from "react-hot-toast";

const fieldOptionsMap = {
  status: ["Pending", "Assigned", "Closed"],
  urgency: ["High", "Medium", "Low"],
  department: [
    "Water",
    "Electricity",
    "Roads",
    "Sanitation",
    "Garbage Collection",
    "Street Lights",
    "Drainage",
    "Public Toilets",
    "Other",
  ],
  resolution: ["Resolved", "Unresolved"],
};

const editableFieldsAdmin = [
  "status",
  "urgency",
  "department",
  "comments",
  "assignedTo",
  "resolution",
  "resolutionDate",
];

const editableFieldsEmployee = ["resolution", "comments", "resolutionDate"];

const capitalize = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

const IssueModal = ({ issue, onClose, setIssues, userRole }) => {
  const [employees, setEmployees] = useState([]);
  const [currentIssue, setCurrentIssue] = useState(issue);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const isEditingAllowed = !(
    userRole === "employee" && currentIssue.status === "Closed"
  );

  const editableFields =
    userRole === "employee" ? editableFieldsEmployee : editableFieldsAdmin;

  const handleChangeField = async () => {
    if (!editField) return;

    try {
      const trimmedValue = editValue.trim();

      if (
        editField === "status" &&
        trimmedValue === "Closed" &&
        currentIssue.resolution?.toLowerCase() !== "resolved" &&
        !currentIssue.resolutionDate
      ) {
        toast.error("Please provide resolution date before closing the issue.");
        return;
      }

      let updateData = {};

      if (editField === "assignedTo") {
        const employeeId =
          trimmedValue === "null" || trimmedValue === "" ? null : trimmedValue;

        await assignIssue({
          issueId: issue._id,
          employeeId,
        });

        const assignedEmployee = employees.find((e) => e._id === employeeId);
        updateData = {
          ...currentIssue,
          status: employeeId ? "Assigned" : "Pending",
          assignedTo: assignedEmployee || null,
        };
      } else {
        const fieldUpdate = { [editField]: trimmedValue };
        const result = await updateIssue(issue.ticketId, fieldUpdate);
        updateData = { ...currentIssue, ...result };
      }

      setCurrentIssue(updateData);
      setIssues((prev) =>
        prev.map((i) => (i.ticketId === updateData.ticketId ? updateData : i))
      );

      setIsEditing(false);
      setEditField("");
      setEditValue("");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update issue. Please try again.");
    }
  };

  const getFullAddress = (loc) => {
    if (!loc) return "N/A";
    const { streetDetails, landmark, city, pincode } = loc;
    return `${streetDetails || ""}, ${landmark || ""}, ${city || ""} – ${
      pincode || ""
    }`;
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    setCurrentIssue(issue);
  }, [issue]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await authService.getAllEmployees();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch employees:", err.message);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 z-20 cursor-pointer"
          aria-label="Close Modal"
        >
          <AiOutlineClose size={24} />
        </button>

        <div className="overflow-y-auto px-8 pt-8 pb-10 max-h-[calc(90vh-3rem)] hide-scrollbar text-gray-900 font-sans">
          <h2 className="text-3xl font-bold mb-8 text-blue-700 border-b border-blue-200 pb-4">
            Issue Details
          </h2>

          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-medium">
              <div>
                <strong>Ticket ID:</strong> {currentIssue.ticketId}
              </div>
              <div>
                <strong>Status:</strong> {currentIssue.status}
              </div>
              <div>
                <strong>Department:</strong> {currentIssue.department}
              </div>
              <div>
                <strong>Urgency:</strong> {currentIssue.urgency}
              </div>
              <div>
                <strong>Phone:</strong> {currentIssue.phone?.slice(12) || "N/A"}
              </div>
              <div>
                <strong>Assigned To:</strong>{" "}
                {currentIssue.assignedTo?.name || "Not assigned"}
              </div>
              <div>
                <strong>Resolution:</strong>{" "}
                {currentIssue.resolution || "Pending"}
              </div>
              <div>
                <strong>Resolution Date:</strong>{" "}
                {currentIssue.resolutionDate
                  ? new Date(currentIssue.resolutionDate)
                      .toISOString()
                      .split("T")[0]
                  : "N/A"}
              </div>
              <div>
                <strong>Date Reported:</strong>{" "}
                {new Date(currentIssue.timestamp).toISOString().split("T")[0]}
              </div>
              <div className="col-span-2">
                <strong>Location:</strong>{" "}
                {getFullAddress(currentIssue.location)}
              </div>
            </div>

            {/* Description, Comments + Image side by side */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
              <div className="flex-1 space-y-6">
                <div>
                  <strong>Description:</strong>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {currentIssue.description || "N/A"}
                  </p>
                </div>

                <div>
                  <strong>Comments:</strong>
                  <p className="mt-2 text-gray-700 leading-relaxed">
                    {currentIssue.comments || "None"}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <strong className="block px-3 pt-2 text-gray-600">Image</strong>
                <div className="p-3">
                  {currentIssue.imageUrl ? (
                    <ImageViewer imageUrl={currentIssue.imageUrl} />
                  ) : (
                    <div className="text-center text-gray-400 italic mt-10">
                      N/A
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 pb-12">
            {isEditing && isEditingAllowed && (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Field
                </label>
                <CustomSelect
                  value={editField}
                  onChange={(val) => {
                    const sel = val;
                    let init = "";

                    if (sel) {
                      const existing = currentIssue[sel];
                      if (sel === "resolutionDate") {
                        init = existing
                          ? new Date(existing).toISOString().split("T")[0]
                          : "";
                      } else if (sel === "assignedTo") {
                        init = existing?._id || "";
                      } else {
                        init = existing || "";
                      }
                    }

                    setEditField(sel);
                    setEditValue(init);
                  }}
                  options={editableFields.map((f) => ({
                    value: f,
                    label: capitalize(f),
                  }))}
                  placeholder="Select Field to Edit"
                />

                {editField &&
                  (fieldOptionsMap[editField] ? (
                    <CustomSelect
                      value={editValue}
                      onChange={(val) => setEditValue(val)}
                      options={fieldOptionsMap[editField].map((opt) => ({
                        value: opt,
                        label: opt,
                      }))}
                      placeholder={`Select ${capitalize(editField)}`}
                    />
                  ) : editField === "assignedTo" ? (
                    <CustomSelect
                      value={editValue}
                      onChange={(val) => setEditValue(val)}
                      options={[
                        { value: "null", label: "None (Unassign)" },
                        ...employees.map((emp) => ({
                          value: emp._id,
                          label: emp.name,
                        })),
                      ]}
                      placeholder="Select Employee"
                    />
                  ) : editField === "resolutionDate" ? (
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                      rows={3}
                      placeholder={`Enter ${capitalize(editField)}`}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ))}
              </div>
            )}

            {isEditingAllowed && (
              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-md font-semibold cursor-pointer"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setEditField("");
                    setEditValue("");
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Cancel Editing" : "Edit Field"}
              </button>
            )}

            {isEditing && isEditingAllowed && (
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md font-semibold disabled:opacity-50 cursor-pointer"
                disabled={!editValue.trim()}
                onClick={handleChangeField}
              >
                Save Changes
              </button>
            )}

            {!isEditingAllowed && (
              <p className="text-center text-gray-500 italic">
                This issue is closed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
