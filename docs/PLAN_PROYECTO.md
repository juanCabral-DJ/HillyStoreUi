# HillyStore · Plan del Proyecto (Actualizado)

Tienda de ropa en Baní, República Dominicana · Plan de arquitectura y construcción.

---

## 1. Resumen del proyecto

HillyStore es una tienda de ropa con local físico en Baní que ofrece dos cosas: **ropa en stock** y **pedidos por encargo de Shein**. La web no tiene carrito ni pasarela de pago. Todo se cierra por WhatsApp, y los pagos son en efectivo o transferencia.

### Objetivos de la web
* Mostrar el catálogo en stock para **mujeres y hombres**, con accesorios y colonias. *(Nota: se excluyó ropa de niños).*
* Recibir pedidos de Shein: el cliente envía sus links y su talla por WhatsApp.
* Explicar cómo funciona la tienda con un recorrido scrollytelling.
* Dar a la dueña un panel de administración para subir y gestionar las prendas.

**Prioridad del negocio:** los pedidos de Shein tienen una prioridad levemente mayor que el stock. Por eso aparecen primero en el menú y en el recorrido del inicio.

---

## 2. Decisiones tomadas

| Tema | Decisión |
| :--- | :--- |
| **Público** | **Mujeres y hombres** (excluido niños) |
| **Productos** | Stock propio y pedidos Shein, con Shein ligeramente priorizado |
| **Compra** | Mixta: se cierra por WhatsApp, sin carrito ni pago en línea |
| **Pagos** | Efectivo o transferencia bancaria en RD$ |
| **Anticipo Shein** | 50% al realizar el pedido, y el resto al recibir |
| **Tiempo de entrega Shein**| 15 a 20 días |
| **Entrega** | Retiro en tienda y envío a domicilio en Baní |
| **Zona y horario** | Baní, de 9:00 a.m. a 5:00 p.m. |
| **Categorías** | Ropa (Mujeres, Hombres), Accesorios, Colonias y más |
| **Estilo visual** | Rosa y blanco, estética boutique, con modo claro y oscuro |
| **Frontend** | Angular con SSR, componentes standalone, signals y PrimeNG |
| **Backend** | C# .NET 8, Clean Architecture, EF Core y JWT |
| **Base de datos** | PostgreSQL, con migraciones de EF Core |

---

## 3. Modelo de datos y API

### Enum Audience
* `'Mujeres' | 'Hombres'`

### Categorías iniciales
* Ropa, Accesorios, Colonias. (UsesSizes = false en colonias y accesorios).

---

## 4. Fases de Construcción

* **Fase 1 · Base del frontend:** Angular SSR + PrimeNG + Theme claro/oscuro con cookies. *(Completada)*
* **Fase 2 · Capa API y Servicios Core:** ApiClient tipado, StoreSettings, PlatformService, WhatsappService, SeoService, AuthService. *(Completada)*
* **Fase 3 · Estructura pública:** PublicShell, Header con drawer móvil, Footer, botón WhatsApp flotante. *(Completada)*
* **Fase 4 · Inicio (Scrollytelling):**
  1. Hero *(Completada)*
  2. Pasos de Shein con 50% anticipo *(Completada)*
  3. **Carrusel de stock destacado** *(En progreso)*
  4. Categorías
  5. Pagos y entregas
  6. Preguntas frecuentes
  7. Visítanos
* **Fase 5 · Catálogo:** Filtros por público (`Mujeres`, `Hombres`), categorías y tallas + detalle de prenda.
* **Fase 6 · Pedidos Shein:** Formulario interactivo.
* **Fase 7 · Backend (.NET 8):** API real y base de datos.
* **Fase 8 · Panel Admin:** Gestión de inventario desde el móvil.
* **Fase 9 · Publicación y puesta en marcha.**
