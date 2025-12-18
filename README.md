# Proyecto de Criptografía - Grupo 6

**Actividad 4**  
**Clase:** Criptografía (NRC 3394)  
**Institución:** Instituto Superior Tecnológico San Antonio (TESA)

## 👥 Integrantes del Grupo
*   **JOSE FRANCISCO CRUZ CORRO**
*   **ERIC GEOVANNY MORALES JIMENEZ**
*   **Cristian Steven Cedeño Rosario**

---

## 🔐 Descripción del Proyecto
Esta aplicación web es una herramienta educativa y funcional diseñada para demostrar el funcionamiento de varios algoritmos de cifrado clásicos. Ofrece una interfaz moderna, interactiva y segura para cifrar y descifrar mensajes de texto.

El objetivo es proporcionar una plataforma visual para entender cómo funcionan las técnicas de sustitución y transposición básicas en criptografía.

## 🚀 Características Principales

### Algoritmos Soportados
1.  **Atbash:** Cifrado por sustitución monoalfabética que invierte el alfabeto (A↔Z, B↔Y).
2.  **César:** Cifrado por desplazamiento donde cada letra se mueve un número fijo de posiciones.
3.  **ROT13:** Un caso especial del cifrado César con un desplazamiento fijo de 13 posiciones.
4.  **Vigenère:** Cifrado polialfabético que utiliza una palabra clave para variar el desplazamiento.

### Funcionalidades de la Interfaz
*   **Diseño Moderno:** Estilo "Dark Mode" inspirado en GitHub y entornos de desarrollo profesionales.
*   **Fondo Animado:** Visualización de partículas espaciales interactiva implementada con **Three.js**.
*   **Salida Retro:** Los resultados se muestran en un contenedor estilo "Terminal de Hacker" con efectos de escritura.
*   **Tutorial Guiado:** Un recorrido interactivo paso a paso (usando **Driver.js**) que explica cómo usar la herramienta al iniciar.
*   **Validación en Tiempo Real:** Asegura que solo se ingresen caracteres válidos (Alfabeto Español + Espacios).

## 💻 Estructura y Código

El proyecto ha sido desarrollado con un enfoque en la optimización y el rendimiento ("Ultra Optimized"), reduciendo el código a lo esencial sin sacrificar legibilidad mediante comentarios detallados.

### Archivos del Proyecto
*   `index.html`: Estructura semántica, accesible y limpia.
*   `css/style.css`: Hoja de estilos organizada por componentes, utilizando Variables CSS (`:root`) para fácil mantenimiento y diseño responsivo.
*   `js/main.js`: Núcleo lógico de la aplicación.
    *   **Lógica Unificada:** Se utiliza una única función matemática maestra para procesar las transformaciones de texto de todos los algoritmos, reduciendo la redundancia.
    *   **Eficiencia:** Delegación de eventos global y manipulación mínima del DOM.

### Tecnologías Utilizadas
*   **HTML5 / CSS3**
*   **JavaScript (ES6+)**
*   **Three.js** (Renderizado 3D para el fondo)
*   **Driver.js** (Motor de tutoriales)

---
&copy; 2025 Grupo 6 - Criptografía TESA
