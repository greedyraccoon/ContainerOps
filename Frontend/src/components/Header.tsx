// 1. Add the new search props to the interface
interface HeaderProps {
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// 2. Destructure them in the component
const Header = ({ onLogout, searchQuery, setSearchQuery }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        <div className="relative">
          {/* 3. Bind the input to the state */}
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-sm font-medium border border-gray-300 px-3 py-1 rounded-md">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;