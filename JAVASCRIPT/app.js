const isLoggedIn = localStorage.getItem("isLoggedIn");

if (
  !isLoggedIn &&
  !window.location.pathname.includes("login") &&
  !window.location.pathname.includes("register")
) {

  window.location.href = "login.html";
}