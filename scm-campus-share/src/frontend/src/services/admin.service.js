import api from "../lib/axios";

// --- MOCK DATA FOR DEMO ---
const MOCK_STATS = {
  total_users: 1250,
  active_users: 850,
  total_resources: 340,
  total_downloads: 12050,
  reports_pending: 5,
  daily_views: [
    { name: "Mon", views: 400 },
    { name: "Tue", views: 300 },
    { name: "Wed", views: 550 },
    { name: "Thu", views: 450 },
    { name: "Fri", views: 600 },
    { name: "Sat", views: 200 },
    { name: "Sun", views: 150 },
  ],
};

const MOCK_REPORTS = [
  {
    id: "r1",
    type: "inappropriate",
    reason: "Contains offensive language",
    status: "pending",
    resource: { title: "Intro to Philosophy" },
    reporter: "Jane Doe",
  },
  {
    id: "r2",
    type: "copyright",
    reason: "Textbook PDF upload",
    status: "pending",
    resource: { title: "Calculus 5th Edition" },
    reporter: "System",
  },
  {
    id: "r3",
    type: "spam",
    reason: "Advertising external links",
    status: "pending",
    resource: { title: "Cheap Essays" },
    reporter: "Mike Ross",
  },
];

const MOCK_USERS = [
  {
    id: "u1",
    first_name: "John",
    last_name: "Doe",
    email: "john@uni.edu",
    role: "student",
    status: "active",
    joined_at: "2025-01-10",
  },
  {
    id: "u2",
    first_name: "Alice",
    last_name: "Admin",
    email: "admin@uni.edu",
    role: "admin",
    status: "active",
    joined_at: "2024-12-01",
  },
  {
    id: "u3",
    first_name: "Spam",
    last_name: "Bot",
    email: "bot@spam.com",
    role: "student",
    status: "banned",
    joined_at: "2025-02-15",
  },
];

export const adminService = {
  // 1. Analytics
  async getAnalytics() {
    try {
      const response = await api.get("/admin/analytics");
      return response.data;
    } catch (e) {
      console.warn("Backend missing Admin API, using MOCK stats");
      return MOCK_STATS;
    }
  },

  // 2. Reports
  async getReports() {
    try {
      const response = await api.get("/admin/reports");
      return response.data.reports;
    } catch (e) {
      return MOCK_REPORTS;
    }
  },

  async approveReport(id) {
    // In real app: api.post(...)
    return true;
  },

  async rejectReport(id) {
    // In real app: api.post(...)
    return true;
  },

  // 3. Users
  async getUsers() {
    try {
      const response = await api.get("/admin/users");
      return response.data.users;
    } catch (e) {
      return MOCK_USERS;
    }
  },

  async banUser(id) {
    // api.post(...)
    return true;
  },

  async unbanUser(id) {
    return true;
  },
};
