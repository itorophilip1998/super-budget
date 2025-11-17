'use client';

import { Project, ProjectStatus, CreateProjectDto } from '@/types/project';
import { createProject, updateProject } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';
import { useState, useEffect } from 'react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project?: Project | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    status: ProjectStatus.ACTIVE,
    deadline: '',
    assignedTeamMember: '',
    budget: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        deadline: project.deadline.split('T')[0], // Format date for input
        assignedTeamMember: project.assignedTeamMember,
        budget: project.budget,
      });
    } else {
      setFormData({
        name: '',
        status: ProjectStatus.ACTIVE,
        deadline: '',
        assignedTeamMember: '',
        budget: 0,
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProjectDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    if (!formData.assignedTeamMember.trim()) {
      newErrors.assignedTeamMember = 'Team member is required';
    }

    if (formData.budget < 0) {
      newErrors.budget = 'Budget must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (project) {
        await updateProject(project.id, formData);
      } else {
        await createProject(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {project ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-5 py-3 text-base border-2 rounded-lg text-gray-900 placeholder-gray-400 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProjectStatus,
                  })
                }
                className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              >
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className={`w-full px-5 py-3 text-base border-2 rounded-lg text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.deadline ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.deadline}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Assigned Team Member *
              </label>
              <input
                type="text"
                value={formData.assignedTeamMember}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedTeamMember: e.target.value,
                  })
                }
                className={`w-full px-5 py-3 text-base border-2 rounded-lg text-gray-900 placeholder-gray-400 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.assignedTeamMember
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Enter team member email or name"
              />
              {errors.assignedTeamMember && (
                <p className="mt-1 text-sm text-red-600 font-medium">
                  {errors.assignedTeamMember}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Budget *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseFloat(e.target.value) || 0,
                  })
                }
                className={`w-full px-5 py-3 text-base border-2 rounded-lg text-gray-900 placeholder-gray-400 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.budget ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.budget}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-base font-semibold border-2 border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 text-base font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </span>
                ) : (
                  project ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

