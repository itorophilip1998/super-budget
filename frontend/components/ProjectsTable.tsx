'use client';

import { Project, ProjectStatus } from '@/types/project';
import { useState } from 'react';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.COMPLETED]: 'Completed',
};

export default function ProjectsTable({
  projects,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  const handleDelete = (project: Project) => {
    onDelete(project);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg font-medium">
          No projects found. Create your first project to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Team Member
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Budget
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-base font-semibold text-gray-900">
                  {project.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    statusColors[project.status]
                  }`}
                >
                  {statusLabels[project.status]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 font-medium">
                {formatDate(project.deadline)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                {project.assignedTeamMember}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                {formatCurrency(project.budget)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                <button
                  onClick={() => onEdit(project)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project)}
                  className="text-red-600 hover:text-red-900 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

