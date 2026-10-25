import React, { useState, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Mail, Phone, Building } from 'lucide-react';
import { usersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersApi.getStudents({
        page: currentPage,
        limit: 10,
        search,
      });

      if (res.success) {
        setStudents(res.students || []);
        setTotalPages(res.totalPages || 1);
        setTotalStudents(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Student Directory
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Registered ICTAK students across all specialized technology batches.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <input
            type="text"
            placeholder="Search student by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-xs py-2 bg-gray-50"
          />
          <button type="submit" className="btn-primary text-xs px-4 py-2 whitespace-nowrap">
            Search
          </button>
        </form>
      </div>

      {/* Main Content (4 States) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <LoadingSpinner text="Retrieving student profiles..." />
        ) : error ? (
          <ErrorAlert message={error} onRetry={fetchStudents} />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Students Found"
            description="No student profiles matched your search keyword."
            actionText="Clear Search"
            onAction={() => {
              setSearch('');
              setCurrentPage(1);
              fetchStudents();
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
              <span>Total Students: {totalStudents}</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          {student.department || 'General'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {student.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {student.phone}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-400 font-mono text-[11px]">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs font-bold text-gray-700 px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
