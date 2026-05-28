const API_BASE_URL = "http://127.0.0.1:8000/api";

export type User = {
  id: number;
  username: string;
  role: "manager" | "staff" | "resident";
};

export type MaintenanceRequest = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority?: string;
  created_by?: number | User | null;
  assigned_to?: number | User | null;
  created_at?: string;
  updated_at?: string;
};

export async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/csrf/`, {
    credentials: "include",
  });

  const data = await response.json();
  return data.csrfToken;
}

export async function loginUser(username: string, password: string) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function logoutUser() {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/me/`, {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getRequests() {
  const response = await fetch(`${API_BASE_URL}/requests/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }

  return response.json();
}

export async function createRequest(data: {
  title: string;
  description: string;
  priority: string;
}) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/requests/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create request");
  }

  return response.json();
}

export async function updateRequest(
  id: number,
  data: Partial<MaintenanceRequest>
) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/requests/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update request");
  }

  return response.json();
}