# Especificación del MVP de plataforma compartida

## Estado

En progreso. Este documento reúne las capacidades comunes a las vistas de trámites, empleados y estudiantes.

## Contexto y objetivo

La aplicación necesita una base visual y de interacción consistente: navegación, temas, responsividad, modales, controles de fecha y hora y capacidad de instalación como PWA.

## Requisitos funcionales

- **RF-SP-01:** Mantener rutas y navegación coherentes entre las vistas principales.
- **RF-SP-02:** Permitir cambiar entre los temas disponibles sin perder la diferencia visual entre estados y prioridades.
- **RF-SP-03:** Reutilizar modales con animaciones de apertura y cierre consistentes.
- **RF-SP-04:** Proporcionar selectores, calendario y reloj con una presentación integrada al modal principal.
- **RF-SP-05:** Mantener una experiencia usable en escritorio y móvil.
- **RF-SP-06:** Conservar metadatos, iconos, manifest y service worker de la PWA en `public/` durante el prototipo.

## Fuera de alcance

Aplicación nativa con Electron o Tauri, sincronización offline completa, notificaciones push y backend.

## Preguntas abiertas

- [ ] Confirmar nombre y descripción definitivos de la PWA.
- [ ] Definir el comportamiento offline.
- [ ] Confirmar si el modal tendrá gesto de deslizamiento para cerrar en móvil.
