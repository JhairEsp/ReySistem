// Middleware de autenticación desactivado
// La aplicación accede directamente al dashboard sin validación de sesión

export async function proxy(request) {
  return request
}
