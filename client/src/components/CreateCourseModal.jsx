import React, { useState } from 'react';
import { X, Plus, Trash2, BookPlus } from 'lucide-react';
import { coursesApi } from '../services/api';

export const CreateCourseModal = ({ isOpen, onClose, onCreated }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    department: 'Full Stack Development',
    credits: 4,
    maxCapacity: 40,
    level: 'Intermediate',
  });

  const [modules, setModules] = useState([
    { title: 'Foundations & Architecture', durationHours: 10, description: 'Core principles and setup' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = field === 'durationHours' ? Number(value) : value;
    setModules(updated);
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { title: '', durationHours: 10, description: '' },
    ]);
  };

  const removeModule = (index) => {
    if (modules.length === 1) return;
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim() || !formData.code.trim() || !formData.description.trim()) {
      setErrorMsg('Please complete all required fields (title, code, description).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await coursesApi.create({
        ...formData,
        credits: Number(formData.credits),
        maxCapacity: Number(formData.maxCapacity),
        modules,
      });

      if (res.success) {
        onCreated(res.course);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-gray-900">Publish New Course</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Course Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Advanced React & Next.js Systems"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Course Code *</label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. ICT-ADV301"
                className="input-field font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Software Testing">Software Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Credits (1 - 6)</label>
              <input
                type="number"
                name="credits"
                min="1"
                max="6"
                value={formData.credits}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Comprehensive summary of prerequisites, learning objectives, and curriculum..."
              className="input-field"
            ></textarea>
          </div>

          {/* Syllabus Modules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700">Syllabus Modules</label>
              <button
                type="button"
                onClick={addModule}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>

            <div className="space-y-2">
              {modules.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Module Title"
                    value={mod.title}
                    onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                    className="input-field text-xs flex-1 bg-white"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Hours"
                    value={mod.durationHours}
                    onChange={(e) => handleModuleChange(idx, 'durationHours', e.target.value)}
                    className="input-field text-xs w-20 bg-white"
                  />
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
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
              className="btn-primary text-xs py-2 px-5"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
