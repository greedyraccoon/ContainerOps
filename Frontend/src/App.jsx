import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar Component Will Go Here */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Component Will Go Here */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
            <Routes>
              <Route path="/" element={<h1 className="text-3xl font-bold text-gray-800">Dashboard / Analytics</h1>} />
              <Route path="/trips" element={<h1 className="text-3xl font-bold text-gray-800">Trip Management</h1>} />
              <Route path="/shipments" element={<h1 className="text-3xl font-bold text-gray-800">EXIM Shipments</h1>} />
              <Route path="/invoices" element={<h1 className="text-3xl font-bold text-gray-800">Financials</h1>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;