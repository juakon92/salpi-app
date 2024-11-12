## Introducción a la Aplicación Salpi
La aplicación **Salpi** es una plataforma híbrida desarrollada en *Ionic* que permite a los clientes realizar pedidos de comida de manera cómoda y rápida. Esta app se crea con el objetivo de modernizar y optimizar la gestión de pedidos en el restaurante, facilitando un flujo continuo desde que el cliente realiza el pedido hasta que se entrega al repartidor para la entrega.

### Funcionalidades Principales
1. **Registro e Inicio de Sesión:** Los usuarios pueden registrarse y autenticarse mediante correo electrónico y contraseña, cuenta de Google, cuenta de Apple o cuenta de Facebook.
2. **Gestión de Pedidos:** La aplicación permite al personal del restaurante gestionar los pedidos realizados por los clientes.
3. **Interfaz Intuitiva:** La aplicación está diseñada con *Ionic* y *Capacitor*, proporcionando una interfaz amigable y adaptada tanto para dispositivos Android/iOS como para la web.
4. **Almacenamiento Seguro:** Utiliza *Firebase* para almacenar información de forma segura y para manejar la autenticación de los usuarios.

### Objetivo del Proyecto
Esta aplicación fue desarrollada como un proyecto final de grado superior para demostrar competencias en desarrollo móvil y uso de tecnologías modernas como *Ionic*, *Firebase* y *Angular*.

## Guía de Instalación y Pruebas de la Aplicación Salpi
Bienvenido a la guía de instalación y pruebas de la aplicación **Salpi**. Este documento le proporcionará instrucciones detalladas para configurar y ejecutar la aplicación en su dispositivo, facilitando la evaluación del proyecto.

### Requisitos Previos
Antes de comenzar, asegúrese de tener instalados los siguientes componentes:
- **Node.js:** Versión 14 o superior, Puede descargarlo desde [nodejs.org](https://nodejs.org/).
- **Ionic CLI:** Para instalarlo, ejecute:
    ```
    nmp install -g @ionic/cli
    ```
- **Android Studio:** Necesario para compilar y ejecutar la aplicación en dispositivos Android o emuladores. Descárguelo desde [developer.android.com](https://developer.android.com/studio).

### Clonación del Repositorio
Clone el repositorio de la aplicación Salpi desde Github:
```
git clone https://github.com/juakon92/salpi-app.git
```
Acceda al directorio del proyecto:
```
cd salpi-app
```

### Instalación de Dependencias
Instale las dependencias necesarias ejecutando:
```
npm install
```

### Configuración de Firebase
La aplicación utiliza *Firebase* para la autenticación y almacenamiento. Siga estos pasos para configurarlo:
1. **Creación de Directorio src/environments:** Por seguridad, no se ha incluido en el repositorio el directorio `environments`, es necesario crearlo dentro del directorio `src`.
2. **Creación de Archivos dentro del directorio:** Es necesario crear dos archivos:
    - `environments.ts`
    - `environments.prod.ts`
    Estos dos documentos contendrán la información de configuración de *Firebase* que será del tipo así:
        ```typescript
        export const environment = {
            production: false,
            firebaseConfig: {
                apiKey: "TU_API_KEY",
                authDomain: "TU_AUTH_DOMAIN",
                projectId: "TU_PROJECT_ID",
                storageBucket: "TU_STORAGE_BUCKET",
                messagingSenderId: "TU_MESSAGING_SENDER_ID",
                appId: "TU_APP_ID",
                measurementId: "TU_MEASUREMENT_ID"
            }
        };
        ```
        Pedir las credenciales y se facilitarán para su integración.

### Ejecución de la Aplicación en un Navegador
Para ejecutar la aplicación en un navegador web:
```
ionic serve
```
Esto abrirá la aplicación en su navegador prederteminado en `http://localhost:8100/`.

### Ejecución de la Aplicación en un Dispositivo Android
Para compilar y ejecutar la aplicación en un dispositivo Android:
1. **Agregar la Plataforma Android:**
    ```
    ionic capacitor add android
    ```
2. **Sincronizar el Proyecto:**
    ```
    ionic capacitor sync android
    ```
3. **Abrir en Android Studio:**
    ```
    ionic capacitor open android
    ```
    Esto abrirá el proyecto en Android Studio. Desde allí, puede compilar y ejecutar la aplicación en un dispositivo conectado o en un emulador.

### Ejecución de la Aplicación en un Dispositivo iOS
Para compilar y ejecutar la aplicación en un dispositivo iOS:
1. **Agregar la Plataforma iOS:**
    ```
    ionic capacitor add ios
    ```
2. **Sincronizar el Proyecto:**
    ```
    ionic capacitor sync ios
    ```
3. **Abrir en xCode:**
    ```
    ionic capacitor open ios
    ```
    Esto abrirá el proyecto en xCode. Desde allí, puede compilar y ejecutar la aplicación en un dispositivo conectado o en un emulador.

### Pruebas de Funcionalidad
Una vez que la aplicación esté en ejecución, puede probar las siguientes funcionalidades:
- **Registro e Inicio de Sesión:** Cree una cuenta nueva o inicie sesión con credenciales existentes.
- **Carga y Descarga de Archivos:** Suba archivos al almacenamiento y descárguelos para verificar su integridad.
- **Navegación:** Explore las diferentes secciones de la aplicación para asegurarse de que la navegación funciona correctamente.

### Notas Adicionales
- **Permisos:** Si ejecuta la aplicación en un dispositivo físico, asegúrese de otorgar los permisos necesarios para acceder al almacenamiento y otras funcionalidades.
- **Depuración:** Utilice las herramientas de desarrollo del navegador o Android Studio para depurar cualquier problema que pueda surgir.