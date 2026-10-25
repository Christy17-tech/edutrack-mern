import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Clock,
  User,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { coursesApi, enrollmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await coursesApi.getById(id);
      if (res.success && res.course) {
        setCourse(res.course);
      }
    } catch (err) {
      setError(err.message || 'Course not found.');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (isAuthenticated && user?.role === 'student') {
      try {
        const res = await enrollmentsApi.getMyEnrollments();
        if (res.success && res.enrollments) {
          const found = res.enrollments.some(
            (e) => (typeof e.course === 'object' ? e.course._id : e.course) === id && e.status !== 'dropped'
          );
          setIsEnrolled(found);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    fetchCourse();
    checkEnrollmentStatus();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setEnrolling(true);
      const res = await enrollmentsApi.enroll(id);
      if (res.success) {
        setIsEnrolled(true);
        setToastMsg('Successfully enrolled in this course!');
      }
    } catch (err) {
      setToastMsg(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading curriculum syllabus..." />;
  if (error) return <div className="max-w-4xl mx-auto p-6"><ErrorAlert message={error} onRetry={fetchCourse} /></div>;
  if (!course) return null;

  const totalDuration = course.modules?.reduce((acc, curr) => acc + (curr.durationHours || 0), 0) || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {toastMsg && (
        <div className="p-4 bg-brand-50 border border-brand-200 text-brand-900 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg('')} className="text-xs text-brand-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Course Hero Box */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
            {course.code}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {course.department}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {course.level} Level
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {course.title}
        </h1>

        <p className="text-gray-600 text-base leading-relaxed">
          {course.description}
        </p>

        {/* Quick Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block mb-0.5">Academic Credits</span>
            <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
              <Award className="w-4 h-4 text-brand-600" /> {course.credits} Credits
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Curriculum Duration</span>
            <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4 text-brand-600" /> {totalDuration} Hours
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Enrolled Students</span>
            <span className="font-bold text-gray-900 text-sm flex items-center gap-1">
              <Users className="w-4 h-4 text-brand-600" /> {course.enrolledCount || 0} / {course.maxCapacity}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Lead Instructor</span>
            <span className="font-bold text-gray-900 text-sm truncate flex items-center gap-1">
              <User className="w-4 h-4 text-brand-600" /> {course.instructor?.name || 'Assigned Instructor'}
            </span>
          </div>
        </div>

        {/* Enrollment CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">ICTAK Certified Course</p>
            <p className="text-xs font-semibold text-gray-700">Official Certification on Completion</p>
          </div>

          {isEnrolled ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Already Enrolled
            </div>
          ) : user?.role === 'student' || !isAuthenticated ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn-primary text-sm px-6 py-2.5"
            >
              {enrolling ? 'Enrolling...' : 'Enroll in this Course'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Syllabus Modules Breakdown */}
      <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">Curriculum Syllabus Modules</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {course.modules?.map((mod, index) => (
            <div key={index} className="py-4 first:pt-2 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-0.5">
                    Module {index + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 whitespace-nowrap">
                  {mod.durationHours} hrs
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
