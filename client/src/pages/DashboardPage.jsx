import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle,
  Clock,
  Plus,
  Users,
  Edit,
  Trash2,
  TrendingUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  dashboardApi,
  enrollmentsApi,
  coursesApi,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import GradeModal from '../components/GradeModal';
import CreateCourseModal from '../components/CreateCourseModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student states
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [droppingId, setDroppingId] = useState(null);

  // Instructor states
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [activeGradeEnrollment, setActiveGradeEnrollment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard KPIs
      const statsRes = await dashboardApi.getStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // Fetch role-specific data
      if (user?.role === 'student') {
        const enrRes = await enrollmentsApi.getMyEnrollments();
        if (enrRes.success) {
          setMyEnrollments(enrRes.enrollments || []);
        }
      } else if (user?.role === 'instructor' || user?.role === 'admin') {
        // Fetch instructor's courses
        const coursesRes = await coursesApi.getAll({
          instructor: user?.role === 'instructor' ? user._id : undefined,
          limit: 50,
        });
        if (coursesRes.success) {
          setInstructorCourses(coursesRes.courses || []);
          if (coursesRes.courses?.length > 0) {
            setSelectedCourseId(coursesRes.courses[0]._id);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Load roster when selectedCourseId changes (for instructors/admins)
  useEffect(() => {
    const fetchRoster = async () => {
      if (!selectedCourseId) return;
      try {
        setLoadingRoster(true);
        const res = await enrollmentsApi.getCourseEnrollments(selectedCourseId);
        if (res.success) {
          setRoster(res.enrollments || []);
        }
      } catch (err) {
        console.warn('Could not load course roster:', err.message);
      } finally {
        setLoadingRoster(false);
      }
    };

    if (user?.role === 'instructor' || user?.role === 'admin') {
      fetchRoster();
    }
  }, [selectedCourseId]);

  const handleDropEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    try {
      setDroppingId(enrollmentId);
      const res = await enrollmentsApi.drop(enrollmentId);
      if (res.success) {
        setMyEnrollments((prev) => prev.filter((e) => e._id !== enrollmentId));
        // refresh stats
        const sRes = await dashboardApi.getStats();
        if (sRes.success) setStats(sRes.stats);
      }
    } catch (err) {
      alert(err.message || 'Failed to drop course.');
    } finally {
      setDroppingId(null);
    }
  };

  const handleSaveGrade = async (enrollmentId, payload) => {
    const res = await enrollmentsApi.updateGrade(enrollmentId, payload);
    if (res.success) {
      setRoster((prev) =>
        prev.map((e) => (e._id === enrollmentId ? res.enrollment : e))
      );
      // Refresh stats
      const sRes = await dashboardApi.getStats();
      if (sRes.success) setStats(sRes.stats);
    }
  };

  if (loading) return <LoadingSpinner text="Compiling academic metrics..." />;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorAlert message={error} onRetry={fetchDashboardData} /></div>;

  const gradeColor = {
    'A+': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'A': 'bg-green-100 text-green-800 border-green-200',
    'B': 'bg-blue-100 text-blue-800 border-blue-200',
    'C': 'bg-amber-100 text-amber-800 border-amber-200',
    'D': 'bg-orange-100 text-orange-800 border-orange-200',
    'F': 'bg-red-100 text-red-800 border-red-200',
    'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {user?.role?.toUpperCase()} DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.email} &bull; {user?.department || 'ICTAK Academy'}
          </p>
        </div>

        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Publish New Course
          </button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {user?.role === 'student' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Enrolled Courses</span>
              <span className="text-2xl font-black text-gray-900">{stats?.totalEnrolled || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">In-Progress</span>
              <span className="text-2xl font-black text-brand-600">{stats?.inProgressCount || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Completed</span>
              <span className="text-2xl font-black text-emerald-600">{stats?.completedCount || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Average Score</span>
              <span className="text-2xl font-black text-indigo-600">
                {stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}
              </span>
            </div>
          </>
        )}

        {user?.role === 'instructor' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Courses Taught</span>
              <span className="text-2xl font-black text-gray-900">{stats?.coursesTaught || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Enrolled Students</span>
              <span className="text-2xl font-black text-brand-600">{stats?.totalStudentsEnrolled || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Pending Evaluations</span>
              <span className="text-2xl font-black text-amber-600">{stats?.pendingGradesCount || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Evaluated</span>
              <span className="text-2xl font-black text-emerald-600">{stats?.completedAssessments || 0}</span>
            </div>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Active Courses</span>
              <span className="text-2xl font-black text-brand-600">{stats?.totalCourses || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Registered Students</span>
              <span className="text-2xl font-black text-gray-900">{stats?.totalStudents || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Faculty Trainers</span>
              <span className="text-2xl font-black text-emerald-600">{stats?.totalInstructors || 0}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-400 font-semibold block mb-1">Course Enrollments</span>
              <span className="text-2xl font-black text-indigo-600">{stats?.totalEnrollments || 0}</span>
            </div>
          </>
        )}
      </section>

      {/* STUDENT ENROLLMENTS VIEW */}
      {user?.role === 'student' && (
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">My Course Enrollments</h2>
            <a href="/" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Browse More Courses &rarr;
            </a>
          </div>

          {myEnrollments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={BookOpen}
                title="No Enrolled Courses"
                description="You are currently not enrolled in any ICTAK courses. Check out the available courses in the catalog!"
                actionText="Explore Course Catalog"
                onAction={() => (window.location.href = '/')}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myEnrollments.map((enr) => (
                <div key={enr._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {enr.course?.code || 'ICT-XXX'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base">
                        {enr.course?.title || 'Course Title'}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      Instructor: {enr.course?.instructor?.name || 'Assigned Instructor'} &bull; Department: {enr.course?.department}
                    </p>
                    {enr.feedback && (
                      <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700 max-w-lg">
                        <span className="font-bold text-gray-800">Trainer Evaluation:</span> {enr.feedback}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 sm:flex-shrink-0">
                    <div className="text-right">
                      <span
                        className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${
                          gradeColor[enr.grade] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Grade: {enr.grade}
                      </span>
                      {enr.score !== null && (
                        <p className="text-xs font-bold text-gray-600 mt-1">Score: {enr.score}/100</p>
                      )}
                    </div>

                    {enr.status !== 'completed' && (
                      <button
                        onClick={() => handleDropEnrollment(enr._id)}
                        disabled={droppingId === enr._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Withdraw from Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* INSTRUCTOR / ADMIN VIEW (Course Roster & Student Grading) */}
      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Class Rosters & Student Grading</h2>
              <p className="text-xs text-gray-500">
                Select a course to view enrolled students, assign letter grades, and record feedback.
              </p>
            </div>

            {/* Course Selector Dropdown */}
            {instructorCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Course:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="input-field text-xs py-1.5 font-medium max-w-xs"
                >
                  {instructorCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-6">
            {loadingRoster ? (
              <LoadingSpinner text="Fetching student enrollment roster..." />
            ) : roster.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Enrolled Students"
                description="No students have currently enrolled in this course yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {roster.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>{item.student?.name}</div>
                          <div className="text-[11px] text-gray-400 font-normal">{item.student?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {item.student?.department || 'General'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold capitalize text-gray-700">
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                              gradeColor[item.grade] || 'bg-gray-100'
                            }`}
                          >
                            {item.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                          {item.score !== null ? `${item.score}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActiveGradeEnrollment(item)}
                            className="btn-secondary text-[11px] py-1 px-3"
                          >
                            <Edit className="w-3 h-3" /> Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Grade Modal */}
      <GradeModal
        isOpen={!!activeGradeEnrollment}
        enrollment={activeGradeEnrollment}
        onClose={() => setActiveGradeEnrollment(null)}
        onSave={handleSaveGrade}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newCourse) => {
          setInstructorCourses((prev) => [newCourse, ...prev]);
          setSelectedCourseId(newCourse._id);
        }}
      />
    </div>
  );
};

export default DashboardPage;
