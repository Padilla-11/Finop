# Documentacion del proyecto FinOp (demo)

Este proyecto es una demo estatica en HTML/CSS/JS (sin backend) para simular un sistema de finanzas diarias de un negocio pequeno de fritos.

## Como correrlo

- Abrir `index.html` en el navegador (redirecciona a `login.html`).
- No requiere servidor ni dependencias.

## Estructura general

- HTML por pagina en la raiz.
- CSS compartido en `css/finop.css` y CSS por pagina en `css/*.css`.
- JS compartido en `js/finop.js` y JS por pagina en `js/*.js`.

## Archivos principales

### Datos y helpers compartidos

Archivo: `js/finop.js`

Contiene datos mock y utilidades compartidas:

- `PRODUCTOS`: lista de productos (nombre, precio, costo, categoria).
- `COSTOS_FIJOS`, `EMPLEADOS`, `HISTORIAL`, `MOVIMIENTOS_HOY`, `CUENTAS_COBRAR`, `CHART_DATA`.
- Helpers de formato (`formatCOP`, `formatPct`, `formatDate`, `dayName`).
- Render de sidebar: `renderSidebar(activePage)`.
- UI helpers: `showModal`, `hideModal`, `switchTab`.

### Paginas y flujos

- `login.html` + `js/login.js`: login demo.
- `registro.html` + `js/registro.js`: registro demo con validaciones.
- `onboarding.html` + `js/onboarding.js`: wizard inicial del negocio.
- `dashboard.html` + `js/dashboard.js`: resumen con graficas (Chart.js).
- `historial.html` + `js/historial.js`: tabla de jornadas.
- `detalle-jornada.html` + `js/detalle-jornada.js`: detalle de una jornada.
- `jornada-activa.html` + `js/jornada-activa.js`: registro de movimientos del dia.
- `cierre.html` + `js/cierre.js`: cierre de jornada (flujo paso a paso).
- `cuentas-cobrar.html` + `js/cuentas-cobrar.js`: cartera y cobros.
- `configuracion.html` + `js/configuracion.js`: productos, costos, nomina, categorias.
- `analisis.html` + `js/analisis.js`: chat demo y diagnostico.
- `simulador.html` + `js/simulador.js`: simulador financiero.

## Flujo de jornada activa

Archivo: `js/jornada-activa.js`

- Renderiza movimientos en el feed y actualiza indicadores de caja.
- Guarda los movimientos en `localStorage` con la clave `finop_movimientos_hoy`.
- Eso permite que `cierre.html` use los movimientos reales del dia.

## Flujo de cierre de jornada

Archivo: `js/cierre.js`

El cierre tiene 5 pasos:

1) **Conteo**: se ingresan unidades vendidas por producto.
   - `ingresos_brutos = suma(unidades * precio)`

2) **Caja final**: se ingresa el efectivo actual de la caja.

3) **Validacion de caja**:
   - `caja_esperada = 150000 + ingresos_brutos - gastos_del_dia`
   - `diferencia = caja_final - caja_esperada`
   - Los gastos del dia vienen de movimientos con tipo `gasto_operativo` o `compra_mercancia`.

4) **Resumen financiero** (reglas actuales):
   - `ingresos = ingresos_brutos`
   - `costos = ingresos * 0.80`
   - `utilidad_bruta = ingresos * 0.20`
   - `utilidad_neta = utilidad_bruta - costos_fijos_del_dia`
   - `margen_dia = utilidad_neta / ingresos * 100`
   - `gastos` se muestran, pero no afectan la utilidad.

5) **Confirmacion**: muestra resumen final y estado del dia.

Notas:
- Si el conteo se omite, el ingreso se estima a partir de caja y gastos.
- Los pasos 3 a 5 se recalculan en vivo cuando cambian conteo o caja.

## Claves y conceptos

- **Caja inicial**: 150000 (valor base fijo en cierre).
- **Gastos del dia**: solo sirven para el cuadre de caja, no afectan utilidad.
- **Margen del dia**: ahora se calcula con la utilidad neta real del dia.
- **LocalStorage**: `finop_movimientos_hoy` guarda movimientos del dia.

## Recomendaciones para estudiar el codigo

1) Empezar por `js/finop.js` para entender datos y helpers.
2) Luego revisar `jornada-activa.html` y `js/jornada-activa.js`.
3) Seguir con `cierre.html` y `js/cierre.js` para el flujo completo.
4) Finalmente revisar `dashboard.html` y `js/dashboard.js` para graficas.

## Glosario (variables y estados)

- `PRODUCTOS`: lista de productos con `precio` y `costo` por unidad.
- `MOVIMIENTOS_HOY`: movimientos del dia (ingresos/gastos) usados para cuadre de caja.
- `GASTOS_JORNADA`: suma de movimientos con tipo `gasto_operativo` y `compra_mercancia`.
- `CAJA_INICIAL`: base fija de caja al abrir (150000 en cierre).
- `caja_final`: efectivo contado al final del dia (Paso 2).
- `caja_esperada`: `CAJA_INICIAL + ingresos_brutos - GASTOS_JORNADA` (Paso 3).
- `ingresos_brutos`: suma de `unidades * precio` del conteo (Paso 1).
- `costos`: `ingresos * 0.80` (modelo simple del 80%).
- `utilidad_bruta`: `ingresos * 0.20` (margen base del 20%).
- `utilidad_neta`: `utilidad_bruta - costos_fijos_del_dia`.
- `margen_dia`: `utilidad_neta / ingresos * 100`.
- `conteoOmitido`: indica si el usuario omitio el conteo.
- `pasoActual`: paso visible del flujo de cierre (1 a 5).
- `estado` en historial: `abierta`, `cerrada`, `no_opero`.
- `equilibrio`: punto de equilibrio calculado (costos fijos / 0.20).

## Estilo de codigo

- JavaScript vanilla, sin frameworks.
- No hay bundlers ni build steps.
- Las funciones se mantienen explicitas para que sea facil de leer en clase.
