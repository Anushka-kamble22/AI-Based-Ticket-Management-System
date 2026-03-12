/* ================= TOKEN ================= */

export const getToken = () => {
  return localStorage.getItem("token");
};

/* ================= USER ================= */

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/* ================= ROLE ================= */

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/* ================= AUTH CHECK ================= */

export const isAuthenticated = () => {
  return !!getToken();
};

/* ================= LOGOUT ================= */

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};