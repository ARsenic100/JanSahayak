import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import { fetchAllIssuesOfEmployee } from "../../services/issueService";
import PageLoader from "../../components/Loader";
import { User, Mail, Building2, Calendar, Lock, CheckCircle, AlertTriangle, Clock, Award, Star } from "lucide-react";
import PieChart from "../../components/PieChart";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [closedIssues, setClosedIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    averageResolutionTime: 0
  });
  const [issueDistribution, setIssueDistribution] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await authService.getMyProfile();
        setProfile(response);
        setError("");
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("⚠️ Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchClosedIssues = async () => {
      try {
        const employeeId = localStorage.getItem("id");
        const response = await fetchAllIssuesOfEmployee(employeeId);
        const closed = response.filter(issue => issue.status === "Closed");
        const pending = response.filter(issue => 
          issue.status === "Assigned" && issue.resolution === "Unresolved"
        );
        const resolved = response.filter(issue => issue.resolution === "Resolved");
        
        // Calculate average resolution time for resolved issues only
        const resolvedTimes = resolved
          .filter(issue => issue.resolutionDate && issue.timestamp)
          .map(issue => {
            const reported = new Date(issue.timestamp);
            const resolved = new Date(issue.resolutionDate);
            const diffTime = Math.abs(resolved - reported);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
            return diffDays * 24; // Convert days to hours
          });
        
        const avgTime = resolvedTimes.length > 0 
          ? Math.round(resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length) 
          : 0;

        // Calculate issue distribution for pie chart
        const assignedResolved = response.filter(issue => 
          issue.status === "Assigned" && issue.resolution === "Resolved"
        ).length;
        
        const assignedUnresolved = response.filter(issue => 
          issue.status === "Assigned" && issue.resolution === "Unresolved"
        ).length;
        
        const closedResolved = response.filter(issue => 
          issue.status === "Closed" && issue.resolution === "Resolved"
        ).length;
        
        const closedUnresolved = response.filter(issue => 
          issue.status === "Closed" && issue.resolution === "Unresolved"
        ).length;

        setIssueDistribution([
          { name: "Assigned & Resolved", value: assignedResolved },
          { name: "Assigned & Unresolved", value: assignedUnresolved },
          { name: "Closed & Resolved", value: closedResolved },
          { name: "Closed & Unresolved", value: closedUnresolved }
        ]);

        setStats({
          totalIssues: response.length,
          resolvedIssues: resolved.length,
          pendingIssues: pending.length,
          averageResolutionTime: avgTime
        });
        
        setClosedIssues(closed);
      } catch (error) {
        console.error("Error fetching closed issues:", error);
      } finally {
        setIssuesLoading(false);
      }
    };

    fetchProfileData();
    fetchClosedIssues();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    try {
      await authService.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 pt-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header Section */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                Active
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-blue-900 mb-2">{profile?.name}</h2>
              <p className="text-xl text-blue-600 mb-4">{profile?.department} Department</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Lock className="w-5 h-5" />
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>
        </div>

        {/* Password Update Form */}
        {showPasswordForm && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100 mb-8">
            <h3 className="text-2xl font-semibold text-blue-900 mb-6 border-b border-blue-100 pb-3">
              Update Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-600 text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-600 text-sm">{passwordSuccess}</p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold text-blue-900">{stats.resolvedIssues}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Issues</p>
                <p className="text-2xl font-bold text-blue-900">{stats.pendingIssues}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            <div>
                <p className="text-sm text-gray-600">Avg. Resolution Time</p>
                <p className="text-2xl font-bold text-blue-900">{stats.averageResolutionTime}h</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.totalIssues > 0 
                    ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Distribution Chart and Closed Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issue Distribution Chart */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-2xl font-semibold text-blue-900 mb-6 border-b border-blue-100 pb-3">
              Issue Distribution
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-xl" />
              <div className="p-4 min-h-[280px]">
                <PieChart data={issueDistribution} />
              </div>
            </div>
          </div>

          {/* Closed Issues Section */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-3">
              <h3 className="text-2xl font-semibold text-blue-900">
                Closed Issues
              </h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {closedIssues.length} issues closed
                </span>
              </div>
            </div>
            {issuesLoading ? (
              <PageLoader />
            ) : closedIssues.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600 text-lg">No closed issues yet.</p>
                <p className="text-gray-500 text-sm mt-2">Your closed issues will appear here.</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                {closedIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="bg-white/50 hover:bg-blue-50 p-6 rounded-xl transition-all duration-300 border border-blue-100 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                        #{issue.ticketId}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        issue.resolution === "Resolved" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {issue.resolution}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2 group-hover:text-gray-900 transition-colors">
                      {issue.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                        {issue.department}
                      </span>
                      <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                        {new Date(issue.resolutionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
