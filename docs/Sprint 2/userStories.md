### User Stories Sprint 2

## US-47: Ver Dashboard principal del proveedor

# Scenario 1: Visualización de KPIs y gráfico de tendencia
Dado que el proveedor accede al dashboard principal,
Cuando se cargan los datos del periodo activo,
Entonces visualiza las tarjetas de KPIs (combustible total vendido, pedidos pendientes) y un gráfico de tendencia con opción de filtrar por vista diaria, semanal o mensual.

# Scenario 2: Navegación desde el dashboard hacia otras secciones
Dado que el proveedor revisa el panel principal y desea profundizar en un indicador,
Cuando selecciona el acceso directo a pedidos activos o al módulo de reportes,
Entonces es redirigido a la vista correspondiente sin perder el contexto de sesión.

---

## US-46: Gestionar inventario de combustibles

# Scenario 1: Registro y visualización de productos en el inventario
Dado que el proveedor accede al módulo de inventario y completa los campos requeridos del formulario de producto (nombre, tipo de combustible, precio por litro y unidad),
Cuando guarda el registro,
Entonces el producto aparece listado en el inventario con su información completa y queda disponible para ser referenciado en nuevos pedidos.

# Scenario 2: Edición y eliminación de un producto existente
Dado que el proveedor selecciona un producto ya registrado en el inventario,
Cuando actualiza sus datos o confirma su eliminación,
Entonces los cambios se reflejan de inmediato en el listado y el producto editado o eliminado no genera inconsistencias en pedidos en curso.

---

## US-10: Ver pedidos pendientes

# Scenario 1: Listado de pedidos pendientes
Dado que el proveedor accede al panel,
Cuando ve los pedidos pendientes,
Entonces puede revisar sus detalles básicos.

# Scenario 2: Filtro por fechas o cliente
Dado que el proveedor tiene muchos pedidos,
Cuando aplica filtros por fecha o empresa,
Entonces puede localizar los pedidos relevantes.

---

## US-05: Registrar nuevo pedido

# Scenario 1: Registro exitoso del pedido
Dado que el solicitante accede al formulario de pedidos,
Cuando completa los campos requeridos,
Entonces puede enviar un nuevo pedido.

# Scenario 2: Validación de campos
Dado que el solicitante deja un campo obligatorio vacío,
Cuando intenta enviar el pedido,
Entonces el sistema muestra un mensaje de error.

# Scenario 3: Confirmación del cambio de estado
Dado que el solicitante envió el pedido,
Cuando el proveedor lo aprueba,
Entonces su estado se actualiza automáticamente.

---

## US-11: Aprobar pedido

# Scenario 1: Aprobación de pedido con depósitos válidos
Dado que el proveedor tiene el pago completo del pedido,
Cuando intenta aprobarlo,
Entonces el estado cambia a "Aprobado".

# Scenario 2: No aprobar el pedido por pago incompleto
Dado que el proveedor no cuenta con los depósitos suficientes para completar el pago del pedido,
Cuando intenta aprobarlo,
Entonces se muestra un mensaje indicando que el pedido no fue pagado por completo.

---

## US-42: Rechazar pedido

# Scenario 1: Rechazo exitoso con motivo
Dado que el proveedor decide no atender un pedido pendiente,
Cuando selecciona "Rechazar" e ingresa un motivo,
Entonces el estado del pedido cambia a "Rechazado" y el solicitante recibe una notificación.

# Scenario 2: Intento de rechazo sin motivo
Dado que el proveedor intenta rechazar un pedido sin ingresar motivo,
Cuando ejecuta la acción,
Entonces el sistema solicita ingresar un motivo obligatorio antes de confirmar.

# Scenario 3: Rechazo de pedido ya procesado
Dado que el proveedor intenta rechazar un pedido que ya fue aprobado o despachado,
Cuando ejecuta la acción,
Entonces el sistema impide la acción y muestra el estado actual del pedido.

---

## US-06: Consultar estado del pedido

# Scenario 1: Consulta de estado en el panel
Dado que el solicitante accede a su panel,
Cuando revisa la lista de pedidos,
Entonces ve el estado actualizado.

