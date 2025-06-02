const Filters = ({ filters, setFilters }) => {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-4 mb-2 sm:mb-6">
      {/* Department Filter */}
      <select
        className="p-1 sm:p-2 border rounded-md cursor-pointer text-[10px] sm:text-sm"
        value={filters.dept}
        onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
      >
        <option value="">Filter by Dept</option>
        <option value="Water">Water</option>
        <option value="Electricity">Electricity</option>
        <option value="Roads">Road</option>
        <option value="Sanitation">Sanitation</option>
        <option value="Garbage Collection">Garbage Collection</option>
        <option value="Street Lights">Street Lights</option>
        <option value="Drainage">Drainage</option>
        <option value="Public Toilets">Public Toilets</option>
        <option value="Other">Other</option>
      </select>

      {/* Date Filter */}
      <input
        type="date"
        className="p-1 sm:p-2 border rounded-md cursor-pointer text-[10px] sm:text-sm"
        value={filters.date}
        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
      />

      {/* Status Filter */}
      <select
        className="p-1 sm:p-2 border rounded-md cursor-pointer text-[10px] sm:text-sm"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">Filter by Status</option>
        <option value="Pending">Pending</option>
        <option value="Assigned">Assigned</option>
        <option value="Closed">Closed</option>
      </select>

      {/* Resolution Filter */}
      <select
        className="p-1 sm:p-2 border rounded-md cursor-pointer text-[10px] sm:text-sm"
        value={filters.resolution}
        onChange={(e) => setFilters({ ...filters, resolution: e.target.value })}
      >
        <option value="">Filter by Resolution</option>
        <option value="Resolved">Resolved</option>
        <option value="Unresolved">Unresolved</option>
      </select>
    </div>
  );
};

export default Filters;