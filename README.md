# QR Fiesta

MVP para crear eventos con QR unico. Los invitados suben fotos/videos desde el celular y el cliente puede ver su propia galeria con login.

## Instalar

```bash
npm install
cp .env.example .env.local
npm.cmd run dev -- -p 3000
```

Abre `http://localhost:3000`.

Para probar el QR desde celular en la misma red WiFi, corre el servidor asi:

```bash
npm.cmd run dev -- -H 0.0.0.0 -p 3000
```

Y configura `.env.local` con la IP de tu computadora:

```text
NEXT_PUBLIC_APP_URL=http://TU-IP-LOCAL:3000
```

## Usuario demo sin Firebase

Para probar rapido el panel administrativo sin configurar Firebase:

```text
Email: admin@qrfiesta.com
Contrasena: admin123
```

En modo demo, clientes y eventos se guardan en el navegador con `localStorage`.

## Subir demo funcional a nube gratis

Para que fotos y videos funcionen en nube, usa:

- Vercel Hobby para hospedar Next.js.
- Firebase Spark para Auth, Firestore y Storage.

Pasos:

1. Crea proyecto en Firebase.
2. Activa Authentication con Email/Password.
3. Activa Firestore.
4. Activa Storage en una region con cuota gratis disponible.
5. Publica `firestore.rules` y `storage.rules`.
6. Crea un usuario admin en Firebase Auth.
7. Crea en Firestore `users/{UID_DEL_ADMIN}`:

```json
{
  "uid": "UID_DEL_ADMIN",
  "name": "Administrador",
  "email": "admin@tuapp.com",
  "role": "admin"
}
```

8. Sube el proyecto a GitHub.
9. Importa el repo en Vercel.
10. En Vercel agrega variables de entorno:

```text
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

11. Deploy.

Cuando `NEXT_PUBLIC_FIREBASE_*` esta configurado, la app usa Firebase real para guardar eventos, usuarios, fotos y videos. El modo demo local queda solo como fallback.

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Authentication con Email/Password.
3. Activa Firestore.
4. Activa Storage.
5. Copia las variables web en `.env.local`.
6. Publica `firestore.rules` y `storage.rules`.

## Crear tu usuario administrador

1. En Firebase Auth crea tu usuario con email y contrasena.
2. Copia el UID de ese usuario.
3. En Firestore crea este documento:

```text
users/{TU_UID}
```

Con estos campos:

```json
{
  "uid": "TU_UID",
  "name": "Administrador",
  "email": "tu-email@dominio.com",
  "role": "admin"
}
```

Despues entra a:

```text
/admin/login
```

## Flujo de uso

1. Entra como admin en `/admin/login`.
2. Crea el evento con email y contrasena temporal del cliente.
4. En el panel del evento veras:
   - Liga para invitados: `/e/CODIGO`
   - QR descargable para invitados
   - Liga privada del cliente: `/cliente/events/CODIGO`
5. El cliente entra en `/cliente/login`.
6. El cliente ve sus eventos y su galeria.

## Rutas

- `/` landing publica
- `/admin/login` login administrativo
- `/admin` panel administrativo
- `/admin/events/[id]` panel del evento para admin
- `/cliente/login` login del cliente
- `/cliente` eventos del cliente
- `/cliente/events/[id]` galeria privada del cliente
- `/e/[codigo]` subida publica de invitados
- `/demo/galeria` demo visual sin Firebase

## Validaciones

- Maximo por archivo: 100 MB
- Formatos permitidos: jpg, jpeg, png, heic, mp4, mov
- Invitados solo suben si el evento esta activo
- Admin crea eventos con acceso de cliente
- Cliente solo ve eventos asignados a su UID