# Scenario 2: Actualización dinámica de estado
Dado que el solicitante está visualizando el panel de pedidos,
Cuando el pedido cambia de estado,
Entonces el cambio se refleja correctamente al recargar el panel.

---

## US-43: Ver detalle de pedido

# Scenario 1: Visualización completa del detalle
Dado que el usuario selecciona un pedido desde su panel,
Cuando se carga la vista de detalle,
Entonces puede ver tipo de combustible, cantidad, estado, fechas, datos de pago y asignación logística.

# Scenario 2: Pedido no encontrado
Dado que el usuario intenta acceder al detalle de un pedido inexistente,
Cuando se carga la vista,
Entonces el sistema muestra un mensaje de error y ofrece regresar al listado.

# Scenario 3: Restricción de acceso a pedidos ajenos
Dado que el usuario intenta acceder al detalle de un pedido que no le pertenece,
Cuando carga la URL directamente,
Entonces el sistema restringe el acceso y redirige a su propio panel.

---

## US-12: Marcar pedido como despachado

# Scenario 1: Despacho exitoso de un pedido
Dado que el proveedor tiene un pedido aprobado,
Cuando marca el pedido como despachado,
Entonces el estado cambia a "Despachado".

# Scenario 2: Restricción de despacho sin aprobación previa
Dado que el proveedor intenta despachar un pedido sin pasar por la liberación correspondiente,
Cuando ejecuta la acción,
Entonces el sistema impide el cambio de estado y muestra un mensaje.

---

## US-13: Cerrar pedido

# Scenario 1: Cierre correcto del pedido tras confirmación
Dado que el solicitante ya confirmó la entrega,
Cuando el proveedor cierra el pedido,
Entonces este no puede modificarse más.

# Scenario 2: Intento de cierre sin confirmación previa
Dado que el proveedor intenta cerrar el pedido,
Cuando el solicitante aún no ha confirmado la entrega,
Entonces el sistema impide esta acción.

---

## US-27: Buscar pedido por código

# Scenario 1: Pedido encontrado
Dado que el usuario escribe un código válido,
Cuando existe un pedido con ese código,
Entonces se muestra el resultado correspondiente.

# Scenario 2: Pedido no encontrado
Dado que el usuario digita un código no correspondiente a ningún pedido,
Cuando finaliza la búsqueda,
Entonces el sistema muestra un mensaje de que no hay coincidencias.

---

## US-28: Filtrar pedidos por estado

# Scenario 1: Aplicar filtro correctamente
Dado que el usuario selecciona un estado,
Cuando se aplica el filtro,
Entonces solo se muestran los pedidos con ese estado.

# Scenario 2: No hay pedidos en ese estado
Dado que el usuario selecciona un estado que no tiene coincidencias,
Cuando ejecuta el filtro,
Entonces se muestra un mensaje indicando que no hay pedidos para ese estado.

---

## US-44: Gestionar vehículos de flota

# Scenario 1: Registro exitoso de vehículo
Dado que el proveedor accede al módulo de flota y completa los datos del vehículo,
Cuando guarda el registro,
Entonces el vehículo queda disponible para ser asignado a pedidos.

# Scenario 2: Placa duplicada
Dado que el proveedor intenta registrar un vehículo con una placa ya existente,
Cuando intenta guardar,
Entonces el sistema muestra un error indicando que la placa ya está registrada.

# Scenario 3: Eliminación de vehículo
Dado que el proveedor elimina un vehículo de la flota,
Cuando confirma la acción,
Entonces el vehículo deja de aparecer como opción en la asignación de pedidos.

---

## US-45: Gestionar conductores

# Scenario 1: Registro exitoso de conductor
Dado que el proveedor completa los datos del conductor (nombre, DNI, licencia),
Cuando guarda el registro,
Entonces el conductor queda disponible para ser asignado a pedidos.

# Scenario 2: DNI duplicado
Dado que el proveedor intenta registrar un conductor con un DNI ya existente,
Cuando intenta guardar,
Entonces el sistema notifica que el conductor ya está registrado.

# Scenario 3: Edición de datos de conductor
Dado que el proveedor actualiza los datos de un conductor existente,
Cuando guarda los cambios,
Entonces la información se actualiza correctamente en el sistema.

