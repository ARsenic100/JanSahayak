import { useState, useEffect } from "react";
import { fetchIssues } from "../../services/issueService";
import { authService } from "../../services/authService";
import { useLocation } from "react-router-dom";
import Filters from "../../components/Issues/Filters";
import IssuesTable from "../../components/Issues/IssuesTable";
import IssueModal from "../../components/Issues/IssuesModal";
import PageLoader from "../../components/Loader";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ dept: "", status: "", resolution: "", date: "" });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const userRole = authService.getRole();

  useEffect(() => {
    // Check if we have filters from navigation
    if (location.state?.filters) {
      const { status, resolution } = location.state.filters;
      setFilters(prev => ({
        ...prev,
        status: status || "",
        resolution: resolution || ""
      }));
    }
  }, [location]);

  useEffect(() => {
    const getIssues = async () => {
      try {
        const response = await fetchIssues();
        setIssues(response);
        setError("");
      } catch (error) {
        console.error("Error fetching issues:", error);
        setError("⚠️ Failed to load issues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getIssues();
  }, []);

  const filteredIssues = issues
    .filter((issue) => {
      const matchesDept = !filters.dept || issue.department === filters.dept;
      const matchesStatus = !filters.status || issue.status === filters.status;
      const matchesResolution =
        !filters.resolution || issue.resolution?.toLowerCase() === filters.resolution.toLowerCase();

      const formatDate = (dateString) =>
        new Date(dateString).toISOString().split("T")[0];
      const matchesDate =
        !filters.date || formatDate(issue.timestamp) === filters.date;

      return matchesDept && matchesStatus && matchesResolution && matchesDate;
    })
    .sort((a, b) => {
      const statusPriority = { Pending: 0, Assigned: 1, Closed: 2 };
      const urgencyPriority = { High: 0, Medium: 1, Low: 2 };

      const statusDiff = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      return (urgencyPriority[a.urgency] ?? 99) - (urgencyPriority[b.urgency] ?? 99);
    });

  if (loading) return <PageLoader />;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900">
            All Issues
          </h2>
        </div>

        <Filters filters={filters} setFilters={setFilters} />

        {filteredIssues.length === 0 ? (
          <div className="text-center text-gray-600 mt-4 sm:mt-16 text-sm sm:text-lg italic">
            No issues match the selected filters.
          </div>
        ) : (
          <IssuesTable issues={filteredIssues} openModal={setSelectedIssue} />
        )}

        {selectedIssue && (
          <IssueModal
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
            setIssues={setIssues}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default Issues;
