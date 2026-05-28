"use client";

import { useMemo, useState } from "react";
import {
  assignRequest,
  createRequest,
  getRequests,
  getStaffUsers,
  loginUser,
  logoutUser,
  updateRequestStatus,
  MaintenanceRequest,
  RequestPriority,
  RequestStatus,
  User,
} from "@/lib/api";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("medium");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      active: requests.filter(
        (r) => r.status === "assigned" || r.status === "in_progress"
      ).length,
      completed: requests.filter((r) => r.status === "completed").length,
    };
  }, [requests]);

  async function loadDashboard(currentUser: User) {
    const requestData = await getRequests();
    setRequests(requestData);

    if (currentUser.role === "manager") {
      const staffData = await getStaffUsers();
      setStaffUsers(staffData);
    } else {
      setStaffUsers([]);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const data = await loginUser(username, password);
      setUser(data.user);
      await loadDashboard(data.user);
      setMessage("");
    } catch {
      setMessage("Login failed. Check your username and password.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setMessage("");

    try {
      await logoutUser();
      setUser(null);
      setRequests([]);
      setStaffUsers([]);
      setUsername("");
      setPassword("");
      setMessage("");
    } catch {
      setMessage("Logout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) return;

    setBusy(true);
    setMessage("");

    try {
      await createRequest({
        title,
        description,
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");

      await loadDashboard(user);
      setMessage("Request created successfully.");
    } catch {
      setMessage("Failed to create request.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(requestId: number, staffId: string) {
    if (!user || !staffId) return;

    setBusy(true);
    setMessage("");

    try {
      await assignRequest(requestId, Number(staffId));
      await loadDashboard(user);
      setMessage("Request assigned.");
    } catch {
      setMessage("Failed to assign request.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusUpdate(requestId: number, status: RequestStatus) {
    if (!user) return;

    setBusy(true);
    setMessage("");

    try {
      await updateRequestStatus(requestId, status);
      await loadDashboard(user);
      setMessage("Status updated.");
    } catch {
      setMessage("Failed to update status.");
    } finally {
      setBusy(false);
    }
  }

  function statusStyle(status: RequestStatus) {
    if (status === "completed") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (status === "in_progress") {
      return "bg-sky-50 text-sky-700 ring-sky-200";
    }

    if (status === "assigned") {
      return "bg-blue-50 text-blue-700 ring-blue-200";
    }

    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  function priorityStyle(value: RequestPriority) {
    if (value === "urgent") return "bg-red-50 text-red-700";
    if (value === "high") return "bg-orange-50 text-orange-700";
    if (value === "medium") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-700";
  }

  function labelStatus(status: RequestStatus) {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#38bdf8_0,transparent_28%),radial-gradient(circle_at_80%_30%,#2563eb_0,transparent_24%),radial-gradient(circle_at_50%_90%,#dbeafe_0,transparent_35%)] opacity-40" />
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

          <section className="relative flex min-h-screen items-center justify-center px-5 py-10">
            <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-blue-100 bg-white/80 shadow-2xl shadow-blue-100/70 backdrop-blur-xl lg:grid-cols-2">
              <div className="hidden border-r border-blue-100 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-10 lg:block">
                <div className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-medium text-blue-700 shadow-sm">
                  Maintenance Dispatch System
                </div>

                <h1 className="mt-10 max-w-md text-4xl font-semibold leading-tight tracking-tight text-slate-950">
                  Simple maintenance tracking for properties.
                </h1>

                <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
                  Residents submit requests, managers assign staff, and
                  maintenance teams update progress from one clean dashboard.
                </p>

                <div className="mt-10 grid gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">
                      Residents
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create and track their own requests.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">
                      Managers
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      View all requests and assign staff.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">Staff</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Update assigned task progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="mb-8">
                  <p className="text-sm font-medium text-blue-600">
                    Welcome back
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    Sign in
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Use your test account details.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Username
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="resident, manager, staff"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    disabled={busy}
                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                {message && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              {user.role} access
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {user.role === "manager" && "Manager Dashboard"}
              {user.role === "staff" && "Staff Work Queue"}
              {user.role === "resident" && "Resident Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-500 sm:block">
              Signed in as{" "}
              <span className="font-medium text-slate-800">
                {user.username}
              </span>
            </p>

            <button
              onClick={handleLogout}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        {user.role !== "resident" && (
          <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Pending" value={stats.pending} />
            <StatCard label="Active" value={stats.active} />
            <StatCard label="Completed" value={stats.completed} />
          </section>
        )}

        {user.role === "resident" ? (
          <section className="grid min-h-[calc(100vh-110px)] grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="mb-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Submit a request
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add the issue details clearly.
                </p>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Broken kitchen tap"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as RequestPriority)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Explain the issue clearly."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <button
                  disabled={busy}
                  className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {busy ? "Saving..." : "Submit request"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Your requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track submitted maintenance issues.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <MiniStat label="Total" value={stats.total} />
                  <MiniStat label="Pending" value={stats.pending} />
                  <MiniStat label="Active" value={stats.active} />
                  <MiniStat label="Done" value={stats.completed} />
                </div>
              </div>

              <RequestList
                requests={requests}
                user={user}
                staffUsers={staffUsers}
                busy={busy}
                handleAssign={handleAssign}
                handleStatusUpdate={handleStatusUpdate}
                statusStyle={statusStyle}
                priorityStyle={priorityStyle}
                labelStatus={labelStatus}
              />
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Maintenance requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {user.role === "manager" &&
                    "Assign requests to maintenance staff."}
                  {user.role === "staff" &&
                    "Update the progress of assigned work."}
                </p>
              </div>
            </div>

            <RequestList
              requests={requests}
              user={user}
              staffUsers={staffUsers}
              busy={busy}
              handleAssign={handleAssign}
              handleStatusUpdate={handleStatusUpdate}
              statusStyle={statusStyle}
              priorityStyle={priorityStyle}
              labelStatus={labelStatus}
            />
          </section>
        )}
      </div>
    </main>
  );
}

function RequestList({
  requests,
  user,
  staffUsers,
  busy,
  handleAssign,
  handleStatusUpdate,
  statusStyle,
  priorityStyle,
  labelStatus,
}: {
  requests: MaintenanceRequest[];
  user: User;
  staffUsers: User[];
  busy: boolean;
  handleAssign: (requestId: number, staffId: string) => Promise<void>;
  handleStatusUpdate: (
    requestId: number,
    status: RequestStatus
  ) => Promise<void>;
  statusStyle: (status: RequestStatus) => string;
  priorityStyle: (priority: RequestPriority) => string;
  labelStatus: (status: RequestStatus) => string;
}) {
  if (requests.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-slate-500">No maintenance requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
        <div className="col-span-4">Request</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assigned</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Action</div>
      </div>

      <div className="divide-y divide-slate-200">
        {requests.map((request) => (
          <div
            key={request.id}
            className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-4">
              <p className="text-sm font-medium text-slate-950">
                {request.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {request.description}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Created by {request.created_by.username}
              </p>
            </div>

            <div className="md:col-span-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyle(
                  request.priority
                )}`}
              >
                {request.priority}
              </span>
            </div>

            <div className="text-sm text-slate-700 md:col-span-2">
              {request.assigned_to ? request.assigned_to.username : "Not assigned"}
            </div>

            <div className="md:col-span-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyle(
                  request.status
                )}`}
              >
                {labelStatus(request.status)}
              </span>
            </div>

            <div className="md:col-span-2">
              {user.role === "manager" && (
                <select
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  defaultValue=""
                  onChange={(e) => {
                    void handleAssign(request.id, e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">Assign staff</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.username}
                    </option>
                  ))}
                </select>
              )}

              {user.role === "staff" && (
                <select
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  value={request.status}
                  onChange={(e) =>
                    void handleStatusUpdate(
                      request.id,
                      e.target.value as RequestStatus
                    )
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}

              {user.role === "resident" && (
                <span className="text-sm text-slate-400">View only</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}