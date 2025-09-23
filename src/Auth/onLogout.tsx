
const onLogout = () => {
  // Lógica para cerrar sesión
  localStorage.removeItem("token");
  window.location.href = "/login"; // Redirige al login
};

export default onLogout;