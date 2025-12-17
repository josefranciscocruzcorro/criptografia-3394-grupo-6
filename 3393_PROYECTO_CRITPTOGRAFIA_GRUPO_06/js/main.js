/* ============================================
   SISTEMA DE CIFRADO - LÓGICA PRINCIPAL
   ============================================ */
(function () {
  'use strict';

  /* ELEMENTOS DEL DOM */
  const elements = {
    form: document.getElementById('cipherForm'),
    algorithmSelect: document.getElementById('algorithm'),
    messageInput: document.getElementById('message'),
    shiftInput: document.getElementById('shift'),
    keywordInput: document.getElementById('keyword'),
    shiftField: document.getElementById('shift-field'),
    keywordField: document.getElementById('keyword-field'),
    encodeRadio: document.getElementById('encode'),
    decodeRadio: document.getElementById('decode'),
    resultContainer: document.getElementById('result'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn'),
    shiftUpBtn: document.getElementById('shiftUp'),
    shiftDownBtn: document.getElementById('shiftDown'),
    msgError: document.getElementById('msgError'),
    infoTitle: document.getElementById('algo-title'),
    infoDesc: document.getElementById('algo-desc'),
    infoExample: document.getElementById('algo-example')
  };

  /*  CONFIGURACIÓN */
  const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  const ALPHABET_LENGTH = ALPHABET.length;
  // Validación estricta: Solo letras y espacios
  const VALID_CHARS_REGEX = /^[A-ZÑa-zñ\s]*$/;
  let placeholderInterval;

  /*  DATOS DE ALGORITMOS */
  const ALGO_INFO = {
    caesar: { title: 'Cifrado César', desc: 'Desplaza cada letra un número fijo de posiciones.', example: 'A → D (Desplazamiento 3)' },
    vigenere: { title: 'Cifrado Vigenère', desc: 'Usa una palabra clave para un desplazamiento variable.', example: 'Clave "SOL": A → S' },
    atbash: { title: 'Cifrado Atbash', desc: 'Invierte el alfabeto: la primera letra por la última.', example: 'A ↔ Z, B ↔ Y' },
    rot13: { title: 'ROT13', desc: 'Caso especial de César con desplazamiento de 13.', example: 'A ↔ N' }
  };

  let state = {
    currentAlgorithm: 'atbash',
    lastResult: ''
  };

  /* INICIALIZACIÓN */
  function init() {
    registerEvents();
    if (elements.algorithmSelect) {
      state.currentAlgorithm = elements.algorithmSelect.value;
      updateUI(state.currentAlgorithm);
    }

    // Iniciar Tutorial si es necesario
    startTutorial();

    // Iniciar Fondo Animado
    initThreeBackground();

    // Iniciar Animación de Placeholder
    startPlaceholderAnimation();
  }

  /* TUTORIAL (Driver.js) */
  function startTutorial() {
    // Verificar si el tutorial ya fue visto
    if (localStorage.getItem('tutorialSeen') === 'true') {
      return;
    }

    // Verificar carga de librería
    if (typeof window.driver === 'undefined') {
      console.warn('Driver.js no cargado');
      return;
    }

    const driverObj = window.driver.js.driver({
      showProgress: true,
      animate: true,
      doneBtnText: '¡Listo!',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      onDestroy: () => {
        localStorage.setItem('tutorialSeen', 'true');
      },
      steps: [
        {
          element: '.main-card header',
          popover: {
            title: 'Bienvenido',
            description: 'Esta es tu herramienta segura de criptografía. Aprende a usarla en unos simples pasos.'
          }
        },
        {
          element: '#step-algorithm',
          popover: {
            title: 'Elige tu Algoritmo',
            description: 'Selecciona entre Atbash, César, ROT13 o Vigenère según tus necesidades de seguridad.'
          }
        },
        {
          element: '#step-message',
          popover: {
            title: 'Tu Mensaje',
            description: 'Escribe aquí el texto que deseas proteger o revelar. Solo letras y espacios.'
          }
        },
        {
          element: '#step-action',
          popover: {
            title: '¿Qué hacer?',
            description: 'Elige si quieres cifrar (proteger) o descifrar (leer) el mensaje.'
          }
        },
        {
          element: '#step-buttons',
          popover: {
            title: 'Ejecutar',
            description: 'Presiona el botón para ver la magia ocurrir inmediatamente.'
          }
        },
        {
          element: '#result',
          popover: {
            title: 'Resultado',
            description: 'Aquí verás tu mensaje procesado con estilo de terminal retro.'
          }
        },
        {
          element: '.info-section',
          popover: {
            title: 'Información y Seguridad',
            description: 'Aquí verás cómo funciona el cifrado y por qué no usarlo en producción. Aprende sobre sus riesgos y alternativas.'
          }
        }
      ]
    });

    driverObj.drive();
  }

  /*  FONDO ANIMADO (Three.js) */
  function initThreeBackground() {
    if (typeof THREE === 'undefined') return;

    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Escena
    const scene = new THREE.Scene();
    // Color de fondo oscuro para coincidir con CSS
    scene.background = new THREE.Color(0x0d1117);

    // Cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderizador
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Partículas (Estrellas / Polvo espacial)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15; // Esparcir en espacio
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x58a6ff, // Azul acento
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Animación
    function animate() {
      // Pausar si la pestaña no es visible para ahorrar recursos
      if (!document.hidden) {
        requestAnimationFrame(animate);

        // Rotación suave
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;

        renderer.render(scene, camera);
      } else {
        // Comprobar periódicamente si volvió a ser visible
        setTimeout(() => requestAnimationFrame(animate), 500);
      }
    }

    animate();

    // Ajuste al redimensionar ventana
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ANIMACIÓN PLACEHOLDER TIPO MÁQUINA DE ESCRIBIR */
  function startPlaceholderAnimation() {
    const textToType = "// El resultado aparecerá aquí...";
    let charIndex = 0;
    let isDeleting = false;
    let pauseEnd = 0;

    // Limpiar intervalo previo si existe
    if (placeholderInterval) clearInterval(placeholderInterval);

    placeholderInterval = setInterval(() => {
      // Detener si hay contenido real en el resultado
      if (state.lastResult) return;

      // Asegurar que tenemos el elemento placeholder
      let placeholder = document.querySelector('.result-placeholder');
      if (!placeholder) {
        // Si no existe (se borró al mostrar resultado), intentar crearlo si el contenedor está vacío
        if (elements.resultContainer.innerHTML === '') {
          elements.resultContainer.innerHTML = '<span class="result-placeholder"></span>';
          placeholder = document.querySelector('.result-placeholder');
        } else {
          return;
        }
      }

      // Lógica de tipeo
      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      placeholder.textContent = textToType.substring(0, charIndex) + '|';

      // Control de flujo
      if (!isDeleting && charIndex === textToType.length) {
        // Terminó de escribir, esperar un poco antes de borrar
        isDeleting = true;
        // Pequeña pausa simulada mediante contadores externos o simplemente dejando que el loop corra
        // Para simplicidad en setInterval, solo invertimos dirección
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
      }

    }, 150); // Velocidad de tipeo
  }

  /* EVENTOS */
  function registerEvents() {
    elements.form.addEventListener('submit', handleSubmit);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.copyBtn.addEventListener('click', handleCopy);

    if (elements.algorithmSelect) {
      elements.algorithmSelect.addEventListener('change', (e) => updateUI(e.target.value));
    }
    // Validación de Entrada
    elements.messageInput.addEventListener('input', () => validateInput(elements.messageInput, elements.msgError));

    if (elements.shiftUpBtn) {
      elements.shiftUpBtn.addEventListener('click', () => adjustShift(1));
      elements.shiftDownBtn.addEventListener('click', () => adjustShift(-1));
    }
  }

  /* LÓGICA UI */
  function updateUI(algo) {
    state.currentAlgorithm = algo;
    const isCaesar = algo === 'caesar';
    const isVigenere = algo === 'vigenere';

    if (elements.shiftField) elements.shiftField.classList.toggle('hidden', !isCaesar);
    if (elements.keywordField) elements.keywordField.classList.toggle('hidden', !isVigenere);

    const info = ALGO_INFO[algo];
    if (info) {
      if (elements.infoTitle) elements.infoTitle.textContent = info.title;
      if (elements.infoDesc) elements.infoDesc.textContent = info.desc;
      if (elements.infoExample) elements.infoExample.innerHTML = `<span class="example-chip">${info.example}</span>`;
    }
    clearResult();
  }

  function validateInput(input, errorEl) {
    const val = input.value;
    errorEl.textContent = '';
    if (!VALID_CHARS_REGEX.test(val)) {
      errorEl.textContent = 'Solo letras (A-Z) y espacios.';
      return false;
    }
    return true;
  }

  /* LÓGICA CORE */
  function handleSubmit(e) {
    e.preventDefault();
    const msg = elements.messageInput.value.trim();
    if (!msg) {
      elements.msgError.textContent = 'Por favor escribe un mensaje.';
      return;
    }
    if (!validateInput(elements.messageInput, elements.msgError)) return;

    const action = elements.encodeRadio.checked ? 'encode' : 'decode';
    const algo = state.currentAlgorithm;
    let result = '';

    try {
      const cleanMsg = msg.toUpperCase();
      switch (algo) {
        case 'atbash': result = atbash(cleanMsg); break;
        case 'caesar':
          const s = parseInt(elements.shiftInput.value) || 3;
          result = caesar(cleanMsg, s, action);
          break;
        case 'rot13': result = caesar(cleanMsg, 13, action); break;
        case 'vigenere':
          const k = elements.keywordInput.value.toUpperCase().replace(/[^A-ZÑ]/g, '');
          if (!k && algo === 'vigenere') { /* manejar error */ }
          result = vigenere(cleanMsg, k || 'A', action);
          break;
      }
      displayTerminalResult(result);
      state.lastResult = result;
    } catch (err) { console.error(err); }
  }

  /* EFECTO TERMINAL RESULTADO */
  function displayTerminalResult(text) {
    // Detener animación placeholder
    if (placeholderInterval) clearInterval(placeholderInterval);

    elements.resultContainer.innerHTML = ''; // Limpiar
    elements.resultContainer.classList.add('has-content');
    elements.copyBtn.disabled = false;

    // Crear span de texto y cursor
    const textSpan = document.createElement('span');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'terminal-cursor';

    elements.resultContainer.appendChild(textSpan);
    elements.resultContainer.appendChild(cursorSpan);

    // Efecto de escritura
    let i = 0;
    const speed = 30; // ms por caracter

    function typeWriter() {
      if (i < text.length) {
        textSpan.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }
    typeWriter();
  }

  function clearResult() {
    elements.resultContainer.innerHTML = '<span class="result-placeholder"></span>';
    elements.copyBtn.disabled = true;
    state.lastResult = '';

    // Reiniciar animación placeholder
    startPlaceholderAnimation();
  }

  /* 🧮 ALGORITMOS DE CIFRADO */
  function atbash(text) {
    return text.split('').map(char => {
      const idx = ALPHABET.indexOf(char);
      return idx === -1 ? char : ALPHABET[ALPHABET_LENGTH - 1 - idx];
    }).join('');
  }

  function caesar(text, shift, action) {
    const s = action === 'encode' ? shift : -shift;
    return text.split('').map(char => {
      const idx = ALPHABET.indexOf(char);
      if (idx === -1) return char;
      let nIdx = (idx + s) % ALPHABET_LENGTH;
      if (nIdx < 0) nIdx += ALPHABET_LENGTH;
      return ALPHABET[nIdx];
    }).join('');
  }

  function vigenere(text, key, action) {
    let kIdx = 0;
    return text.split('').map(char => {
      const cIdx = ALPHABET.indexOf(char);
      if (cIdx === -1) return char;
      const kChar = key[kIdx % key.length];
      const kShift = ALPHABET.indexOf(kChar);
      kIdx++;
      let nIdx = action === 'encode' ? (cIdx + kShift) : (cIdx - kShift);
      nIdx = (nIdx % ALPHABET_LENGTH + ALPHABET_LENGTH) % ALPHABET_LENGTH;
      return ALPHABET[nIdx];
    }).join('');
  }

  /* 🛠 UTILIDADES */
  function adjustShift(d) {
    let v = parseInt(elements.shiftInput.value) || 0;
    v = Math.max(1, Math.min(25, v + d));
    elements.shiftInput.value = v;
  }

  function handleReset() {
    elements.form.reset();
    clearResult();
    elements.msgError.textContent = '';
    elements.messageInput.focus();
  }

  function handleCopy() {
    if (!state.lastResult) return;
    navigator.clipboard.writeText(state.lastResult).then(() => {
      const original = elements.copyBtn.innerHTML;
      elements.copyBtn.innerHTML = '¡Copiado!';
      elements.copyBtn.style.color = '#7ee787';
      setTimeout(() => {
        elements.copyBtn.innerHTML = original;
        elements.copyBtn.style.color = '';
      }, 2000);
    });
  }

  init();
})();
