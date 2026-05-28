"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createRequest,
  getCurrentUser,
  getRequests,
  loginUser,
  logoutUser,
  updateRequest,
  MaintenanceRequest,
  RequestPriority,
  RequestStatus,
  User,
} from "@/lib/api";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("medium");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const activeRequests = requests.filter(
    (r) => r.status === "assigned" || r.status === "in_progress"
  ).length;
  const completedRequests = requests.filter(
    (r) => r.status === "completed"
  ).length;

  const dashboardTitle = useMemo(() => {
    if (!user) return "Maintenance Dispatch";
    if (user.role === "manager") return "Manager Command Center";
    if (user.role === "staff") return "Staff Work Queue";
    return "Resident Request Portal";
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then(async (currentUser) => {
        if (cancelled) return;

        if (!currentUser) {
          setUser(null);
          setRequests([]);
          return;
        }

        const requestData = await getRequests();

        if (cancelled) return;

        setUser(currentUser);
        setRequests(requestData);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("Failed to load dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshRequests() {
    const requestData = await getRequests();
    setRequests(requestData);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    try {
      const data = await loginUser(username, password);
      setUser(data.user);
      await refreshRequests();
      setMessage(`Logged in as ${data.user.username}.`);
    } catch {
      setMessage("Login failed. Check your username and password.");
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();

      setUser(null);
      setRequests([]);
      setUsername("");
      setPassword("");
      setMessage("Logged out successfully.");
    } catch {
      setMessage("Logout failed.");
    }
  }

  async function handleCreateRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

      await refreshRequests();
      setMessage("Request created successfully.");
    } catch {
      setMessage("Failed to create request.");
    }
  }

  async function handleStatusUpdate(id: number, status: RequestStatus) {
    try {
      await updateRequest(id, { status });
      await refreshRequests();
      setMessage("Status updated.");
    } catch {
      setMessage("Failed to update status.");
    }
  }

  async function handleAssign(id: number, staffId: string) {
    if (!staffId.trim()) {
      setMessage("Enter a staff user ID first.");
      return;
    }

    try {
      await updateRequest(id, {
        assigned_to: Number(staffId),
        status: "assigned",
      });

      await refreshRequests();
      setMessage("Request assigned.");
    } catch {
      setMessage("Failed to assign request.");
    }
  }

  function getName(value: number | User | null | undefined) {
    if (!value) return "Not assigned";
    if (typeof value === "number") return `User #${value}`;
    return value.username;
  }

  function getStatusLabel(status: string) {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function getBadgeClass(status: string) {
    if (status === "completed") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
    }

    if (status === "in_progress") {
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
    }

    if (status === "assigned") {
      return "border-blue-400/30 bg-blue-400/10 text-blue-200";
    }

    return "border-slate-400/30 bg-slate-400/10 text-slate-200";
  }

  function getPriorityClass(priorityValue?: string) {
    if (priorityValue === "urgent") return "text-red-200 bg-red-400/10";
    if (priorityValue === "high") return "text-orange-200 bg-orange-400/10";
    if (priorityValue === "medium") return "text-blue-200 bg-blue-400/10";
    return "text-slate-200 bg-slate-400/10";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6">
        <div className="rounded-3xl border border-blue-400/20 bg-white/5 px-8 py-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-semibold tracking-wide text-blue-100">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1d4ed8_0,transparent_35%),radial-gradient(circle_at_bottom_right,#0ea5e9_0,transparent_30%)] opacity-40" />

        <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
          <section className="hidden flex-col justify-between p-12 lg:flex">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Live Maintenance Operations
              </div>

              <h1 className="mt-10 max-w-xl text-6xl font-black tracking-tight text-white">
                Dispatch repairs without the chaos.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                A clean maintenance dashboard for residents, staff, and managers
                to report, assign, and complete work faster.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black text-white">01</p>
                <p className="mt-2 text-sm text-slate-300">Report issues</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black text-white">02</p>
                <p className="mt-2 text-sm text-slate-300">Assign staff</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-black text-white">03</p>
                <p className="mt-2 text-sm text-slate-300">Track progress</p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <h1 className="text-4xl font-black tracking-tight text-white">
                  Maintenance Dispatch
                </h1>
                <p className="mt-3 text-slate-300">
                  Sign in to manage maintenance requests.
                </p>
              </div>

              <div className="rounded-[2rem] border border-blue-300/20 bg-white/10 p-8 shadow-2xl shadow-blue-950/60 backdrop-blur-2xl">
                <div className="mb-8">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-200">
                    Welcome back
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-white">
                    Sign in
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Use the username and password from Django admin.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-blue-100">
                      Username
                    </label>
                    <input
                      className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                      placeholder="resident, staff, or manager"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-blue-100">
                      Password
                    </label>
                    <input
                      className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                      placeholder="Enter password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-black text-white shadow-xl shadow-blue-950/40 transition hover:scale-[1.01] hover:from-blue-500 hover:to-cyan-400"
                  >
                    Sign In
                  </button>
                </form>

                {message && (
                  <div className="mt-6 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm text-blue-100">
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
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1e40af_0,transparent_32%),radial-gradient(circle_at_top_right,#0369a1_0,transparent_28%)] opacity-35" />

      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <header className="rounded-[2rem] border border-blue-300/20 bg-white/10 p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {user.role.toUpperCase()} ACCESS
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                {dashboardTitle}
              </h1>

              <p className="mt-3 text-slate-300">
                Signed in as{" "}
                <span className="font-bold text-white">{user.username}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-4 font-bold text-slate-100 transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mt-6 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm text-blue-100 backdrop-blur-xl">
            {message}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-blue-300/20 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-300">Total</p>
            <p className="mt-3 text-4xl font-black text-white">
              {totalRequests}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-300/20 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-300">Pending</p>
            <p className="mt-3 text-4xl font-black text-white">
              {pendingRequests}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-300/20 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-300">Active</p>
            <p className="mt-3 text-4xl font-black text-white">
              {activeRequests}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-300/20 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-slate-300">Completed</p>
            <p className="mt-3 text-4xl font-black text-white">
              {completedRequests}
            </p>
          </div>
        </section>

        {user.role === "resident" && (
          <section className="mt-6 rounded-[2rem] border border-blue-300/20 bg-white/10 p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">
              New Request
            </p>

            <h2 className="mt-3 text-3xl font-black">Report an Issue</h2>

            <p className="mt-2 text-slate-300">
              Tell the maintenance team what needs fixing.
            </p>

            <form
              onSubmit={handleCreateRequest}
              className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Issue title
                </label>
                <input
                  className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  placeholder="Broken kitchen tap"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Priority
                </label>
                <select
                  className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
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

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-blue-100">
                  Description
                </label>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                  placeholder="Explain what is broken, where it is, and anything useful."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 font-black text-white shadow-xl shadow-blue-950/40 transition hover:scale-[1.01] hover:from-blue-500 hover:to-cyan-400"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-200">
                Work Orders
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Maintenance Requests
              </h2>
            </div>

            <p className="text-sm text-slate-300">
              {user.role === "manager" && "Assign staff and control requests."}
              {user.role === "staff" && "Update your assigned work progress."}
              {user.role === "resident" && "Track your submitted issues."}
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-[2rem] border border-blue-300/20 bg-white/10 p-10 text-center text-slate-300 backdrop-blur-xl">
              No requests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="group rounded-[2rem] border border-blue-300/20 bg-white/10 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-300/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                        Request #{request.id}
                      </p>

                      <h3 className="mt-3 text-2xl font-black text-white">
                        {request.title}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${getBadgeClass(
                        request.status
                      )}`}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-300">
                    {request.description}
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Priority
                      </p>

                      <p
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-black ${getPriorityClass(
                          request.priority
                        )}`}
                      >
                        {request.priority || "Not set"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Assigned To
                      </p>

                      <p className="mt-2 font-bold text-slate-100">
                        {getName(request.assigned_to)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Created By
                      </p>

                      <p className="mt-2 font-bold text-slate-100">
                        {getName(request.created_by)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </p>

                      <p className="mt-2 font-bold text-slate-100">
                        {getStatusLabel(request.status)}
                      </p>
                    </div>
                  </div>

                  {user.role === "manager" && (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <label className="mb-2 block text-sm font-semibold text-blue-100">
                        Assign to staff user ID
                      </label>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                          placeholder="Example: 2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              void handleAssign(
                                request.id,
                                e.currentTarget.value
                              );

                              e.currentTarget.value = "";
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            const input =
                              e.currentTarget
                                .previousElementSibling as HTMLInputElement;

                            void handleAssign(request.id, input.value);
                            input.value = "";
                          }}
                          className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-500"
                        >
                          Assign
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Use the staff user ID from Django admin.
                      </p>
                    </div>
                  )}

                  {user.role === "staff" && (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <label className="mb-2 block text-sm font-semibold text-blue-100">
                        Update Status
                      </label>

                      <select
                        className="w-full rounded-2xl border border-blue-200/20 bg-slate-950/60 px-4 py-4 text-white outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
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
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}