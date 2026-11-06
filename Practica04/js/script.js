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

    // 3. Vista previa imagen estricta
    const qrInput = document.getElementById("whatsAppQr");
    if (qrInput) {
        qrInput.addEventListener("change", function(event) {
            const input = event.target;
            const imgPreview = document.getElementById('qrPreview');
            const placeholder = document.getElementById('preview-placeholder');

            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // Validación estricta: Solo permitir imágenes
                if (!file.type.startsWith('image/')) {
                    alert('Error: Solo se permiten archivos de imagen (PNG, JPG, JPEG).');
                    input.value = ''; // Limpia el archivo incorrecto
                    imgPreview.src = "";
                    imgPreview.classList.add('oculta');
                    placeholder.classList.remove('oculta');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    imgPreview.src = e.target.result;
                    imgPreview.classList.remove('oculta');
                    placeholder.classList.add('oculta');
                }
                reader.readAsDataURL(file);
            } else {
                imgPreview.src = "";
                imgPreview.classList.add('oculta');
                placeholder.classList.remove('oculta');
            }
        });
    }

    // 4. Submit form
    const form = document.getElementById("registroForm");
    const mensajeSimulacion = document.getElementById("mensajeSimulacion");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault(); // Evita que la página se recargue

            // Valida que el paso actual (Ubicación) esté correcto
            if (validarPasoActual(pasoActual)) {
                if (mensajeSimulacion) {
                    // Quitamos la clase oculta para vencer el !important
                    mensajeSimulacion.classList.remove("oculta");
                    mensajeSimulacion.style.display = "block";
                    
                    // Opcional: Puedes agregar un estilo visual de éxito
                    mensajeSimulacion.style.padding = "15px";
                    mensajeSimulacion.style.backgroundColor = "#e6f4ea";
                    mensajeSimulacion.style.color = "#137333";
                    mensajeSimulacion.style.borderRadius = "8px";
                    mensajeSimulacion.style.marginBottom = "20px";
                    mensajeSimulacion.style.fontWeight = "bold";

                    // Hacemos scroll suave hacia el mensaje para que el usuario lo vea
                    mensajeSimulacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
});

// 5. Variables globales y funciones de navegación del Wizard
let pasoActual = 0;

function validarPasoActual(indexPaso) {
    const pasos = document.querySelectorAll(".wizard-paso");
    if (!pasos[indexPaso]) return true;

    // Detectar campos obligatorios que tengan la propiedad 'required'
    const requeridos = pasos[indexPaso].querySelectorAll("[required]");
    let esValido = true;
    let algunError = false;
    const alertaGlobal = document.getElementById("alerta-global");

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
            algunError = true;
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
    
    // Validación adicional de contraseñas en el paso 3 (índice 2)
    if (indexPaso === 2) {
        const password = document.getElementById("contrasena");
        const confirmPassword = document.getElementById("confirmarContrasena");
        const errorText = document.getElementById("password-error");
        
        if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
            esValido = false;
            algunError = true;
            confirmPassword.classList.add("campo-error");
            if(errorText) {
                errorText.classList.remove("oculta");
                errorText.style.display = "block";
            }
        } else if (errorText) {
            errorText.classList.add("oculta");
            errorText.style.display = "none";
        }
    }

    if (alertaGlobal) {
        if (algunError) {
            alertaGlobal.classList.remove("oculta");
        } else {
            alertaGlobal.classList.add("oculta");
        }
    }

    return esValido;
}

function moverPaso(incremento) {
    const pasos = document.querySelectorAll(".wizard-paso");
    const indicadores = document.querySelectorAll(".wizard-paso-item");

    // Impedir avance si hay campos requeridos sin llenar o con errores
    if (incremento > 0 && !validarPasoActual(pasoActual)) {
        return;
    }
    
    // Al retroceder o avanzar correctamente, ocultar alerta global
    const alertaGlobal = document.getElementById("alerta-global");
    if (alertaGlobal) {
        alertaGlobal.classList.add("oculta");
    }

    pasos[pasoActual].classList.remove("paso-activo");
    if (indicadores[pasoActual]) indicadores[pasoActual].classList.remove("activo");

    pasoActual += incremento;

    if (pasoActual < 0) pasoActual = 0;
    if (pasoActual >= pasos.length) pasoActual = pasos.length - 1;

    pasos[pasoActual].classList.add("paso-activo");
    if (indicadores[pasoActual]) indicadores[pasoActual].classList.add("activo");
}