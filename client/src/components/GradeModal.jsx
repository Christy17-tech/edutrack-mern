import React, { useState } from 'react';
import { X, Award, CheckCircle } from 'lucide-react';

export const GradeModal = ({ enrollment, isOpen, onClose, onSave }) => {
  if (!isOpen || !enrollment) return null;

  const [grade, setGrade] = useState(enrollment.grade || 'Pending');
  const [score, setScore] = useState(enrollment.score !== null ? enrollment.score : '');
  const [feedback, setFeedback] = useState(enrollment.feedback || '');
  const [status, setStatus] = useState(enrollment.status || 'in-progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numericScore = score !== '' ? Number(score) : null;
    if (numericScore !== null && (numericScore < 0 || numericScore > 100)) {
      setErrorMsg('Score must be between 0 and 100.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(enrollment._id, {
        grade,
        score: numericScore,
        feedback,
        status,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update grade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Evaluate Student</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-100 text-xs text-gray-700">
            <p className="font-semibold text-brand-900">{enrollment.student?.name}</p>
            <p className="text-gray-500">{enrollment.student?.email}</p>
            <p className="text-gray-600 mt-1 font-mono">{enrollment.course?.title || 'Enrolled Course'}</p>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input-field"
              >
                <option value="Pending">Pending</option>
                <option value="A+">A+ (Distinction)</option>
                <option value="A">A (Excellent)</option>
                <option value="B">B (Good)</option>
                <option value="C">C (Satisfactory)</option>
                <option value="D">D (Pass)</option>
                <option value="F">F (Fail)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 92"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              <option value="enrolled">Enrolled</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Trainer Feedback</label>
            <textarea
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Constructive feedback, project evaluation notes..."
              className="input-field"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-4"
            >
              {isSubmitting ? 'Saving...' : 'Save Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeModal;
