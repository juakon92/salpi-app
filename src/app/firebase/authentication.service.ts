import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
        signOut, authState, updateProfile, updateEmail,
        sendEmailVerification, reauthenticateWithCredential,
      verifyBeforeUpdateEmail,
      updatePassword, sendPasswordResetEmail,
      deleteUser, signInWithRedirect,
      GoogleAuthProvider, OAuthProvider, FacebookAuthProvider,
      OAuthCredential, signInWithCredential, getRedirectResult,
    } from '@angular/fire/auth';
import { FirestoreService } from './firestore.service';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';
import { Models } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private firestoreService: FirestoreService = inject(FirestoreService);
  auth: Auth = inject(Auth);
  authState = authState(this.auth); // Observa el estado de autenticación del usuario

  constructor() {
    this.auth.languageCode = 'es'; // Establece el idioma de autenticación a español
  }

  // Crea un usuario con email y contraseña, y envía un correo de verificación
  async createUser(email: string, password: string) {
    const user = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.sendEmailVerification();
    return user; // Devuelve el usuario creado
  }

  // Obtiene el usuario actual autenticado
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Actualiza el perfil del usuario actual (nombre y foto)
  updateProfile(data: {displayName?: string, photoURL?: string}) {
     return updateProfile(this.auth.currentUser, data);
  }

  // Actualiza el correo electrónico del usuario actual
  updateEmail(email: string) {
    return updateEmail(this.auth.currentUser, email);
  }

  // Verifica el nuevo correo antes de actualizarlo
  verifyBeforeUpdateEmail(email: string) {
    return verifyBeforeUpdateEmail(this.auth.currentUser, email);
  }

  // Reautentica al usuario con credenciales para operaciones sensibles
  reauthenticateWithCredential(password: string) {
    const credential = GoogleAuthProvider.credential(null, password); // Crea las credenciales de Google
    return reauthenticateWithCredential(this.auth.currentUser, credential);
  }

  // Envía un correo electrónico de verificación al usuario actual
  sendEmailVerification() {
    return sendEmailVerification(this.auth.currentUser);
  }

  // Actualiza la contraseña del usuario actual
  updatePassword(newPasword: string) {
    return updatePassword(this.auth.currentUser, newPasword);
  }

  // Envía un correo para restablecer la contraseña de un usuario
  sendPasswordResetEmail(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Inicia sesión con email y contraseña
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Cierra la sesión del usuario y, opcionalmente, recarga la página
  async logout(reload = true) {
    await signOut(this.auth);
    if (reload) {
      window.location.reload();
    }
  }

  // Elimina al usuario actual autenticado
  deleteUser() {
    return deleteUser(this.auth.currentUser);
  }

  // Inicia sesión mediante un proveedor externo
  loginWithProvider(providerId: string) {
     let provider;
     if (providerId == 'google') {
      provider = new GoogleAuthProvider();
     }
     if (providerId == 'apple') {
      provider = new OAuthProvider('apple.com');
     }
     if (providerId == 'facebook') {
      provider = new FacebookAuthProvider();
     }
     if (provider) {
      signInWithRedirect(this.auth, provider); // Redirige al usuario para iniciar sesión con el proveedor
     }
  }

  // Obtiene el token del proveedor para autenticación en una plataforma nativa
  async getTokenOfProvider(providerId: string) {
    console.log('getTokenOfProvider -> ', providerId);
    return new Promise<string>( async (resolve) => {
      try {
        const path = Models.Auth.PathIntentsLogin;
        const data: any = {
          provider: providerId,
          token: null
        }
        const id = await this.firestoreService.createDocument(path, data); // Crea un documento de intención de inicio de sesión en Firestore

        // Observa cambios en el documento para obtener el token del proveedor
        const s = this.firestoreService.getDocumentChanges<any>(`${path}/${id}`).subscribe( async (response) => {
          if (response) {
            if (response.provider == providerId && response.token) {
              console.log('login with token -> ', response);
              Browser.close();
              s.unsubscribe();
              this.firestoreService.deleteDocument(`${path}/${id}`); // Elimina el documento de intención
              resolve(response.token); // Resuelve la promesa con el token
            }
          }
        });

        const link = `https://${environment.firebaseConfig.authDomain}/user/request-login?provider=${providerId}&intentId=${id}`;
        console.log('link -> ', link);
        await Browser.open({ url: link });
      } catch (error) {
        console.log('getTokenOfProvider -> ', error);
        resolve(null);
      }
    });
  }

  // Inicia sesión usando un token de proveedor específico
  async loginWithTokenOfProvider(providerId: string, token: string) {
    let credential: OAuthCredential;
    switch (providerId) {
      case 'google':
        credential = GoogleAuthProvider.credential(token);
        break;
      case 'apple':
        const OAuth = new OAuthProvider('apple.com');
        credential = OAuth.credential({idToken: token});
        break;
      case 'facebook':
        credential = FacebookAuthProvider.credential(token);
        break;
    }
    console.log('credentials -> ', credential);
    if (credential) {
      return await signInWithCredential(this.auth, credential); // Inicia sesión con las credenciales del token
    }
    return null;
  }

  // Obtiene el resultado de inicio de sesión después de una redirección
  getRedirectResult() {
    return getRedirectResult(this.auth);
  }
}
