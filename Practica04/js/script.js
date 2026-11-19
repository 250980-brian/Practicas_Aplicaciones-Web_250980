/* MecaGest - Práctica JS05 */

// ---------------------------------------------------------------
// Utilidades de errores y estado de campos
// ---------------------------------------------------------------
let pasoActual = 0;
const MSG_OBLIGATORIO = "Este campo es obligatorio.";

function norm(t) {
    return (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function limpiarError(el) {
    el.classList.remove("campo-error");
    document.querySelectorAll('.mensaje-error-campo[data-para="' + el.id + '"]').forEach(s => s.remove());
}

function mostrarError(el, msg) {
    limpiarError(el);
    el.classList.add("campo-error");
    el.classList.remove("campo-lleno");
    const s = document.createElement("span");
    s.className = "mensaje-error-campo";
    s.dataset.para = el.id;
    s.textContent = msg;
    if (el.type === "checkbox") {
        el.parentNode.appendChild(s);
    } else {
        (el.closest(".campo-password") || el).insertAdjacentElement("afterend", s);
    }
}

function evaluarCampo(input) {
    if (input.type === "checkbox" || input.type === "radio") return;
    if (input.value && input.value.trim() !== "") {
        input.classList.add("campo-lleno");
        limpiarError(input);
    } else {
        input.classList.remove("campo-lleno");
    }
}

// ---------------------------------------------------------------
// Validadores (se ejecutan solo si el campo tiene contenido)
// ---------------------------------------------------------------
function urlValida(v, host) {
    try {
        const u = new URL(v);
        return (/^https?:$/.test(u.protocol) && u.hostname.toLowerCase().endsWith(host)) ||
            "Escribe una URL de " + host + " válida.";
    } catch (e) {
        return "Escribe una URL válida (ej. https://" + host + "/usuario).";
    }
}

const VALIDADORES = {
    correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Escribe un correo válido: usuario@dominio.ext.",
    telefono: v => {
        const d = v.replace(/\D/g, "");
        return (/^\+?[\d\s().-]+$/.test(v) && d.length >= 10 && d.length <= 13) ||
            "Escribe un teléfono válido (10 a 13 dígitos, sin letras).";
    },
    urlFacebook: v => urlValida(v, "facebook.com"),
    urlLinkedin: v => urlValida(v, "linkedin.com"),
    usuario: v => (v.length >= 4 && !/\s/.test(v)) || "Utiliza al menos 4 caracteres, sin espacios.",
    contrasena: v => /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s])\S{6,}$/.test(v) ||
        "Mínimo 6 caracteres, una mayúscula y un símbolo especial, sin espacios.",
    confirmarContrasena: v => v === document.getElementById("contrasena").value || "Las contraseñas no coinciden.",
    rfc: v => /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(v) || "Escribe un RFC válido (ej. ABCD010203XYZ).",
    cpFiscal: v => /^\d{5}$/.test(v) || "El código postal fiscal debe tener 5 dígitos.",
    codigoPostal: v => {
        const pais = document.getElementById("pais");
        if (pais && norm(pais.value) !== "mexico") return true;
        return /^\d{5}$/.test(v) || "El código postal debe tener 5 dígitos.";
    }
};

