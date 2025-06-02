import { useState, useEffect } from "react";
import { fetchAllIssuesOfEmployee } from "../../services/issueService";
import { authService } from "../../services/authService";
import IssuesTable from "../../components/Issues/IssuesTable";
import IssueModal from "../../components/Issues/IssuesModal";
import PageLoader from "../../components/Loader";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const employeeId = localStorage.getItem("id");
  const userRole = authService.getRole();

  useEffect(() => {
    const getIssues = async () => {
      try {
        const response = await fetchAllIssuesOfEmployee(employeeId);

        const sortedIssues = response.sort((a, b) => {
          const statusPriority = { Assigned: 0, Closed: 1 };
          const urgencyPriority = { High: 0, Medium: 1, Low: 2 };

          const statusDiff =
            (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
          if (statusDiff !== 0) return statusDiff;

          return (
            (urgencyPriority[a.urgency] ?? 99) -
            (urgencyPriority[b.urgency] ?? 99)
          );
        });

        setIssues(sortedIssues);
        setError("");
      } catch (error) {
        console.error("Error fetching issues:", error);
        setError("⚠️ Failed to load issues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getIssues();
  }, [employeeId]);

  if (loading) return <PageLoader />;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 pt-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center text-blue-700 drop-shadow-md">
          Assigned Issues
        </h2>

        {issues.length === 0 ? (
          <div className="text-center text-gray-600 mt-16 text-lg italic">
            No issues assigned to you at the moment.
          </div>
        ) : (
          <IssuesTable issues={issues} openModal={setSelectedIssue} />
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
