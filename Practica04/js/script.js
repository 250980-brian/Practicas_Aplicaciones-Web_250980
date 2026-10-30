// 1. Imprimir el mensaje en la Consola de Depuración
console.log("Hola Mundo , desde JavaScript");

// El atributo defer del <script> permite obtener estos elementos del HTML.
const fechaNacimiento = document.getElementById("fechaNacimiento");
const resultadoEdad = document.getElementById("resultadoEdad");

// Se ejecuta al seleccionar o modificar una fecha.
fechaNacimiento.addEventListener("change", function () {
  // Limpiamos los colores utilizados en la validación anterior.
  resultadoEdad.classList.remove(
    "edad-estado--mayor",
    "edad-estado--menor",
    "edad-estado--error"
  );

  // Si el usuario borra la fecha, mostramos el estado inicial.
  if (fechaNacimiento.value === "") {
    resultadoEdad.textContent = "Selecciona una fecha para calcular tu edad.";
    return;
  }

  // Un input date devuelve su valor con formato AAAA-MM-DD.
  const [anio, mes, dia] = fechaNacimiento.value.split("-").map(Number);
  const nacimiento = new Date(anio, mes - 1, dia); // Meses: 0 = enero.
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Comparar fechas, no horas.

  // No es posible calcular una edad con una fecha futura.
  if (nacimiento > hoy) {
    resultadoEdad.textContent = "Error: no se puede calcular la edad con los datos elegidos. La fecha es futura.";
    resultadoEdad.classList.add("edad-estado--error");
    return;
  }

  // Calcular la edad de forma exacta
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
  const diferenciaDias = hoy.getDate() - nacimiento.getDate();

  // Ajustar la edad si aún no ha pasado su cumpleaños este año
  if (diferenciaMeses < 0 || (diferenciaMeses === 0 && diferenciaDias < 0)) {
    edad--;
  }

  // Validar si es mayor o menor de edad
  if (edad >= 18) {
    resultadoEdad.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
    resultadoEdad.classList.add("edad-estado--mayor");
  } else {
    resultadoEdad.textContent = `Eres menor de edad. Tienes ${edad} años.`;
    resultadoEdad.classList.add("edad-estado--menor");
  }
});