// ---------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------
function validarPasoActual(i) {
    const pasos = document.querySelectorAll(".wizard-paso");
    const paso = pasos[i];
    if (!paso) return true;
    let ok = true;

    paso.querySelectorAll("input, select, textarea").forEach(el => {
        if (el.disabled || !el.id) return;
        limpiarError(el);

        if (el.required) {
            const vacio = el.type === "checkbox" ? !el.checked : (!el.value || !el.value.trim());
            if (vacio) {
                ok = false;
                mostrarError(el, el.id === "terminos" ? "Debes aceptar los términos y condiciones." : MSG_OBLIGATORIO);
                return;
            }
        }
        if (el.type !== "checkbox" && el.type !== "file" && el.value.trim() && VALIDADORES[el.id]) {
            const r = VALIDADORES[el.id](el.value.trim());
            if (r !== true) {
                ok = false;
                mostrarError(el, r);
            }
        }
    });

    // Horario: la hora final debe ser posterior a la inicial
    const desde = paso.querySelector("#horarioContactoDesde");
    const hasta = paso.querySelector("#horarioContactoHasta");
    if (desde && hasta && desde.value && hasta.value && desde.value >= hasta.value) {
        ok = false;
        mostrarError(hasta, "La hora final debe ser posterior a la inicial.");
    }

    // Constancia fiscal: solo PDF
    const pdf = paso.querySelector("#fiscalSituacion");
    if (pdf && !pdf.disabled && pdf.files[0] && !/\.pdf$/i.test(pdf.files[0].name)) {
        ok = false;
        mostrarError(pdf, "Solo se permiten archivos PDF.");
    }

    const alertaGlobal = document.getElementById("alerta-global");
    if (alertaGlobal) alertaGlobal.classList.toggle("oculta", ok);
    return ok;
}

function irAPaso(n) {
    const pasos = document.querySelectorAll(".wizard-paso");
    const indicadores = document.querySelectorAll(".wizard-paso-item");
    pasoActual = Math.max(0, Math.min(n, pasos.length - 1));
    pasos.forEach((p, i) => p.classList.toggle("paso-activo", i === pasoActual));
    indicadores.forEach((it, i) => {
        it.classList.toggle("activo", i === pasoActual);
        it.classList.toggle("completado", i < pasoActual);
    });
    const barra = document.querySelector(".wizard-bar");
    if (barra) barra.scrollIntoView({ behavior: "smooth", block: "start" });
}

function moverPaso(incremento) {
    if (incremento > 0 && !validarPasoActual(pasoActual)) return;
    const alertaGlobal = document.getElementById("alerta-global");
    if (alertaGlobal) alertaGlobal.classList.add("oculta");
    irAPaso(pasoActual + incremento);
}

