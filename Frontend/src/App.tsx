import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { 
  Login, Trips, Shipments, Drivers, Vehicles, 
  Containers, Customers, Expenses, Invoices 
} from './pages';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 🔥 NEW: Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setAuth={setIsAuthenticated} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 🔥 Pass search state and setter to Header */}
          <Header 
            onLogout={handleLogout} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            <Routes>
              <Route path="/" element={<div>Dashboard</div>} />
              
              {/* Other Routes */}
              <Route path="/trips" element={<Trips />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/vehicles" element={<Vehicles />} />
              
              {/* 🔥 Pass the searchQuery down to the pages that need it */}
              <Route path="/containers" element={<Containers searchQuery={searchQuery} />} />
              <Route path="/customers" element={<Customers searchQuery={searchQuery} />} />
              <Route path="/expenses" element={<Expenses />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;