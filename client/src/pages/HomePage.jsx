import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { coursesApi, enrollmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';

const DEPARTMENTS = [
  'All',
  'Full Stack Development',
  'Data Science & AI',
  'Cyber Security',
  'Cloud Computing',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [enrollingId, setEnrollingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await coursesApi.getAll({
        page: currentPage,
        limit: 6,
        search,
        department: selectedDept,
        level: selectedLevel,
      });

      if (res.success) {
        setCourses(res.courses || []);
        setTotalPages(res.totalPages || 1);
        setTotalCourses(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrolled courses if logged in as student
  const fetchMyEnrollments = async () => {
    if (isAuthenticated && user?.role === 'student') {
      try {
        const res = await enrollmentsApi.getMyEnrollments();
        if (res.success && res.enrollments) {
          const ids = new Set(
            res.enrollments
              .filter((e) => e.status !== 'dropped')
              .map((e) => (typeof e.course === 'object' ? e.course._id : e.course))
          );
          setEnrolledCourseIds(ids);
        }
      } catch (err) {
        console.warn('Could not load existing enrollments:', err.message);
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, selectedDept, selectedLevel]);

  useEffect(() => {
    fetchMyEnrollments();
  }, [isAuthenticated, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setEnrollingId(courseId);
      const res = await enrollmentsApi.enroll(courseId);
      if (res.success) {
        setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
        showToast('Enrolled successfully! View it in your Dashboard.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to enroll.', true);
    } finally {
      setEnrollingId(null);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage({ text: message, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-bounce ${
            toastMessage.isError
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <Check className="w-4 h-4" />
          {toastMessage.text}
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>ICTAK Student Reference Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Accelerate Your Tech Career with Kerala's Premier Academy
          </h1>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed mb-6">
            Industry-aligned curriculum in Full Stack MERN Development, Cloud Computing, Cyber Defense, and Artificial Intelligence with practical project evaluations.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <Search className="w-5 h-5 text-brand-200 ml-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title, code (ICT-FS101), or keyword..."
              className="w-full bg-transparent text-white placeholder-brand-200/70 text-sm px-2 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filter Tabs & Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setCurrentPage(1);
                }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Difficulty:</span>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Course Content (4 UI States) */}
      <main>
        {loading ? (
          <LoadingSpinner text="Loading published courses from ICTAK registry..." />
        ) : error ? (
          <ErrorAlert message={error} onRetry={fetchCourses} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses matched your query"
            description="Try clearing search filters or selecting a different department."
            actionText="Reset Filters"
            onAction={() => {
              setSearch('');
              setSelectedDept('All');
              setSelectedLevel('All');
              setCurrentPage(1);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
              <span>Showing {courses.length} of {totalCourses} courses</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEnroll={handleEnroll}
                  isEnrolling={enrollingId === course._id}
                  isEnrolled={enrolledCourseIds.has(course._id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
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
      </main>
    </div>
  );
};

export default HomePage;
