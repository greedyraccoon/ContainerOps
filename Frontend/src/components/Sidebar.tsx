import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Trips & Dispatch', path: '/trips' },
    { name: 'EXIM Shipments', path: '/shipments' },
    { name: 'Drivers', path: '/drivers' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Containers', path: '/containers' }, 
    { name: 'Customers', path: '/customers' },   
    { name: 'Expenses', path: '/expenses' },     
    { name: 'Financials & Invoices', path: '/invoices' },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-900 h-full text-white">
      {/* Logo Area */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">
          CONTAINER<span className="text-white">OPS</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">System Operator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

