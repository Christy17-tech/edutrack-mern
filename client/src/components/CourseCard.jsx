import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Clock, Award, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CourseCard = ({ course, onEnroll, isEnrolling, isEnrolled }) => {
  const { user, isAuthenticated } = useAuth();

  const levelColor = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200',
  };

  const isStudent = user?.role === 'student';

  return (
    <article className="card flex flex-col justify-between group hover:border-brand-300 transition-all duration-200">
      <div>
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            {course.code}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              levelColor[course.level] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* Title & Department */}
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1.5 group-hover:text-brand-600 transition-colors">
          <Link to={`/courses/${course._id}`}>{course.title}</Link>
        </h3>
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">
          {course.department}
        </p>

        {/* Short description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">
          {course.description}
        </p>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 py-3 border-y border-gray-100 mb-4">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.credits} Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{course.modules?.length || 0} Modules</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">Trainer: {course.instructor?.name || 'Assigned Instructor'}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <Link
          to={`/courses/${course._id}`}
          className="text-xs font-semibold text-gray-600 hover:text-brand-600 flex items-center gap-1 transition-colors"
        >
          Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {isEnrolled ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
          </span>
        ) : isStudent || !isAuthenticated ? (
          <button
            onClick={() => onEnroll(course._id)}
            disabled={isEnrolling}
            className="btn-primary text-xs px-3.5 py-1.5"
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default CourseCard;
