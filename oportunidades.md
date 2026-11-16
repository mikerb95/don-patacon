# Oportunidades de DON PATACÓN

Reúne lo que se ha investigado sobre el proyecto y para qué nos sirve: qué
decisión permite tomar o qué trabajo justifica.

Actualizado: 5 de noviembre de 2026. Lo que falta por hacer, paso a paso, está en
[pendientes.md](./pendientes.md).

## En qué se basa este documento

| Fuente | Qué aporta | Fecha |
| --- | --- | --- |
| Revisión completa del código en esta etapa | Dependencia de BCMS, restos de plantilla, estado de las páginas | Nov. 2026 |
| Pruebas del panel y del sitio en navegador, con capturas | Fallos reales de uso y de seguridad | Nov. 2026 |
| `npm audit` | Vulnerabilidades de las dependencias | Nov. 2026 |
| Auditoría y análisis de brechas anteriores (`hallazgos-fable.md`, borrado del repo, disponible en el historial de git) | Lista inicial de brechas de una web de restaurante | Jul. 2026 |

**Límites:** no hay investigación de mercado, competencia, encuestas ni pruebas
con clientes o con el dueño. El sitio tampoco está en producción, así que no hay
datos de visitas ni de pedidos. Por eso cada oportunidad indica su **respaldo**:

- **Comprobado:** se vio en el código o en una prueba.
- **Hipótesis:** es razonable, pero falta confirmarlo con datos o con el negocio.

## Resumen: por dónde empezar

| # | Oportunidad | Para qué nos sirve | Respaldo | Esfuerzo |
| --- | --- | --- | --- | --- |
| 1 | Salir a producción | Sin esto, nada llega a un cliente | Comprobado | Bajo |
| 2 | Cargar contenido real | El sitio aún no tiene platos ni datos de contacto | Comprobado | Medio (negocio) |
| 3 | Probar el panel con el dueño | Evita construir sobre suposiciones | Comprobado | Bajo |
| 4 | SEO local | Que aparezca a quien busca dónde comer cerca | Hipótesis | Bajo a medio |
| 5 | Medir visitas y pedidos | Decidir con datos y no con suposiciones | Comprobado | Bajo |
| 6 | Armar el pedido desde la carta | Menos fricción y pedidos más claros | Hipótesis | Medio |
| 7 | Agotados más rápidos | Evitar pedidos de platos que ya no hay | Hipótesis | Bajo a medio |
| 8 | Identidad propia | Dejar de parecer una plantilla | Comprobado | Medio a alto |

## 1. Hacer posible la venta

### Salir a producción

- **Qué encontramos:** `don-patacon.vercel.app` da 404 y el CLI de Vercel no tiene
  sesión. El panel solo se ha probado en local; el guardado en GitHub y el aviso
  de "Publicado" se probaron con respuestas simuladas.
- **Para qué nos sirve:** es el primer momento en que el sitio puede generar
  pedidos, y confirma si el flujo de publicación funciona de verdad.
- **Qué hacer:** configurar Vercel y el token de GitHub (ver `README.md`), y hacer
  una publicación real con foto y restauración.

### Cargar el contenido real

- **Qué encontramos:** hay tres categorías de ejemplo, ningún plato y faltan
  WhatsApp, horario, teléfono, correo, local, razón social y NIT. Sin WhatsApp, el
  formulario de pedidos no se puede enviar. La foto principal es un salmón de la
  plantilla, no un plato de Don Patacón.
- **Para qué nos sirve:** el panel ya permite hacerlo sin programar y avisa qué
  falta. Mostrar platos ajenos o precios inventados afectaría la confianza.
- **Qué hacer:** reunir con el dueño la carta, los precios, las fotos y los datos.

## 2. Conseguir más clientes

### SEO local

- **Qué encontramos:** ya existen los datos estructurados del restaurante, con
  horario por día, y una descripción por página. Faltan dominio, `site`, sitemap,
  `robots.txt`, canónicas, `og:image` absoluta (hoy es `/thumbnail.jpg`) y `url` e
  `image` en esos datos. Tampoco hay perfil de Google Business.
- **Para qué nos sirve:** el análisis de julio lo marca como canal principal de un
  restaurante. Sigue siendo una hipótesis, porque no hay datos propios, pero cuesta
  poco y un negocio dentro de un centro comercial se apoya mucho en búsquedas como
  "dónde comer en Plaza Central". La ruta absoluta también puede mejorar la vista
  del enlace al compartirlo por WhatsApp.
