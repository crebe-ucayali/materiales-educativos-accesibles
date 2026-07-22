(() => {
  'use strict';

  const resultado = document.getElementById('resultado');
  const aciertos = document.getElementById('aciertos');
  const total = document.getElementById('total-ejercicios');
  const panel = document.getElementById('panel-constancia');
  const nombre = document.getElementById('nombre-constancia');
  const botonGenerar = document.getElementById('generar-constancia');
  const dialogo = document.getElementById('dialogo-constancia');
  const nombreFinal = document.getElementById('constancia-nombre');
  const fechaFinal = document.getElementById('constancia-fecha');
  const codigoFinal = document.getElementById('constancia-codigo');
  const cerrar = document.getElementById('cerrar-constancia');
  const imprimir = document.getElementById('imprimir-constancia');

  if (!resultado || !panel || !botonGenerar || !dialogo) return;

  function generarCodigo() {
    const fecha = new Date();
    const sello = fecha.toISOString().slice(0, 10).replaceAll('-', '');
    const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `MEA-BRAILLE-${sello}-${aleatorio}`;
  }

  function revisarFinalizacion() {
    const completo = resultado.textContent.includes('Actividad completada');
    const puntajePerfecto = Number(aciertos?.textContent || 0) === Number(total?.textContent || 0);
    panel.hidden = !(completo && puntajePerfecto);
    if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const observador = new MutationObserver(revisarFinalizacion);
  observador.observe(resultado, { childList: true, subtree: true, characterData: true });

  botonGenerar.addEventListener('click', () => {
    const participante = nombre.value.trim();
    if (!participante) {
      nombre.focus();
      nombre.setCustomValidity('Escribe el nombre del participante.');
      nombre.reportValidity();
      return;
    }
    nombre.setCustomValidity('');
    nombreFinal.textContent = participante;
    fechaFinal.textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date());
    codigoFinal.textContent = generarCodigo();
    dialogo.showModal();
  });

  nombre.addEventListener('input', () => nombre.setCustomValidity(''));
  cerrar.addEventListener('click', () => dialogo.close());
  imprimir.addEventListener('click', () => window.print());
  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) dialogo.close();
  });
})();