(() => {
  'use strict';

  const ejercicios = [
    { letra: 'A', puntos: [1] },
    { letra: 'B', puntos: [1, 2] },
    { letra: 'C', puntos: [1, 4] },
    { letra: 'D', puntos: [1, 4, 5] },
    { letra: 'E', puntos: [1, 5] },
    { letra: 'F', puntos: [1, 2, 4] },
    { letra: 'G', puntos: [1, 2, 4, 5] },
    { letra: 'H', puntos: [1, 2, 5] },
    { letra: 'I', puntos: [2, 4] },
    { letra: 'J', puntos: [2, 4, 5] }
  ];

  const puntos = [...document.querySelectorAll('.punto')];
  const radiosModo = [...document.querySelectorAll('input[name="modo"]')];
  const letraObjetivo = document.getElementById('letra-objetivo');
  const opcionesLectura = document.getElementById('opciones-lectura');
  const etiquetaReto = document.getElementById('etiqueta-reto');
  const tituloPractica = document.getElementById('titulo-practica');
  const instruccion = document.getElementById('instruccion');
  const numeroEjercicio = document.getElementById('numero-ejercicio');
  const totalEjercicios = document.getElementById('total-ejercicios');
  const aciertosElemento = document.getElementById('aciertos');
  const resultado = document.getElementById('resultado');
  const botonLimpiar = document.getElementById('boton-limpiar');
  const botonComprobar = document.getElementById('boton-comprobar');
  const botonSiguiente = document.getElementById('boton-siguiente');
  const botonPista = document.getElementById('boton-pista');
  const interruptorAyuda = document.getElementById('interruptor-ayuda');
  const interruptorNumeros = document.getElementById('interruptor-numeros');
  const estadoAyuda = document.getElementById('estado-ayuda');
  const estadoNumeros = document.getElementById('estado-numeros');
  const descripcionAyuda = document.getElementById('descripcion-ayuda');
  const descripcionNumeros = document.getElementById('descripcion-numeros');
  const controlAyuda = document.getElementById('control-ayuda');
  const controlNumeros = document.getElementById('control-numeros');
  const contenedorPista = document.getElementById('contenedor-pista');
  const mensajeSinAyuda = document.getElementById('mensaje-sin-ayuda');
  const ayudaReto = document.getElementById('titulo-reto');
  const ayudaCelda = document.getElementById('ayuda-celda');
  const celdaBraille = document.getElementById('celda-braille');

  let indice = 0;
  let aciertos = 0;
  let respuestaCorrecta = false;
  let ayudaActiva = true;
  let numerosVisibles = true;
  let modo = 'lectura';
  let letraSeleccionada = '';

  totalEjercicios.textContent = String(ejercicios.length);

  function seleccionados() {
    return puntos
      .filter((punto) => punto.getAttribute('aria-pressed') === 'true')
      .map((punto) => Number(punto.dataset.punto))
      .sort((a, b) => a - b);
  }

  function establecerPuntos(activos, interactivos) {
    puntos.forEach((punto) => {
      const numero = Number(punto.dataset.punto);
      const activo = activos.includes(numero);
      punto.setAttribute('aria-pressed', String(activo));
      punto.disabled = !interactivos;
      punto.setAttribute('aria-label', `Punto ${numero} ${activo ? 'seleccionado' : 'desactivado'}${interactivos ? '' : ', solo lectura'}`);
    });
    celdaBraille.classList.toggle('celda-solo-lectura', !interactivos);
  }

  function limpiarCelda() {
    establecerPuntos([], true);
  }

  function crearOpcionesLectura() {
    const ejercicio = ejercicios[indice];
    const candidatas = new Set([ejercicio.letra]);
    let desplazamiento = 1;
    while (candidatas.size < 4) {
      candidatas.add(ejercicios[(indice + desplazamiento * 3) % ejercicios.length].letra);
      desplazamiento += 1;
    }

    const ordenadas = [...candidatas].sort(() => Math.random() - 0.5);
    opcionesLectura.innerHTML = '';
    ordenadas.forEach((letra) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'opcion-letra';
      boton.textContent = letra;
      boton.setAttribute('aria-pressed', 'false');
      boton.addEventListener('click', () => {
        [...opcionesLectura.querySelectorAll('.opcion-letra')].forEach((opcion) => opcion.setAttribute('aria-pressed', 'false'));
        boton.setAttribute('aria-pressed', 'true');
        letraSeleccionada = letra;
      });
      opcionesLectura.appendChild(boton);
    });
  }

  function actualizarAyuda(anunciar = true) {
    ayudaActiva = interruptorAyuda.checked;
    estadoAyuda.textContent = ayudaActiva ? 'Activada' : 'Desactivada';
    descripcionAyuda.textContent = ayudaActiva ? 'Las pistas están disponibles.' : 'Las pistas y orientaciones están ocultas.';
    controlAyuda.classList.toggle('ayuda-encendida', ayudaActiva);
    controlAyuda.classList.toggle('ayuda-apagada', !ayudaActiva);
    contenedorPista.hidden = !ayudaActiva;
    mensajeSinAyuda.hidden = ayudaActiva;
    ayudaReto.hidden = !ayudaActiva;
    ayudaCelda.hidden = !ayudaActiva;

    if (!ayudaActiva && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    if (anunciar) {
      resultado.className = 'resultado';
      resultado.textContent = ayudaActiva ? 'Ayuda activada.' : 'Ayuda desactivada. Resuelve sin pistas.';
    }
  }

  function actualizarNumeros(anunciar = true) {
    numerosVisibles = interruptorNumeros.checked;
    estadoNumeros.textContent = numerosVisibles ? 'Visible' : 'Oculta';
    descripcionNumeros.textContent = numerosVisibles ? 'Los números están visibles.' : 'Los números están ocultos para aumentar la complejidad.';
    controlNumeros.classList.toggle('numeros-encendidos', numerosVisibles);
    controlNumeros.classList.toggle('numeros-apagados', !numerosVisibles);
    celdaBraille.classList.toggle('sin-numeros', !numerosVisibles);
    if (anunciar) {
      resultado.className = 'resultado';
      resultado.textContent = numerosVisibles ? 'Numeración visible.' : 'Numeración oculta. La dificultad aumentó.';
    }
  }

  function mostrarEjercicio() {
    const ejercicio = ejercicios[indice];
    numeroEjercicio.textContent = String(indice + 1);
    respuestaCorrecta = false;
    botonSiguiente.disabled = true;
    botonComprobar.disabled = false;
    letraSeleccionada = '';

    if (modo === 'lectura') {
      tituloPractica.textContent = 'Modo lectura';
      instruccion.textContent = 'Observa el signo Braille y selecciona la letra que representa.';
      etiquetaReto.textContent = 'Selecciona la letra correcta';
      letraObjetivo.hidden = true;
      opcionesLectura.hidden = false;
      botonLimpiar.hidden = true;
      establecerPuntos(ejercicio.puntos, false);
      crearOpcionesLectura();
      ayudaReto.textContent = 'Observa la combinación y elige una respuesta.';
      resultado.textContent = ayudaActiva ? 'Selecciona una letra. Puedes usar una pista.' : 'Selecciona una letra sin ayuda.';
    } else {
      tituloPractica.textContent = 'Modo escritura';
      instruccion.textContent = 'Observa la letra y activa los puntos que forman su signo Braille.';
      etiquetaReto.textContent = 'Letra a representar';
      letraObjetivo.textContent = ejercicio.letra;
      letraObjetivo.hidden = false;
      opcionesLectura.hidden = true;
      botonLimpiar.hidden = false;
      limpiarCelda();
      ayudaReto.textContent = 'Activa los puntos de la celda Braille.';
      resultado.textContent = ayudaActiva ? 'Selecciona los puntos. Puedes usar una pista.' : 'Selecciona los puntos sin ayuda.';
    }
    resultado.className = 'resultado';
  }

  function cambiarModo(nuevoModo) {
    modo = nuevoModo;
    indice = 0;
    aciertos = 0;
    aciertosElemento.textContent = '0';
    botonLimpiar.textContent = 'Limpiar celda';
    botonLimpiar.onclick = null;
    mostrarEjercicio();
  }

  puntos.forEach((punto) => {
    punto.addEventListener('click', () => {
      if (modo !== 'escritura') return;
      const activo = punto.getAttribute('aria-pressed') === 'true';
      punto.setAttribute('aria-pressed', String(!activo));
      punto.setAttribute('aria-label', `Punto ${punto.dataset.punto} ${activo ? 'desactivado' : 'seleccionado'}`);
    });
  });

  radiosModo.forEach((radio) => radio.addEventListener('change', () => {
    if (radio.checked) cambiarModo(radio.value);
  }));
  interruptorAyuda.addEventListener('change', () => actualizarAyuda(true));
  interruptorNumeros.addEventListener('change', () => actualizarNumeros(true));

  botonLimpiar.addEventListener('click', () => {
    if (modo !== 'escritura') return;
    limpiarCelda();
    resultado.className = 'resultado';
    resultado.textContent = 'La celda quedó limpia.';
  });

  botonComprobar.addEventListener('click', () => {
    const ejercicio = ejercicios[indice];
    const correcta = modo === 'lectura'
      ? letraSeleccionada === ejercicio.letra
      : seleccionados().length === ejercicio.puntos.length && seleccionados().every((valor, posicion) => valor === ejercicio.puntos[posicion]);

    if (correcta) {
      if (!respuestaCorrecta) aciertos += 1;
      respuestaCorrecta = true;
      aciertosElemento.textContent = String(aciertos);
      resultado.className = 'resultado correcto';
      resultado.textContent = ayudaActiva
        ? `Respuesta correcta. La letra ${ejercicio.letra} utiliza ${ejercicio.puntos.length === 1 ? 'el punto' : 'los puntos'} ${ejercicio.puntos.join(', ')}.`
        : `Respuesta correcta. Has identificado la letra ${ejercicio.letra}.`;
      botonSiguiente.disabled = false;
      botonComprobar.disabled = true;
    } else {
      resultado.className = 'resultado incorrecto';
      resultado.textContent = ayudaActiva ? 'La respuesta todavía no es correcta. Revisa o solicita una pista.' : 'La respuesta todavía no es correcta. Inténtalo nuevamente.';
    }
  });

  botonSiguiente.addEventListener('click', () => {
    if (indice < ejercicios.length - 1) {
      indice += 1;
      mostrarEjercicio();
      return;
    }
    resultado.className = 'resultado correcto';
    resultado.textContent = `Actividad completada en modo ${modo}. Obtuviste ${aciertos} aciertos de ${ejercicios.length}.`;
    botonSiguiente.disabled = true;
    botonComprobar.disabled = true;
    botonLimpiar.hidden = false;
    botonLimpiar.textContent = 'Reiniciar actividad';
    botonLimpiar.onclick = () => cambiarModo(modo);
  });

  botonPista.addEventListener('click', () => {
    if (!ayudaActiva) return;
    const ejercicio = ejercicios[indice];
    const mensaje = modo === 'lectura'
      ? `El signo utiliza ${ejercicio.puntos.length === 1 ? 'el punto' : 'los puntos'} ${ejercicio.puntos.join(', ')}.`
      : `La letra ${ejercicio.letra} utiliza ${ejercicio.puntos.length === 1 ? 'el punto' : 'los puntos'} ${ejercicio.puntos.join(', ')}.`;
    resultado.className = 'resultado';
    resultado.textContent = mensaje;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const voz = new SpeechSynthesisUtterance(mensaje);
      voz.lang = 'es-PE';
      window.speechSynthesis.speak(voz);
    }
  });

  actualizarAyuda(false);
  actualizarNumeros(false);
  mostrarEjercicio();
})();