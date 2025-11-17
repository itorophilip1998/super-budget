'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectStatus } from '@/types/project';
import { getProjects, deleteProject } from '@/lib/api';
import ProjectsTable from '@/components/ProjectsTable';
import ProjectModal from '@/components/ProjectModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  const fetchProjects = useCallback(async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter and search logic
  useEffect(() => {
    let filtered = projects;

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.assignedTeamMember.toLowerCase().includes(query),
      );
    }

    setFilteredProjects(filtered);
  }, [projects, statusFilter, searchQuery]);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    await fetchProjects();
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      setIsDeleteModalOpen(false);
      setDeletingProject(null);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4">
          <LoadingSpinner size="sm" text="Refreshing..." />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full ${loading || isRefreshing ? 'animate-spin' : ''}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">SB</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Super-Budget Dashboard
              </h1>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => fetchProjects(true)}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                title="Refresh projects"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Logout
              </button>
              <button
                onClick={handleAddProject}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Project
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 bg-white shadow-sm"
              />
            </div>
            <div className="sm:w-56">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectStatus | 'ALL')
                }
                className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white shadow-sm font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ProjectsTable
              projects={filteredProjects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          </div>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleModalSave}
        project={editingProject}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
        }}
        onConfirm={handleConfirmDelete}
        projectName={deletingProject?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

