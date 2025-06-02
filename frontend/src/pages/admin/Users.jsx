import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import AddUserForm from "../../components/Users/AddUserForm";
import PageLoader from "../../components/Loader";
import UserTable from "../../components/Users/UserTable";
import ConfirmationModal from "../../components/Users/ConfirmationModal";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";
import { UserCheck, Users as UsersIcon, Shield, AlertTriangle } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null });
  const [filteredUnverified, setFilteredUnverified] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
      setFilteredUnverified(data.filter(u => !u.isVerified));
      setFilteredAdmins(data.filter(u => u.isVerified && u.role === "admin"));
      setFilteredEmployees(data.filter(u => u.isVerified && u.role === "employee"));
      setError("");
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await authService.verifyUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to verify user");
    }
  };

  const handleRemove = (userId) => {
    setConfirmModal({ open: true, userId });
  };

  const confirmRemove = async () => {
    try {
      await authService.removeUser(confirmModal.userId);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to remove user");
    } finally {
      setConfirmModal({ open: false, userId: null });
    }
  };

  const unverifiedUsers = users.filter((u) => !u.isVerified);
  const verifiedAdmins = users.filter((u) => u.isVerified && u.role === "admin");
  const verifiedEmployees = users.filter((u) => u.isVerified && u.role === "employee");

  // Prepare data for department distribution pie chart
  const departmentData = verifiedEmployees.reduce((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for user types bar chart
  const userTypeData = {
    labels: ['Unverified', 'Admins', 'Employees'],
    datasets: [{
      label: 'Number of Users',
      data: [unverifiedUsers.length, verifiedAdmins.length, verifiedEmployees.length],
      backgroundColor: [
        'rgba(30, 58, 138, 0.85)',    // Very dark blue for unverified
        'rgba(59, 130, 246, 0.85)',   // Medium blue for admins
        'rgba(147, 197, 253, 0.85)',  // Very light blue for employees
      ],
      borderColor: [
        'rgb(30, 58, 138)',
        'rgb(59, 130, 246)',
        'rgb(147, 197, 253)',
      ],
      borderWidth: 1,
      borderRadius: 8,
    }]
  };

  if (loading) return <PageLoader />;
  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-2 sm:p-6 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-2 sm:gap-0">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900">
            User Management
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer text-sm sm:text-base"
          >
            Add New User
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="mb-4 sm:mb-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-blue-100">
            <AddUserForm
              onSuccess={() => {
                fetchUsers();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Statistics Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-slate-50 to-white hover:from-slate-100 hover:to-slate-50"
          />
          <StatCard
            title="Unverified Users"
            value={unverifiedUsers.length}
            icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100 hover:to-yellow-50"
          />
          <StatCard
            title="Verified Users"
            value={verifiedAdmins.length + verifiedEmployees.length}
            icon={<UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-green-50"
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-lg sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-6 border-b border-blue-100 pb-2 sm:pb-3">
              Employees by Department
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-xl" />
              <div className="p-2 sm:p-4 min-h-[200px] sm:min-h-[280px]">
                <PieChart
                  data={Object.entries(departmentData).map(([name, value]) => ({ name, value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-lg sm:text-2xl font-semibold text-blue-900 mb-3 sm:mb-6 border-b border-blue-100 pb-2 sm:pb-3">
              Users by Type
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-xl" />
              <div className="p-2 sm:p-4 min-h-[200px] sm:min-h-[280px]">
                <BarChart data={userTypeData} />
              </div>
            </div>
          </div>
        </section>

        {/* User Lists Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-blue-100">
          <div className="space-y-4 sm:space-y-6">
            {/* Pending Verifications */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-blue-100">
              <div className="p-3 sm:p-4 border-b border-blue-100">
                <h3 className="text-base sm:text-xl font-semibold text-blue-900">Pending Verifications</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered = users.filter(u => 
                        !u.isVerified && 
                        (u.email.toLowerCase().includes(searchTerm) || 
                         u.department?.toLowerCase().includes(searchTerm))
                      );
                      setFilteredUnverified(filtered);
                    }}
                  />
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] overflow-y-auto overflow-x-hidden">
                <UserTable
                  users={filteredUnverified}
                  columns={[
                    { label: "Email", key: "email", className: "w-[35%] sm:w-1/4 truncate" },
                    { label: "Role", key: "role", className: "w-[15%] sm:w-1/6 capitalize" },
                    { label: "Dept", key: "department", className: "w-[20%] sm:w-1/6 truncate" },
                    {
                      label: "Date",
                      key: "createdAt",
                      className: "w-[20%] sm:w-1/6",
                      render: (user) => new Date(user.createdAt).toLocaleDateString(),
                    },
                  ]}
                  actions={(user) => (
                    <>
                      <button
                        key="_verify"
                        onClick={() => handleVerify(user._id)}
                        className="bg-sky-500 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-sky-600 cursor-pointer text-[10px] sm:text-sm whitespace-nowrap"
                      >
                        Verify
                      </button>
                      <button
                        key="_remove"
                        onClick={() => handleRemove(user._id)}
                        className="bg-blue-800 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-blue-900 cursor-pointer text-[10px] sm:text-sm whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </>
                  )}
                />
              </div>
            </div>

            {/* Verified Administrators */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-blue-100">
              <div className="p-3 sm:p-4 border-b border-blue-100">
                <h3 className="text-base sm:text-xl font-semibold text-blue-900">Verified Administrators</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search admins..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered = users.filter(u => 
                        u.isVerified && 
                        u.role === "admin" && 
                        (u.email.toLowerCase().includes(searchTerm) || 
                         u.department?.toLowerCase().includes(searchTerm))
                      );
                      setFilteredAdmins(filtered);
                    }}
                  />
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] overflow-y-auto overflow-x-hidden">
                <UserTable
                  users={filteredAdmins}
                  columns={[
                    { label: "Email", key: "email", className: "w-[45%] sm:w-1/4 truncate" },
                    { label: "Dept", key: "department", className: "w-[35%] sm:w-1/6 truncate" },
                    {
                      label: "Date",
                      key: "createdAt",
                      className: "w-[20%] sm:w-1/6",
                      render: (user) => new Date(user.createdAt).toLocaleDateString(),
                    },
                  ]}
                  actions={(user) => (
                    <button
                      onClick={() => handleRemove(user._id)}
                      className="bg-blue-800 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-blue-900 cursor-pointer text-[10px] sm:text-sm whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                />
              </div>
            </div>

            {/* Verified Employees */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-blue-100">
              <div className="p-3 sm:p-4 border-b border-blue-100">
                <h3 className="text-base sm:text-xl font-semibold text-blue-900">Verified Employees</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered = users.filter(u => 
                        u.isVerified && 
                        u.role === "employee" && 
                        (u.email.toLowerCase().includes(searchTerm) || 
                         u.department?.toLowerCase().includes(searchTerm))
                      );
                      setFilteredEmployees(filtered);
                    }}
                  />
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] overflow-y-auto overflow-x-hidden">
                <UserTable
                  users={filteredEmployees}
                  columns={[
                    { label: "Email", key: "email", className: "w-[45%] sm:w-1/4 truncate" },
                    { label: "Dept", key: "department", className: "w-[35%] sm:w-1/6 truncate" },
                    {
                      label: "Date",
                      key: "createdAt",
                      className: "w-[20%] sm:w-1/6",
                      render: (user) => new Date(user.createdAt).toLocaleDateString(),
                    },
                  ]}
                  actions={(user) => (
                    <button
                      onClick={() => handleRemove(user._id)}
                      className="bg-blue-800 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-blue-900 cursor-pointer text-[10px] sm:text-sm whitespace-nowrap"
                    >
                      Remove
                    </button>
                  )}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {confirmModal.open && (
        <ConfirmationModal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, userId: null })}
          onConfirm={confirmRemove}
          title="Remove User"
          message="Are you sure you want to remove this user? This action cannot be undone."
        />
      )}
    </div>
  );
}

// StatCard component
function StatCard({ title, value, icon, className }) {
  return (
    <div className={`${className} p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-white/50 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Users;