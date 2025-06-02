import { useEffect, useState } from 'react';
import { fetchIssueStats } from '../../services/issueService'
import { useNavigate } from 'react-router-dom';
import PageLoader from '../../components/Loader';
import PieChart from '../../components/PieChart';
import BarChart from '../../components/BarChart';
import { ClipboardList, UserCheck, Clock, CheckCircle, XCircle, Archive } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [hoveredStat, setHoveredStat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchIssueStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Something went wrong while fetching stats.');
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  // urgency data for the bar chart
  const urgencyData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      label: 'Number of Issues',
      data: [
        stats?.byUrgency?.high || 0,
        stats?.byUrgency?.medium || 0,
        stats?.byUrgency?.low || 0
      ],
      backgroundColor: [
        'rgba(0, 41, 82, 0.85)',     // Midnight Blue (darkest) for high
        'rgba(0, 98, 204, 0.85)',    // Darker Blue (medium) for medium
        'rgba(204, 229, 255, 0.85)', // Ice Blue (lightest) for low
      ],
      borderColor: [
        'rgb(0, 41, 82)',
        'rgb(0, 98, 204)',
        'rgb(204, 229, 255)',
      ],
      borderWidth: 1,
      borderRadius: 8,
      hoverBackgroundColor: [
        'rgba(0, 41, 82, 1)',
        'rgba(0, 98, 204, 1)',
        'rgba(204, 229, 255, 1)',
      ],
    }]
  };

  const handleStatClick = (type) => {
    let filterParams = {};
    
    switch(type) {
      case 'total':
        // No filters for total
        break;
      case 'assigned':
        filterParams = { status: 'Assigned' };
        break;
      case 'pending':
        filterParams = { status: 'Pending' };
        break;
      case 'resolved':
        filterParams = { resolution: 'Resolved' };
        break;
      case 'unresolved':
        filterParams = { resolution: 'Unresolved' };
        break;
      case 'closed':
        filterParams = { status: 'Closed' };
        break;
      default:
        break;
    }

    // Navigate to issues page with filters
    navigate('/admin/issues', { state: { filters: filterParams } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900">
            Admin Dashboard
          </h2>
        </div>

        {/* Statistics Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Issues"
            value={stats?.total || 0}
            icon={<ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('total')}
            isHovered={hoveredStat === 'total'}
            onClick={() => handleStatClick('total')}
          />
          <StatCard
            title="Assigned Issues"
            value={stats?.assigned || 0}
            icon={<UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-cyan-50 to-white hover:from-cyan-100 hover:to-cyan-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('assigned')}
            isHovered={hoveredStat === 'assigned'}
            onClick={() => handleStatClick('assigned')}
          />
          <StatCard
            title="Pending Issues"
            value={stats?.pending || 0}
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-yellow-50 to-white hover:from-yellow-100 hover:to-yellow-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('pending')}
            isHovered={hoveredStat === 'pending'}
            onClick={() => handleStatClick('pending')}
          />
          <StatCard
            title="Resolved Issues"
            value={stats?.resolved || 0}
            icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-green-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('resolved')}
            isHovered={hoveredStat === 'resolved'}
            onClick={() => handleStatClick('resolved')}
          />
          <StatCard
            title="Unresolved Issues"
            value={stats?.unresolved || 0}
            icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-red-50 to-white hover:from-red-100 hover:to-red-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('unresolved')}
            isHovered={hoveredStat === 'unresolved'}
            onClick={() => handleStatClick('unresolved')}
          />
          <StatCard
            title="Closed Issues"
            value={stats?.closed || 0}
            icon={<Archive className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            onHover={() => setHoveredStat('closed')}
            isHovered={hoveredStat === 'closed'}
            onClick={() => handleStatClick('closed')}
          />
        </section>

        {/* Charts and Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-2 sm:p-5 lg:p-8 rounded-md sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-sm sm:text-lg lg:text-2xl font-semibold text-blue-900 mb-2 sm:mb-3 lg:mb-6 border-b border-blue-100 pb-1 sm:pb-2 lg:pb-3">
              Issues by Department
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-md sm:rounded-xl" />
              <div className="p-0.5 sm:p-2 lg:p-4 min-h-[60px] sm:min-h-[200px] lg:min-h-[280px]">
                <PieChart
                  data={Object.entries(stats.byDepartment)
                    .filter(([_, value]) => value > 0)
                    .map(([name, value]) => ({ name, value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-2 sm:p-5 lg:p-8 rounded-md sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-sm sm:text-lg lg:text-2xl font-semibold text-blue-900 mb-2 sm:mb-3 lg:mb-6 border-b border-blue-100 pb-1 sm:pb-2 lg:pb-3">
              Issues by Urgency
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-md sm:rounded-xl" />
              <div className="p-1 sm:p-2 lg:p-4 min-h-[80px] sm:min-h-[200px] lg:min-h-[280px]">
                <BarChart data={urgencyData} />
              </div>
            </div>
          </div>
        </section>

        {/* Municipal Corporations Section */}
        <section className="mb-5 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-5 lg:p-8 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] border border-blue-100">
            <h3 className="text-base sm:text-lg lg:text-2xl font-semibold text-blue-900 mb-2.5 sm:mb-3 lg:mb-6 border-b border-blue-100 pb-1.5 sm:pb-2 lg:pb-3">
              Municipal Corporations in Madhya Pradesh
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white/30 rounded-lg sm:rounded-xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-8">
                {/* Map Section */}
                <div className="h-[250px] sm:h-[350px] lg:h-[500px] bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 relative group overflow-hidden">
                  <img 
                    src="/assets/mp.avif" 
                    alt="Madhya Pradesh Map" 
                    className="w-full h-full object-cover rounded-lg transition-all duration-300 transform scale-110 group-hover:scale-125 group-hover:shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all duration-300 rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg">
                      <p className="text-xs sm:text-sm lg:text-base text-blue-900 font-medium">Madhya Pradesh Municipal Corporations</p>
                    </div>
                  </div>
                </div>

                {/* Corporations List */}
                <div className="h-[250px] sm:h-[350px] lg:h-[500px] overflow-y-auto p-2 sm:p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                    {[
                      "Bhopal Municipal Corporation",
                      "Chhindwara Municipal Corporation",
                      "Dewas Municipal Corporation",
                      "Gwalior Municipal Corporation",
                      "Indore Municipal Corporation",
                      "Jabalpur Municipal Corporation",
                      "Katni Municipal Corporation",
                      "Khandwa Municipal Corporation",
                      "Murwara Municipal Corporation",
                      "Rewa Municipal Corporation",
                      "Sagar Municipal Corporation",
                      "Ujjain Municipal Corporation"
                    ].map((corporation) => (
                      <div
                        key={corporation}
                        className="bg-white/50 hover:bg-blue-50 p-2 sm:p-2.5 lg:p-3 rounded-lg transition-all duration-300 border border-blue-100 flex flex-col justify-center group cursor-pointer transform hover:scale-105 hover:shadow-lg hover:border-blue-300"
                      >
                        <div className="relative">
                          <h4 className="text-xs sm:text-sm lg:text-base font-semibold text-blue-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">{corporation}</h4>
                          <p className="text-[10px] sm:text-xs lg:text-sm text-blue-600 mt-1 group-hover:text-blue-500 transition-colors duration-300">Active</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, className, onHover, isHovered, onClick }) {
  return (
    <div
      className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/60 rounded-lg backdrop-blur-sm">
        {icon}
      </div>
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-sm sm:text-base text-gray-600 mb-2 leading-tight font-semibold">{title}</p>
          <p className="text-3xl sm:text-4xl font-bold text-black">{value}</p>
        </div>
        {isHovered && (
          <p className="text-xs sm:text-sm text-gray-700 mt-auto leading-tight">Click to view details</p>
        )}
      </div>
    </div>
  );
}
