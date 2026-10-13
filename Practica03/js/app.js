// Carrusel y modal multimedia: JavaScript básico, sin librerías.
const tarjetas = [...document.querySelectorAll('.favorito-card')];
const pista = document.getElementById('pista');
const indicadores = document.getElementById('indicadores');
let indice = 0;

tarjetas.forEach((tarjeta, i) => {
    const punto = document.createElement('button');
    punto.type = 'button';
    punto.setAttribute('aria-label', `Mostrar favorito ${i + 1}`);
    punto.addEventListener('click', () => mostrar(i));
    indicadores.appendChild(punto);
});
function mostrar(n) {
    indice = (n + tarjetas.length) % tarjetas.length;
    pista.style.transform = `translateX(-${indice * 100}%)`;
    [...indicadores.children].forEach((punto, i) => {
        punto.classList.toggle('activo', i === indice);
        punto.setAttribute('aria-current', i === indice ? 'true' : 'false');
    });
}
document.getElementById('anterior').addEventListener('click', () => mostrar(indice - 1));
document.getElementById('siguiente').addEventListener('click', () => mostrar(indice + 1));
mostrar(0);

const modal = document.getElementById('modal-favoritos');
const contenido = document.getElementById('modal-contenido');
const titulo = document.getElementById('modal-titulo');
const cerrar = document.getElementById('cerrar-modal');
let focoAnterior = null;
function abrir(tarjeta) {
    focoAnterior = document.activeElement;
    titulo.textContent = tarjeta.dataset.titulo;
    const tipo = tarjeta.dataset.tipo;
    const src = tarjeta.dataset.src;
    let visor;
    if (tipo === 'video') {
        visor = document.createElement('video');
        visor.controls = true;
        visor.playsInline = true;
    } else if (tipo === 'audio') {
        visor = document.createElement('audio');
        visor.controls = true;
    } else {
        visor = document.createElement('iframe');
        visor.title = 'Vista previa del capítulo PDF';
    }
    visor.src = src;
    contenido.replaceChildren(visor);
    modal.hidden = false;
    document.body.classList.add('modal-abierto');
    document.querySelectorAll('body > :not(#modal-favoritos)').forEach(el => el.inert = true);
    cerrar.focus();
}
function cerrarModal() {
    contenido.querySelectorAll('video, audio').forEach(media => media.pause());
    contenido.replaceChildren(); // Detiene la reproducción y descarga del visor
    modal.hidden = true;
    document.body.classList.remove('modal-abierto');
    document.querySelectorAll('body > :not(#modal-favoritos)').forEach(el => el.inert = false);
    if (focoAnterior) focoAnterior.focus();
}
tarjetas.forEach(tarjeta => tarjeta.addEventListener('click', () => abrir(tarjeta)));
cerrar.addEventListener('click', cerrarModal);
modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') cerrarModal();
    if (e.key === 'Tab') { // El foco permanece dentro del modal
        const elementos = [cerrar, ...contenido.querySelectorAll('button, a, video, audio, iframe')];
        const primero = elementos[0], ultimo = elementos[elementos.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
});
const anio = document.getElementById('anio');
if (anio) anio.textContent = `© ${new Date().getFullYear()} - Mi primera página web`;

    