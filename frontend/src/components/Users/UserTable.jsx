const UserTable = ({ title, users, columns, actions }) => (
  <div className="mb-0 sm:mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-0.5 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border border-blue-100">
    <h3 className="text-[10px] sm:text-lg font-semibold mb-0.5 sm:mb-3 text-gray-700 border-b border-blue-100 pb-0.5 sm:pb-3">
      {title} ({users.length})
    </h3>
    <div className="overflow-x-auto bg-gray-50/50 rounded-lg">
      <table className="w-full table-fixed">
        <thead className="bg-gray-100/80">
          <tr>
            {columns.map(col => (
              <th key={col.label} className={`px-0.5 sm:px-4 py-0.5 sm:py-3 text-left text-[8px] sm:text-sm font-medium text-gray-600 ${col.className}`}>
                {col.label}
              </th>
            ))}
            {actions && <th className="px-0.5 sm:px-4 py-0.5 sm:py-3 text-left text-[8px] sm:text-sm font-medium text-gray-600 w-[60px] sm:w-[100px]">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user._id} className="hover:bg-blue-50/50 transition-colors duration-200">
              {columns.map(col => (
                <td key={col.key} className={`px-0.5 sm:px-4 py-0.5 sm:py-3 text-[8px] sm:text-sm text-gray-700 ${col.className || ''}`}>
                  {col.render ? col.render(user) : user[col.key] || 'N/A'}
                </td>
              ))}
              {actions && (
                <td className="px-0.5 sm:px-4 py-0.5 sm:py-3 text-[8px] sm:text-sm">
                  <div className="flex flex-wrap gap-0.5 sm:gap-2">{actions(user)}</div>
                </td>
              )}
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-0.5 sm:px-4 py-0.5 sm:py-3 text-center text-[8px] sm:text-sm text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserTable;
