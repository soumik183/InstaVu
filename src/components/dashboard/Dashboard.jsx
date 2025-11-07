import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FileGrid from '../storage/FileGrid';
import { useStorage } from '../../context/StorageContext';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setFilters } = useStorage();

  const handleCategoryChange = (category) => {
    if (category === 'all') {
      setFilters(prev => ({ ...prev, type: 'all', favorite: false }));
    } else if (category === 'favorites') {
      setFilters(prev => ({ ...prev, favorite: true, type: 'all' }));
    } else {
      setFilters(prev => ({ ...prev, type: category, favorite: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCategoryChange={handleCategoryChange}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} mt-16`}>
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={<FileGrid />} />
              <Route path="/photos" element={<FileGrid filter="photo" />} />
              <Route path="/videos" element={<FileGrid filter="video" />} />
              <Route path="/documents" element={<FileGrid filter="document" />} />
              <Route path="/favorites" element={<FileGrid filter="favorites" />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}