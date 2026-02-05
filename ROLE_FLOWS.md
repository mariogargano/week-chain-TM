# Flujos de Trabajo por Rol - WEEK-CHAIN™

Este documento describe el recorrido exacto y las capacidades de cada rol dentro de la plataforma WEEK-CHAIN™.

---

## 1. Usuario / Miembro (Consumidor Final)
**Objetivo:** Explorar destinos, adquirir derechos de uso (SVC) y gestionar sus estancias.

1.  **Descubrimiento**: El usuario navega por la página de inicio y el catálogo de destinos participantes (`/properties`).
2.  **Registro/Acceso**: Se registra vía correo, Google OAuth o conecta su Wallet.
3.  **Adquisición**:
    *   Selecciona una propiedad y una semana específica.
    *   **Checkout Unificado**: Paga vía Conekta (Tarjeta, SPEI u OXXO) o USDC.
    *   Recibe un **Purchase Voucher** (`purchase_vouchers`) que confirma el pago.
4.  **Verificación (KYC)**: Completa su verificación de identidad en `/kyc` para habilitar la firma legal.
5.  **Firma Legal**:
    *   Recibe un contrato digital vía **EasyLex**.
    *   Firma digitalmente (Certificación NOM-151).
    *   El estado del voucher/reservación se actualiza a "Confirmado".
6.  **Gestión**:
    *   Visualiza su **Certificado Digital** en su dashboard.
    *   Agrega el certificado a **Apple Wallet** o **Google Wallet**.
    *   Solicita reservaciones según disponibilidad.

---

## 2. Intermediario / Broker (Ventas y Referidos)
**Objetivo:** Promover la plataforma, referir nuevos usuarios y ganar comisiones.

1.  **Activación**: Un usuario es elevado al rol de `broker` por un administrador.
2.  **Dashboard de Broker**: Accede a `/dashboard/broker` o `/dashboard/member`.
3.  **Promoción**:
    *   Obtiene su **Código de Referido** único (ej. `WC123456`).
    *   Descarga su **Tarjeta Digital de Intermediario**.
    *   Comparte enlaces de registro con su código incrustado.
4.  **Seguimiento**:
    *   Monitorea sus referidos activos y ventas cerradas en tiempo real.
    *   Visualiza sus honorarios (comisiones del 4% al 6% según su nivel: Standard, Silver, Gold/Elite).
5.  **Beneficios Extra**: Gana semanas de uso propio ("Broker Extra Benefit") al alcanzar metas de ventas.

---

## 3. Propietario de Inmueble (Suministro)
**Objetivo:** Listar sus propiedades para que formen parte del inventario de WEEK-CHAIN™.

1.  **Registro**: Accede al dashboard de propietario en `/dashboard/owner`.
2.  **Envío de Propiedad**:
    *   Sube detalles del inmueble, fotos y documentación legal (escrituras, licencias).
    *   Define las semanas disponibles para la plataforma.
3.  **Proceso de Aprobación**:
    *   La propiedad entra en revisión por el **Admin** y la **Notaría**.
    *   El propietario monitorea el estado (Pendiente -> Notaría -> Aprobado).
4.  **Formalización**: Firma el contrato de adhesión como proveedor del sistema.
5.  **Monitoreo de Ventas**: Visualiza cuántas semanas de su propiedad han sido adquiridas y el revenue generado.

---

## 4. Notaría / Legal
**Objetivo:** Validar la legalidad de las propiedades y usuarios.

1.  **Dashboard Notaría**: Accede a `/dashboard/notaria`.
2.  **Revisión de Inmuebles**:
    *   Verifica la documentación legal de las propiedades enviadas por dueños.
    *   Aprueba o rechaza el estatus legal para permitir la venta de certificados.
3.  **Validación KYC**: Revisa y aprueba las verificaciones de identidad de los usuarios de alto nivel.
4.  **Certificación**: Otorga el sello de cumplimiento legal (NOM-151) a las operaciones.

---

## 5. Administrador / Super Admin
**Objetivo:** Supervisión total, gestión de roles y salud del sistema.

1.  **Dashboard Admin**: Acceso total vía `/dashboard/admin`.
2.  **Gestión de Usuarios**: Cambia roles, eleva a brokers, gestiona permisos.
3.  **Aprobación Operativa**: Último paso en la aprobación de propiedades para que aparezcan en el catálogo público.
4.  **Control Financiero**: Monitorea pagos de Conekta, transacciones USDC, reembolsos y comisiones.
5.  **Configuración del Sistema**:
    *   Gestiona mensajes de marketing pre-aprobados.
    *   Monitorea webhooks de proveedores (Conekta, EasyLex).
    *   Realiza diagnósticos del sistema y base de datos.

---

## 6. Staff / Gestión (Operaciones)
**Objetivo:** Soporte al cliente y mantenimiento operativo.

1.  **Dashboard Staff**: Accede a `/dashboard/staff`.
2.  **Soporte**: Gestiona el buzón de contacto y solicitudes de ayuda.
3.  **Sincronización OTA**: Gestiona la disponibilidad en plataformas externas si aplica.