---

## US-22: Validar disponibilidad de transporte

# Scenario 1: Vehículo no disponible por superposición
Dado que el proveedor visualiza el listado de vehículos,
Cuando un vehículo está asignado a otro pedido para la misma fecha y hora estimada,
Entonces el sistema lo muestra como no disponible.

# Scenario 2: Vehículo disponible
Dado que el proveedor visualiza un vehículo sin conflictos de agenda,
Cuando se carga el listado de vehículos,
Entonces dicho vehículo se muestra como seleccionable.

# Scenario 3: Conflicto en tiempo real
Dado que el proveedor intenta seleccionar un vehículo que fue asignado recientemente por otro usuario,
Cuando realiza la acción,
Entonces el sistema bloquea la selección y muestra un mensaje de actualización.

---

## US-49: Asignar recursos a despacho

# Scenario 1: Asignación exitosa de recursos al despacho
Dado que el proveedor selecciona un pedido aprobado y elige un vehículo y conductor disponibles,
Cuando confirma la asignación,
Entonces ambos recursos quedan vinculados al pedido y el despacho queda registrado con estado "Asignado".

# Scenario 2: Recursos no disponibles para la fecha del pedido
Dado que el proveedor intenta asignar recursos a un pedido y tanto el vehículo como el conductor seleccionados ya tienen compromisos en esa fecha,
Cuando ejecuta la asignación,
Entonces el sistema muestra cuáles recursos están en conflicto e impide completar la operación.

---

## US-34: Ver gráfico de ventas (Proveedor)

# Scenario 1: Datos disponibles para graficar
Dado que el proveedor ha despachado pedidos,
Cuando accede al módulo de reportes,
Entonces se visualiza un gráfico con las ventas mensuales totales.

# Scenario 2: Sin pedidos registrados
Dado que el proveedor no ha realizado ventas aún,
Cuando accede al gráfico,
Entonces se muestra un mensaje de que no hay datos suficientes.

---

## US-48: Ver distribución de ventas por sector

# Scenario 1: Visualización de distribución con datos disponibles
Dado que el proveedor accede al módulo de reportes de clientes,
Cuando existen ventas registradas en más de un sector industrial,
Entonces el sistema muestra un gráfico de barras con el volumen y porcentaje de participación por sector.

# Scenario 2: Sin distribución por sector disponible
Dado que el proveedor aún no tiene ventas registradas o todos sus clientes pertenecen al mismo sector,
Cuando accede a la sección de distribución,
Entonces el sistema muestra un mensaje indicando que no hay datos suficientes para mostrar la distribución.

---

## US-31: Ver listado de empresas

# Scenario 1: Visualización del listado
Dado que el proveedor accede al módulo de empresas,
Cuando se carga el listado,
Entonces se muestran nombre, pedidos activos y total histórico por empresa.

# Scenario 2: Lista vacía o sin datos
Dado que el proveedor accede al módulo y no hay empresas registradas,
Cuando se carga la vista,
Entonces se muestra un mensaje indicando que no hay empresas disponibles.

---

## US-32: Ver detalles de empresa

# Scenario 1: Acceso a detalle de empresa
Dado que el proveedor selecciona una empresa,
Cuando se carga el detalle,
Entonces visualiza pedidos realizados, cantidades solicitadas y fechas.

# Scenario 2: Empresa sin historial de pedidos
Dado que el proveedor selecciona una empresa que aún no ha realizado pedidos,
Cuando se accede a su perfil,
Entonces se muestra un mensaje indicando que no hay historial disponible.

---

## US-09: Ver historial de pedidos

# Scenario 1: Visualización del historial
Dado que el solicitante accede al historial,
Cuando se listan los pedidos,
Entonces puede ver fecha, tipo y estado de cada uno.

# Scenario 2: Historial vacío
Dado que el solicitante aún no ha realizado pedidos,
Cuando accede al historial,
Entonces se muestra un mensaje informativo.

# Scenario 3: Acceso a detalles desde historial
Dado que el solicitante ve la lista de pedidos anteriores,
Cuando selecciona uno,
Entonces puede revisar sus detalles.
