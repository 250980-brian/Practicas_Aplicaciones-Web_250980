document.addEventListener("DOMContentLoaded", function () {
    console.log("MecaGest cargado correctamente");

    // 1. Subrayado automático al escribir y limpieza de marcas de error
    const campos = document.querySelectorAll("input, select, textarea");

    function evaluarCampo(input) {
        if (input.value && input.value.trim() !== "") {
            input.classList.add("campo-lleno");
            input.classList.remove("campo-error");

            // Eliminar mensaje de error individual si existe
            const contenedor = input.closest("div") || input.parentNode;
            const errorMsg = contenedor.querySelector(".mensaje-error-campo");
            if (errorMsg) errorMsg.remove();
        } else {
            input.classList.remove("campo-lleno");
        }
    }

    campos.forEach(campo => {
        evaluarCampo(campo);
        campo.addEventListener("input", () => evaluarCampo(campo));
        campo.addEventListener("change", () => evaluarCampo(campo));
    });

    // 2. Cálculo dinámico de Edad
    const fechaNacimiento = document.getElementById("fechaNacimiento");
    const resultadoEdad = document.getElementById("resultadoEdad");

    if (fechaNacimiento && resultadoEdad) {
        fechaNacimiento.addEventListener("change", function () {
            resultadoEdad.classList.remove("edad-estado--mayor", "edad-estado--menor", "edad-estado--error");

            if (fechaNacimiento.value === "") {
                resultadoEdad.textContent = "Selecciona una fecha para calcular tu edad.";
                return;
            }

            const [anio, mes, dia] = fechaNacimiento.value.split("-").map(Number);
            const nacimiento = new Date(anio, mes - 1, dia);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (nacimiento > hoy) {
                resultadoEdad.textContent = "Error: no se puede calcular la edad con la fecha elegida (es futura).";
                resultadoEdad.classList.add("edad-estado--error");
                return;
            }

            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
            const diferenciaDias = hoy.getDate() - nacimiento.getDate();

            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && diferenciaDias < 0)) {
                edad--;
            }

            if (edad >= 18) {
                resultadoEdad.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--mayor");
            } else {
                resultadoEdad.textContent = `Eres menor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--menor");
            }
        });
    }

    // 3. Envío final simulado del formulario
    const form = document.getElementById("registroForm");
    const mensajeSimulacion = document.getElementById("mensajeSimulacion");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault(); // Detener recarga de la página

            if (validarPasoActual(pasoActual)) {
                if (mensajeSimulacion) {
                    mensajeSimulacion.style.display = "block";
                    mensajeSimulacion.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
});

// 4. Variables globales y funciones de navegación del Wizard
let pasoActual = 0;

function validarPasoActual(indexPaso) {
    const pasos = document.querySelectorAll(".wizard-paso");
    if (!pasos[indexPaso]) return true;

    // Detectar campos obligatorios que tengan la propiedad 'required'
    const requeridos = pasos[indexPaso].querySelectorAll("[required]");
    let esValido = true;

    requeridos.forEach(input => {
        // Seleccionar contenedor adecuado para el mensaje de error
        const contenedor = input.closest("div") || input.parentNode;
        const errorPrevio = contenedor.querySelector(".mensaje-error-campo");
        if (errorPrevio) errorPrevio.remove();

        let campoVacio = false;

        if (input.type === "checkbox") {
            campoVacio = !input.checked;
        } else {
            campoVacio = !input.value || input.value.trim() === "";
        }

        if (campoVacio) {
            esValido = false;
            input.classList.add("campo-error");
            input.classList.remove("campo-lleno");

            // Insertar advertencia visual justo después del campo
            const errorText = document.createElement("span");
            errorText.className = "mensaje-error-campo";
            errorText.textContent = "Este campo es obligatorio.";
            input.after(errorText);
        } else {
            input.classList.remove("campo-error");
        }
    });

    return esValido;
}

function moverPaso(incremento) {
    const pasos = document.querySelectorAll(".wizard-paso");
    const indicadores = document.querySelectorAll(".wizard-paso-item");

    // Impedir avance si hay campos requeridos sin llenar
    if (incremento > 0 && !validarPasoActual(pasoActual)) {
        return;
    }

    pasos[pasoActual].classList.remove("paso-activo");
    if (indicadores[pasoActual]) indicadores[pasoActual].classList.remove("activo");

    pasoActual += incremento;

    if (pasoActual < 0) pasoActual = 0;
    if (pasoActual >= pasos.length) pasoActual = pasos.length - 1;

    pasos[pasoActual].classList.add("paso-activo");
    if (indicadores[pasoActual]) indicadores[pasoActual].classList.add("activo");
}