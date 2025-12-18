/* ============================================
   SISTEMA DE CIFRADO - ULTRA OPTIMIZADO
   ============================================ */
(function () {
  'use strict';
  
  // --- UTILIDADES BÁSICAS ---
  // D: Alias para document
  // $: Selector rápido por ID
  const D = document, $ = i => D.getElementById(i);
  
  // Alfabeto español (incluye Ñ) - 27 caracteres
  const A = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ', L = A.length;
  
  // Información estática para la UI (Título, Descripción, Ejemplo)
  const info = {
    caesar: ['Cifrado César', 'Desplaza cada letra un número fijo.', 'A → D (+3)'],
    vigenere: ['Cifrado Vigenère', 'Usa clave para desplazamiento variable.', 'Clave "SOL": A → S'],
    atbash: ['Cifrado Atbash', 'Invierte el alfabeto.', 'A ↔ Z'],
    rot13: ['ROT13', 'César con desplazamiento 13.', 'A ↔ N']
  };
  
  // Estado global de la aplicación
  let st = { algo: 'atbash', last: '' }, phInt;
  
  // --- LÓGICA MATEMÁTICA UNIFICADA ---
  // mod: Módulo matemático correcto para números negativos (ej: -1 % 27 -> 26)
  const mod = n => ((n % L) + L) % L;
  
  // trans: Función maestra de transformación.
  // Recorre el texto, ignora caracteres no válidos y aplica la función 'fn' a los índices.
  const trans = (txt, fn) => txt.toUpperCase().replace(/[A-ZÑ]/g, c => A[mod(fn(A.indexOf(c)))]);

  // Definición de Algoritmos usando la función 'trans'
  const algos = {
    // Atbash: Invierte el índice (0 -> 26, 1 -> 25...)
    atbash: t => trans(t, i => L - 1 - i),
    
    // César: Suma (cifrar) o resta (descifrar) el desplazamiento 's'
    caesar: (t, s, enc) => trans(t, i => i + (enc ? s : -s)),
    
    // ROT13: Es un César con desplazamiento fijo de 13
    rot13: (t, _, enc) => algos.caesar(t, 13, enc),
    
    // Vigenère: Usa una clave 'k' para determinar el desplazamiento de cada letra
    vigenere: (t, k, enc) => {
      let j = 0; // Índice para recorrer la clave cíclicamente
      return trans(t, i => {
        const s = A.indexOf(k[j++ % k.length]); // Obtener valor de desplazamiento de la clave
        return i + (enc ? s : -s);
      });
    }
  };

  // --- INICIALIZACIÓN Y EVENTOS ---
  function init() {
    // Helper para añadir eventos
    const on = (ev, el, fn) => el?.addEventListener(ev, fn);
    
    // Validación de entrada (Solo letras y espacios)
    const val = () => {
       const v = /^[A-ZÑa-zñ\s]*$/.test($('message').value);
       $('msgError').textContent = v ? '' : 'Solo letras y espacios.';
       return v;
    };
    
    // Evento: Enviar Formulario (Procesar Cifrado)
    on('submit', $('cipherForm'), e => {
      e.preventDefault();
      const m = $('message').value.trim();
      
      // Validar antes de procesar
      if (!m || !val()) return $('msgError').textContent = m ? $('msgError').textContent : 'Escribe un mensaje.';
      
      // Obtener parámetros
      const enc = $('encode').checked; // true = Cifrar, false = Descifrar
      const k = $('keyword').value.toUpperCase().replace(/[^A-ZÑ]/g, '') || 'A'; // Clave limpia
      const s = +$('shift').value || 3; // Desplazamiento numérico
      
      // Ejecutar algoritmo seleccionado
      st.last = algos[st.algo](m, st.algo === 'vigenere' ? k : s, enc);
      
      // Mostrar Resultado con efecto de "Máquina de Escribir"
      const r = $('result');
      if (phInt) clearInterval(phInt); // Detener animación de placeholder
      r.innerHTML = ''; r.classList.add('has-content'); $('copyBtn').disabled = false;
      
      const t = D.createElement('span'); r.append(t, D.createElement('span'));
      r.lastChild.className = 'terminal-cursor'; // Cursor parpadeante
      
      let i = 0;
      (function w() { if(i < st.last.length) { t.textContent += st.last[i++]; setTimeout(w, 30); } })();
    });

    // Delegación de Eventos Global (Optimización de Listeners)
    on('click', D.body, e => {
      const id = e.target.id;
      
      // Botón Reset
      if (id === 'resetBtn') { $('cipherForm').reset(); clear(); $('msgError').textContent=''; }
      
      // Botón Copiar
      if (id === 'copyBtn' && st.last) {
         navigator.clipboard.writeText(st.last);
         const b = $('copyBtn'), o = b.innerHTML;
         b.innerHTML = '¡Copiado!'; b.style.color = '#7ee787';
         setTimeout(() => { b.innerHTML = o; b.style.color = ''; }, 2000);
      }
      
      // Botones +/- para Desplazamiento César
      if (id === 'shiftUp' || id === 'shiftDown') {
         const i = $('shift');
         i.value = Math.max(1, Math.min(25, (+i.value||0) + (id === 'shiftUp' ? 1 : -1)));
      }
    });

    // Cambios en inputs
    on('change', $('algorithm'), e => ui(e.target.value));
    on('input', $('message'), val);

    // Estado inicial
    ui($('algorithm').value);
    tut(); bg(); ph();
  }

  // --- ACTUALIZACIÓN DE INTERFAZ (UI) ---
  function ui(a) {
    st.algo = a;
    // Mostrar/Ocultar campos según algoritmo
    $('shift-field').classList.toggle('hidden', a !== 'caesar');
    $('keyword-field').classList.toggle('hidden', a !== 'vigenere');
    
    // Actualizar textos informativos
    const i = info[a];
    if (i) { 
      $('algo-title').textContent = i[0]; 
      $('algo-desc').textContent = i[1]; 
      $('algo-example').innerHTML = `<span class="example-chip">${i[2]}</span>`; 
    }
    clear();
  }

  // Limpiar resultado y reiniciar estado
  function clear() {
    const r = $('result'); r.innerHTML = '<span class="result-placeholder"></span>';
    $('copyBtn').disabled = true; st.last = ''; ph();
  }

  // --- EFECTOS VISUALES ---
  
  // Animación del Placeholder (Cursor parpadeante esperando texto)
  function ph() {
    const txt = "// El resultado aparecerá aquí...";
    if (phInt) clearInterval(phInt);
    let i = 0, d = 0;
    phInt = setInterval(() => {
      if (st.last) return; // Si hay resultado real, no animar placeholder
      let el = D.querySelector('.result-placeholder');
      // Restaurar elemento si se perdió
      if (!el && $('result').innerHTML === '') { $('result').innerHTML = '<span class="result-placeholder"></span>'; el = D.querySelector('.result-placeholder'); }
      if (el) {
          el.textContent = txt.substring(0, d ? i-- : i++) + '|';
          if (!d && i === txt.length) d = 1; else if (d && i === 0) d = 0;
      }
    }, 150);
  }

  // Tutorial Guiado (Driver.js)
  function tut() {
     if (localStorage.getItem('tutorialSeen') === 'true' || !window.driver) return;
     window.driver.js.driver({
       showProgress: 1, animate: 1, doneBtnText: '¡Listo!', nextBtnText: 'Sig.', prevBtnText: 'Ant.',
       onDestroy: () => localStorage.setItem('tutorialSeen', 'true'),
       steps: [
         { element: '.main-card header', popover: { title: 'Bienvenido', description: 'Esta es tu herramienta de criptografía segura. Aprende a usarla rápidamente.' } },
         { element: '#step-algorithm', popover: { title: 'Elige tu Algoritmo', description: 'Selecciona entre Atbash, César, ROT13 o Vigenère según lo que necesites.' } },
         { element: '#step-message', popover: { title: 'Tu Mensaje', description: 'Escribe aquí el texto a cifrar o descifrar. Solo letras y espacios.' } },
         { element: '#step-action', popover: { title: '¿Qué hacer?', description: 'Elige si quieres Cifrar (proteger) o Descifrar (leer) el mensaje.' } },
         { element: '#step-buttons', popover: { title: 'Ejecutar', description: 'Presiona "Ejecutar Acción" para procesar el mensaje.' } },
         { element: '#result', popover: { title: 'Resultado', description: 'Aquí aparecerá tu mensaje procesado listo para copiar.' } }
       ]
     }).drive();
  }

  // Fondo Animado de Partículas (Three.js)
  function bg() {
    if (!window.THREE || !$('canvas-container')) return;
    
    // Configuración básica de escena
    const S = new THREE.Scene(), C = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, .1, 1e3), R = new THREE.WebGLRenderer({alpha:1});
    S.background = new THREE.Color(0x0d1117); C.position.z = 5;
    R.setSize(innerWidth, innerHeight); $('canvas-container').appendChild(R.domElement);
    
    // Creación de partículas
    const G = new THREE.BufferGeometry(), P = new Float32Array(2100);
    for(let i=0;i<2100;i++) P[i] = (Math.random()-.5)*15;
    G.setAttribute('position', new THREE.BufferAttribute(P, 3));
    const M = new THREE.Points(G, new THREE.PointsMaterial({size:.02, color:0x58a6ff, transparent:1, opacity:.8}));
    S.add(M);
    
    // Loop de animación
    (function a() { 
      if(!D.hidden) { // Solo animar si la pestaña es visible (ahorro de batería)
        M.rotation.y+=5e-4; M.rotation.x+=2e-4; R.render(S,C); requestAnimationFrame(a); 
      } else setTimeout(a, 500); 
    })();
    
    // Ajuste al redimensionar ventana
    window.onresize = () => { C.aspect = innerWidth/innerHeight; C.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); };
  }

  init();
})();
