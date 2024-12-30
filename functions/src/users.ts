import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { ModelsFunctions } from "./models";

// Inicializa las instancias de Firestore y Auth
const firestore = getFirestore();
const auth = getAuth();

// Función de inicialización de un usuario admin
export const initAdmin = async () => {
  console.log(' initAdmin ');

  // Configura los datos del usuario con rol admin
  const data: ModelsFunctions.RequestSetRole = {
    roles: {
      admin: true
    },
    uid: 'YDyqxCWKCFTmRHARsVb1G5mtmEJ3' // UID del usuario al que se asignará el rol de admin
  };

  // Establece las claims de roles para el usuario
  const claims = {
    roles: data.roles
  };

  await auth.setCustomUserClaims(data.uid, claims); // Asigna el rol de admin al usuario en Firebase Auth
  await firestore.doc(`Users/${data.uid}`).update(claims);// Actualiza el documento del usuario en Firestore con el rol asignado

  console.log('set claim con éxito');
};

// Función callable de Firebase para asignar roles a los usuarios
export const setRole = onCall({
  cors: true
}, async (request) => {
  let valid = false; // Variable para validar si el usuario tiene permisos de admin

  // Verifica si el token de autenticación existe
  if (request?.auth?.token) {
    const token: any = request.auth.token;

    // Verifica si el rol de admin está presente en los claims del token
    if (token.roles) {
      valid = token.roles.admin;
    }

    // Si el usuario tiene el rol de admin, procesa la solicitud para cambiar roles
    if (valid) {
      const data: ModelsFunctions.RequestSetRole = request.data; // Obtiene los datos de la solicitud
      console.log("hacer la funcion -> ", data.uid);

      const claims = {
        roles: data.roles
      };

      // Establece los claims en Firebase Auth y actualiza en Firestore
      await auth.setCustomUserClaims(data.uid, claims);
      await firestore.doc(`Users/${data.uid}`).update(claims);

      console.log("set claim con éxito");
      return { ok: true }; // Retorna un objeto indicando éxito
    } else {
      // Si no es admin, asigna un rol básico al usuario
      console.log("hacer la funcion -> ", token.uid);

      const claims = {
        roles: {
          cliente: true
        }
      };

      await auth.setCustomUserClaims(token.uid, claims); // Asigna el rol de "cliente" al usuario
      console.log("set claim con éxito");
      return { ok: true };
    }
  }
  // Si no tiene permisos, lanza un error de acceso denegado
  throw new HttpsError("permission-denied", "no es admin");
});

export const Users = {
  setRole,
  initAdmin
};
