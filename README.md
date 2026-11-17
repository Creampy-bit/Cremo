<p align="center">
  <img src="assets/cremo-app-icon.svg" width="112" alt="Cremo">
</p>

<h1 align="center">Cremo</h1>

<p align="center">
  Reproductor de música de escritorio: YouTube Music, SoundCloud y tus archivos locales, en un solo sitio.
</p>

<p align="center">
  <a href="https://github.com/Creampy-bit/cremo/releases/latest"><b>⬇ Descargar la última versión</b></a>
</p>

---

## Instalar (Windows)

1. Entra en [Releases](https://github.com/Creampy-bit/cremo/releases/latest).
2. Descarga `cremo-X.Y.Z-win-x64.exe` y ábrelo.
3. Windows puede avisar con "Windows protegió tu PC" porque el instalador no está firmado: pulsa **Más información → Ejecutar de todas formas**.

Cremo busca actualizaciones solo y también desde **Ajustes → Acerca de → Buscar actualizaciones**.

## Qué tiene

- Busca y reproduce canciones de YouTube / YouTube Music, con SoundCloud como respaldo.
- Biblioteca de archivos locales, playlists y "Me gusta".
- Letras sincronizadas, cola, ecualizador y presets de sonido.
- Temas: elige el color en **Ajustes → Tema** y toda la interfaz se adapta.

## Desarrollo

Necesitas [Node.js](https://nodejs.org) 22 o superior.

```bash
npm install
npm start
```

### Publicar una versión nueva

Las versiones se compilan solas en GitHub Actions al subir una etiqueta `v*`:

```bash
npm version patch
git push --follow-tags
```

`npm version patch` sube la versión (0.0.1 → 0.0.2), crea el commit y la etiqueta; al hacer push, el flujo
[`release.yml`](.github/workflows/release.yml) compila el instalador y lo publica en Releases. Las copias
instaladas de tus amigos lo detectan y se actualizan.

## Licencia

Cremo se publica bajo licencia MIT. Ver [LICENSE](LICENSE).