// ---------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    console.log("MecaGest cargado correctamente");

    // 1. Subrayado automático y limpieza de errores
    document.querySelectorAll("input, select, textarea").forEach(campo => {
        evaluarCampo(campo);
        campo.addEventListener("input", () => evaluarCampo(campo));
        campo.addEventListener("change", () => {
            evaluarCampo(campo);
            if (campo.type === "checkbox") limpiarError(campo);
        });
    });

    // 2. Edad
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
            const dm = hoy.getMonth() - nacimiento.getMonth();
            const dd = hoy.getDate() - nacimiento.getDate();
            if (dm < 0 || (dm === 0 && dd < 0)) edad--;
            if (edad >= 18) {
                resultadoEdad.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--mayor");
            } else {
                resultadoEdad.textContent = `Eres menor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--menor");
            }
        });
    }

    // 3. Mostrar / ocultar contraseña
    document.querySelectorAll("[data-ojo]").forEach(btn => {
        btn.addEventListener("click", () => {
            const inp = document.getElementById(btn.dataset.ojo);
            const mostrar = inp.type === "password";
            inp.type = mostrar ? "text" : "password";
            btn.innerHTML = mostrar ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            btn.setAttribute("aria-label", mostrar ? "Ocultar contraseña" : "Mostrar contraseña");
        });
    });

    // 4. Vista previa del QR de WhatsApp
    const qrInput = document.getElementById("whatsAppQr");
    const imgPreview = document.getElementById("qrPreview");
    const placeholder = document.getElementById("preview-placeholder");
    const qrError = document.getElementById("qrError");
    const qrNombre = document.getElementById("qrNombre");
    const qrAcciones = document.getElementById("qrAcciones");
    const qrQuitar = document.getElementById("quitarQr");

    function resetPreview() {
        if (!qrInput) return;
        qrInput.value = "";
        imgPreview.src = "";
        imgPreview.classList.add("oculta");
        qrError.classList.add("oculta");
        placeholder.classList.remove("oculta");
        qrNombre.textContent = "";
        qrAcciones.classList.add("oculta");
    }
    function errorPreview(nombre) {
        imgPreview.classList.add("oculta");
        placeholder.classList.add("oculta");
        qrError.classList.remove("oculta");
        qrNombre.textContent = "Archivo: " + nombre;
        qrAcciones.classList.remove("oculta");
    }

    if (qrInput) {
        qrInput.addEventListener("change", function () {
            const file = qrInput.files && qrInput.files[0];
            if (!file) { resetPreview(); return; }
            qrNombre.textContent = "Archivo: " + file.name;
            qrAcciones.classList.remove("oculta");
            if (!file.type.startsWith("image/")) { errorPreview(file.name); return; }
            const reader = new FileReader();
            reader.onload = e => {
                imgPreview.onerror = () => errorPreview(file.name);
                imgPreview.src = e.target.result;
                imgPreview.classList.remove("oculta");
                placeholder.classList.add("oculta");
                qrError.classList.add("oculta");
            };
            reader.onerror = () => errorPreview(file.name);
            reader.readAsDataURL(file);
        });
        qrQuitar.addEventListener("click", resetPreview);
    }

    // 5. Redes sociales: se habilitan al marcar su casilla
    function syncSocial(chk) {
        const target = document.getElementById(chk.dataset.social);
        const ayuda = document.getElementById(chk.dataset.ayuda);
        target.disabled = !chk.checked;
        if (ayuda) ayuda.textContent = chk.checked ? ayuda.dataset.on : ayuda.dataset.off;
        if (!chk.checked) {
            limpiarError(target);
            if (target.type === "file") resetPreview(); else target.value = "";
            evaluarCampo(target);
        }
    }
    document.querySelectorAll("[data-social]").forEach(chk => {
        chk.addEventListener("change", () => syncSocial(chk));
        syncSocial(chk);
    });

    // 6. Facturación opcional
    const chkFact = document.getElementById("quiereFactura");
    function syncFactura() {
        if (!chkFact) return;
        document.querySelectorAll("[data-fiscal]").forEach(el => {
            el.disabled = !chkFact.checked;
            if (!chkFact.checked) { el.value = ""; limpiarError(el); evaluarCampo(el); }
        });
        document.getElementById("rfc").required = chkFact.checked;
        document.getElementById("rfcAst").classList.toggle("oculta", !chkFact.checked);
        document.getElementById("bloqueFactura").classList.toggle("bloque-deshabilitado", !chkFact.checked);
    }
    if (chkFact) { chkFact.addEventListener("change", syncFactura); syncFactura(); }

    // 7. Domicilio asistido (catálogo local, sin API; se permite captura manual)
    const DOM = window.MECAGEST_DOMICILIOS;
    const pais = document.getElementById("pais");
    const estado = document.getElementById("estado");
    const ciudad = document.getElementById("ciudad");
    const cp = document.getElementById("codigoPostal");
    const notaCp = document.getElementById("notaCp");

    function llenarLista(id, items) {
        const dl = document.getElementById(id);
        if (!dl) return;
        dl.innerHTML = "";
        items.forEach(t => { const o = document.createElement("option"); o.value = t; dl.appendChild(o); });
    }
    function actualizarListas() {
        if (!DOM || !pais) return;
        const esMx = norm(pais.value) === "mexico";
        llenarLista("listaEstados", esMx ? DOM.estadosMexico : []);
        const ciudades = DOM.ejemplosMexico
            .filter(x => esMx && (!estado.value || norm(x.estado) === norm(estado.value)))
            .map(x => x.ciudad);
        llenarLista("listaCiudades", ciudades);
    }
    function sugerirCP() {
        if (!DOM || !ciudad || cp.dataset.manual) return;
        const m = DOM.ejemplosMexico.find(x => norm(x.ciudad) === norm(ciudad.value) &&
            (!estado.value || norm(x.estado) === norm(estado.value)));
        if (m && norm(pais.value) === "mexico") {
            if (!estado.value) { estado.value = m.estado; evaluarCampo(estado); }
            cp.value = m.cp;
            evaluarCampo(cp);
            notaCp.classList.remove("oculta");
        }
    }
    if (DOM && pais) {
        llenarLista("listaPaises", DOM.paises);
        actualizarListas();
        pais.addEventListener("input", actualizarListas);
        estado.addEventListener("input", () => { actualizarListas(); sugerirCP(); });
        ciudad.addEventListener("input", sugerirCP);
        cp.addEventListener("input", () => {
            cp.dataset.manual = cp.value ? "1" : "";
            if (!cp.value) notaCp.classList.add("oculta");
        });
    }

    // 8. Formulario de registro: enviar y limpiar
    const form = document.getElementById("registroForm");
    const mensajeSimulacion = document.getElementById("mensajeSimulacion");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const total = document.querySelectorAll(".wizard-paso").length;
            if (pasoActual < total - 1) { moverPaso(1); return; }
            for (let i = 0; i < total; i++) {
                if (!validarPasoActual(i)) { irAPaso(i); return; }
            }
            mensajeSimulacion.classList.remove("oculta");
            mensajeSimulacion.style.display = "block";
            mensajeSimulacion.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        form.addEventListener("reset", function () {
            setTimeout(() => {
                form.querySelectorAll("input, select, textarea").forEach(el => { limpiarError(el); evaluarCampo(el); });
                document.querySelectorAll("[data-social]").forEach(syncSocial);
                syncFactura();
                resetPreview();
                if (cp) { cp.dataset.manual = ""; notaCp.classList.add("oculta"); }
                actualizarListas();
                if (resultadoEdad) {
                    resultadoEdad.className = "";
                    resultadoEdad.textContent = "Selecciona una fecha para calcular tu edad.";
                }
                const alertaGlobal = document.getElementById("alerta-global");
                if (alertaGlobal) alertaGlobal.classList.add("oculta");
                if (mensajeSimulacion) { mensajeSimulacion.classList.add("oculta"); mensajeSimulacion.style.display = "none"; }
            }, 0);
        });
    }

    // 9. Próximas citas: el radio habilita solo su selector
    const radiosFiltro = document.querySelectorAll('input[name="appoimentFilter"]');
    if (radiosFiltro.length) {
        const mes = document.getElementById("filtroMes");
        const semana = document.getElementById("filtroSemana");
        const sync = () => {
            const porMes = document.getElementById("appoimentByMonth").checked;
            mes.disabled = !porMes;
            semana.disabled = porMes;
        };
        radiosFiltro.forEach(r => r.addEventListener("change", sync));
        sync();
    }

    // 10. Salidas de almacén: el catálogo depende de la categoría
    const radiosCat = document.querySelectorAll('input[name="ressourceCategory"]');
    if (radiosCat.length) {
        const select = document.getElementById("toolSelect");
        const CATALOGO = {
            refaccion: {
                "Piezas de Motor": [["bujia", "Bujía"], ["filtro_aceite", "Filtro de aceite"], ["banda_distribucion", "Banda de distribución"]],
                "Piezas de Transmisión": [["disco_embrague", "Disco de embrague"], ["collarin", "Collarín de embrague"], ["junta_homocinetica", "Junta homocinética"], ["semieje", "Semieje de transmisión"]],
                "Piezas de Suspensión": [["amortiguador", "Amortiguador"], ["rotula", "Rótula de suspensión"]]
            },
            tool: {
                "Llaves y Herramientas Especializadas": [["llave_combinada", "Llave combinada"], ["llave_torx", "Llave Torx"], ["llave_dinamometrica", "Llave dinamométrica"], ["compresor_resortes", "Compresor de Resortes"], ["scanner_obd2", "Escáner automotriz OBD-II"], ["extractor_poleas", "Extractor de Poleas"]]
            }
        };
        const llenar = () => {
            const cat = document.querySelector('input[name="ressourceCategory"]:checked').value;
            select.innerHTML = '<option value="">Selecciona un recurso</option>';
            Object.entries(CATALOGO[cat]).forEach(([grupo, items]) => {
                const og = document.createElement("optgroup");
                og.label = grupo;
                items.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; og.appendChild(o); });
                select.appendChild(og);
            });
        };
        radiosCat.forEach(r => r.addEventListener("change", llenar));
        llenar();
    }
});
