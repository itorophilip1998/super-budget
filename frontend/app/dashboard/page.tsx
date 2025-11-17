"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectStatus } from "@/types/project";
import { getProjects, deleteProject } from "@/lib/api";
import ProjectsTable from "@/components/ProjectsTable";
import ProjectModal from "@/components/ProjectModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartBar,
  FaCheckCircle,
  FaPauseCircle,
  FaTrophy,
  FaDollarSign,
} from "react-icons/fa";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onHold: 0,
    completed: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open add project
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleAddProject();
      }
      // Ctrl/Cmd + / to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Escape to close modals
      if (e.key === "Escape") {
        if (isModalOpen) {
          setIsModalOpen(false);
          setEditingProject(null);
        }
        if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
          setDeletingProject(null);
        }
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isModalOpen, isDeleteModalOpen, showKeyboardShortcuts]);

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

      // Calculate stats
      const statsData = {
        total: data.length,
        active: data.filter((p) => p.status === ProjectStatus.ACTIVE).length,
        onHold: data.filter((p) => p.status === ProjectStatus.ON_HOLD).length,
        completed: data.filter((p) => p.status === ProjectStatus.COMPLETED)
          .length,
        totalBudget: data.reduce((sum, p) => sum + p.budget, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
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

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.assignedTeamMember.toLowerCase().includes(query)
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
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  // Format budget with K/M/B abbreviations
  const formatBudget = (amount: number): string => {
    if (amount >= 1000000000) {
      // Billions
      const billions = amount / 1000000000;
      return `$${billions.toFixed(billions >= 10 ? 0 : 1)}B`;
    } else if (amount >= 1000000) {
      // Millions
      const millions = amount / 1000000;
      return `$${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
    } else if (amount >= 1000) {
      // Thousands
      const thousands = amount / 1000;
      return `$${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
    } else {
      // Less than 1000
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const statCards = [
    {
      label: "Total Projects",
      value: stats.total,
      color: "from-indigo-500 to-purple-600",
      icon: FaChartBar,
    },
    {
      label: "Active",
      value: stats.active,
      color: "from-green-500 to-emerald-600",
      icon: FaCheckCircle,
    },
    {
      label: "On Hold",
      value: stats.onHold,
      color: "from-yellow-500 to-orange-600",
      icon: FaPauseCircle,
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "from-gray-500 to-slate-600",
      icon: FaTrophy,
    },
    {
      label: "Total Budget",
      value: formatBudget(stats.totalBudget),
      color: "from-pink-500 to-rose-600",
      icon: FaDollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refreshing indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 glass backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl p-4 border border-white/20"
          >
            <LoadingSpinner size="sm" text="Refreshing..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Add Project</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Ctrl/Cmd + K
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Show Shortcuts</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Ctrl/Cmd + /
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Close Modal</span>
                  <kbd className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-mono">
                    Esc
                  </kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">SB</span>
                </div>
              </motion.div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Super-Budget Dashboard
                </h1>
                <p className="text-gray-700 mt-1 font-medium">
                  Manage your projects with style
                </p>
              </div>
            </motion.div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <motion.button
                onClick={() => setShowKeyboardShortcuts(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 border border-gray-200"
                title="Keyboard Shortcuts (Ctrl/Cmd + /)"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Shortcuts
              </motion.button>
              <motion.button
                onClick={() => fetchProjects(true)}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 glass backdrop-blur-sm bg-white/80 rounded-xl shadow-lg text-sm font-semibold text-gray-700 hover:bg-white/90 disabled:opacity-50 border border-white/20"
                title="Refresh projects"
              >
                <motion.svg
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
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
                </motion.svg>
                Refresh
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 border border-gray-200"
              >
                Logout
              </motion.button>
              <motion.button
                onClick={handleAddProject}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transform transition-all"
                title="Add Project (Ctrl/Cmd + K)"
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
              </motion.button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${stat.color} rounded-2xl shadow-2xl p-6 border-2 border-white/30 cursor-pointer hover:shadow-3xl transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <stat.icon className="text-3xl text-white drop-shadow-lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 text-xs font-semibold uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-white text-3xl font-extrabold mt-1 drop-shadow-lg">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or team member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 text-base bg-white border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 shadow-lg transition-all font-medium"
                />
              </div>
            </motion.div>
            <motion.div
              className="sm:w-64"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectStatus | "ALL")
                }
                className="w-full px-5 py-4 text-base bg-white border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-lg font-semibold transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200"
        >
          <ProjectsTable
            projects={filteredProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        </motion.div>
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