- **Qué hacer:** definir el dominio y crear el perfil de Google. Con ese perfil, el
  mapa puede apuntar al local y no al centro comercial.

### Reseñas reales de Google

- **Qué encontramos:** la sección de testimonios está vacía a propósito y no se
  muestra. No inventamos opiniones.
- **Para qué nos sirve:** una reseña verificable genera más confianza que un texto
  escrito en el propio sitio.
- **Qué hacer:** enlazar las reseñas cuando exista el perfil, y usar testimonios
  solo con permiso del cliente.

### Código QR para la carta (idea sin validar)

- **Qué encontramos:** los clientes comen en mesas comunes de la plazoleta y la
  carta ya funciona en el celular. Falta comprobar si tiene sentido operativo y si
  el centro comercial lo permite.
- **Para qué nos sirve:** podría llevar a quien ya está en la plazoleta a la carta
  con precios actualizados, sin reimprimir nada.
- **Qué hacer:** preguntárselo al dueño. Técnicamente es muy poco trabajo.

## 3. Mejorar los pedidos

### Armar el pedido desde la carta

- **Qué encontramos:** el cliente escribe su pedido a mano en un cuadro de texto,
  "tal como aparece en la carta". La carta y el formulario no están conectados.
- **Para qué nos sirve:** elegir platos y cantidades reduce errores, permite
  mostrar un total estimado y evita pedir algo agotado. El local recibiría mensajes
  más ordenados por WhatsApp.
- **Qué hacer:** agregar un carrito en el navegador que arme el mismo mensaje de
  WhatsApp. No necesita base de datos ni guardar datos personales. Conviene hacerlo
  cuando la carta real esté cargada.

### Saber cuántos pedidos se pierden

- **Qué encontramos:** el pedido solo existe si el cliente envía el mensaje en
  WhatsApp. Si cierra la pestaña, nadie se entera. Tampoco hay analítica.
- **Para qué nos sirve:** sin medir no se puede saber si el sitio vende ni dónde se
  caen los clientes. Eso debe definir las próximas prioridades.
- **Qué hacer:** medir visitas a `/pedidos` y clics en "Enviar pedido" antes de
  construir algo más complejo. Si la herramienta usa cookies, hará falta un aviso.
  Una analítica externa debe valorarse frente a la decisión de no depender de
  terceros; solo mide y no guarda el contenido del sitio.

### Agotados más rápidos

- **Qué encontramos:** marcar un plato agotado exige cambiarlo, publicar y esperar
  1 o 2 minutos a que termine el deploy.
- **Para qué nos sirve:** si se agotan platos en plena hora pico, evitaría pedidos
  que luego hay que rechazar. Falta saber con qué frecuencia ocurre.
- **Qué hacer:** preguntárselo al dueño. Si es frecuente, se puede agregar un botón
  que publique solo ese cambio. Que sea instantáneo requeriría guardar el dato fuera
  de los archivos del repo, y por eso conviene decidirlo con evidencia.

### Alérgenos y etiquetas en la carta

- **Qué encontramos:** el modelo de cada plato no tiene campos para alérgenos ni
  para opciones como vegetariano. El formulario solo pregunta por alergias en notas.
- **Para qué nos sirve:** da información útil antes de pedir y puede ahorrar
  preguntas por WhatsApp.
- **Qué hacer:** agregar etiquetas opcionales en el panel. La información debe
  darla y validarla el negocio.

## 4. Facilitar el trabajo del negocio

### Probar el panel con el dueño

- **Qué encontramos:** el panel se diseñó suponiendo uso diario desde el celular,
  pero nadie del negocio lo ha usado y aún no sabemos quién lo manejará.
- **Para qué nos sirve:** una prueba de 15 minutos decide varias oportunidades de
  este documento y puede evitar trabajo innecesario.
- **Qué hacer:** pedirle tres tareas en su celular: cambiar un precio, agotar un
  plato y agregar uno nuevo. Observar sin ayudar.

### Mejoras del panel que dependen de esa prueba

| Mejora | Para qué nos sirve | Cuándo vale la pena |
| --- | --- | --- |
| Roles de usuario | Que un empleado marque agotados sin acceso a todo | Si lo usa más de una persona. Hoy hay un solo usuario |
| Ordenar arrastrando | Reorganizar la carta sin tocar botones plato por plato | Si la carta es larga o cambia seguido |
| Limpieza de fotos | El panel no borra las reemplazadas y el repo crece | Cuando haya muchas fotos |
| Revisión de accesibilidad | No se ha probado con lector de pantalla | Antes de dar el panel por terminado |

