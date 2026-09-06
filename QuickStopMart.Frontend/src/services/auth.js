export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUserName() {
  return localStorage.getItem("userName");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function getUserId() {
  return localStorage.getItem("userId");
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");
}