## 5. Reforzar la confianza y la marca

### Identidad propia

- **Qué encontramos:** el sitio parte de una plantilla llamada "Tastyyy". Ya se
  quitaron su logo, su imagen para compartir y su texto "About us", pero el diseño
  sigue siendo el mismo. El logo actual es solo el nombre en tipografía Gloock y el
  favicon es provisional. **No se ha verificado la licencia de la plantilla ni de
  las fotos heredadas.**
- **Para qué nos sirve:** una marca reconocible distingue al local, y revisar la
  licencia evita un posible problema legal.
- **Qué hacer:** revisar la licencia ahora, reemplazar la foto y decidir si se invierte
  en un logo y un diseño propios.

### Texto legal

- **Qué encontramos:** `/privacidad` existe, pero faltan razón social y NIT, y
  nadie con conocimiento legal ha revisado el texto. Tampoco hay términos publicados.
- **Para qué nos sirve:** el formulario recoge nombre y teléfono, y esa política
  debe identificar al responsable de esos datos.
- **Qué hacer:** completar los datos y que el dueño lo valide, idealmente con
  asesoría legal.

## 6. Reducir riesgos técnicos

| Hallazgo | Estado | Para qué nos sirve |
| --- | --- | --- |
| Vulnerabilidades: 29 en julio, 39 antes de corregir en octubre, 6 hoy (3 altas, 3 moderadas) | Quedan las del adapter de Vercel, sin arreglo disponible por ahora. No aparecen en la función de producción | Saber qué vigilar cuando salga una versión nueva |
| Fallo de ruta en `@astrojs/vercel` 8 | Resuelto con la versión 11; falta confirmarlo en Vercel | Evita esquivar reglas por URL |
| Sin CSP en el sitio público. La auditoría de julio lo daba por activo, pero Astro 5 ignoraba esa opción | Abierto. El panel ya tiene el suyo | Una capa más contra inyección de código |
| Límite de intentos de login solo por instancia | Abierto: falta una regla de Vercel Firewall | Dificulta adivinar contraseñas |
| Key privada de BCMS expuesta en `/contact` | Falta revocarla | Cierra un acceso abierto aunque el proyecto esté vacío |

## Lo que la investigación ya nos dio

- **Independencia:** el contenido vive en el repo, editable desde un panel propio,
  y el build ya no necesita claves externas.
- **Datos mejor organizados:** horario y dirección tienen una sola fuente, con
  "Abierto ahora" y horario para Google.
- **Pruebas que encontraron fallos reales:** un login que aceptaba peticiones de
  otros sitios, un borrador que se perdía al recargar y restos visibles de la plantilla.
- **Menos riesgo:** migración a Astro 7, sin la vulnerabilidad crítica ni los XSS de
  la versión anterior.

## Lo que descartamos, y por qué

| Idea | Motivo |
| --- | --- |
| Reservas con confirmación | El local usa mesas comunes de la plazoleta y no toma reservas |
| Eventos | El negocio no los hace |
| Carta de temporada | Las estaciones no aplican en Bogotá; los especiales por día cubren esa función |
| Sitio en dos idiomas | El contenido y la interfaz están en español, y nada indica que haga falta otro idioma |
| Otro CMS externo | Decisión del proyecto: no depender de un tercero para el contenido |
| Guardar pedidos en base de datos | Implica datos personales y más infraestructura. Primero hay que medir si hace falta |
| Newsletter | Sin clientes ni datos todavía, es prematuro |

## Preguntas que desbloquean decisiones

**Para el dueño:**

1. ¿Quién actualizará el contenido y cada cuánto?
2. ¿Con qué frecuencia se agotan platos en hora pico?
3. ¿Cómo llegan hoy los pedidos y cuáles son los errores más comunes?
4. ¿Hay presencia en Rappi o DiDi Food, o perfil en Google?
5. ¿El centro comercial permite poner un código QR en la plazoleta?

**Después de publicar:**

6. ¿Cuánta gente llega a `/pedidos` y cuántos pulsan enviar?
7. ¿Cómo llega la gente al sitio: Google, redes o un enlace directo?
