import { Injectable, inject } from '@angular/core';
import { AuthenticationService } from '../firebase/authentication.service';
import { User } from '@angular/fire/auth';
import { FirestoreService } from '../firebase/firestore.service';
import { Models } from '../models/models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private authenticationService: AuthenticationService = inject(AuthenticationService);
  private firestoreService: FirestoreService = inject(  FirestoreService);
  private user: User;
  private userProfile: Models.Auth.UserProfile;
  private login: 'login' | 'not-login' ;
  private roles: any;

  validateHasProfile: boolean = true;

  constructor(private router: Router) {
    console.log('UserService init');
    this.getState();
  }

  // Obtiene el estado de autenticación del usuario
  getState() {
    return new Promise<User>((resolve) => {
      if (this.login) {
        resolve(this.user); // Resuelve si el usuario ya tiene un estado
        return;
      }
      // Se suscribe al estado de autenticación de Firebase
      this.authenticationService.authState.subscribe( res => {
        if (res) {
          this.user = res;
          this.login = 'login';
          console.log('authState -> ', this.user);

          this.getRole(); // Obtiene los roles del usuario

          if (this.validateHasProfile) {
            this.getUserProfile(res.uid); // Obtiene el perfil del usuario si es necesario
          }
        } else {
          this.user = null;
          this.login = 'not-login';
        }
        resolve(this.user); // Resuelve con el usuario (o null si no hay sesión)
      });
    });
  }

  // Método para obtener el perfil del usuario desde Firestore
  async getUserProfile(uid: string) {
    return new Promise<Models.Auth.UserProfile>( async (resolve) => {
      if (this.userProfile) {
        resolve(this.userProfile);
        return;
      }

      // Obtiene el documento del perfil del usuario desde Firestore
      const response = await this.firestoreService.getDocument<Models.Auth.UserProfile>(`${Models.Auth.PathUsers}/${uid}`);
      if (response.exists()) {
        this.userProfile = response.data();
        resolve(this.userProfile);

        // Sincroniza el email del perfil de usuario si es diferente al de Firebase Authentication
        if (this.userProfile.email != this.user.email) {
          console.log('sincronizar email');
          const updateData = {email: this.user.email};
          this.firestoreService.updateDocument(`${Models.Auth.PathUsers}/${uid}`, updateData); // Actualiza el email en Firestore
        }
      } else {
        this.router.navigate(['/user/completar-registro']); // Redirige al usuario para completar el registro si no hay perfil
      }
    });
  }

  // Verifica si el usuario está autenticado
  isLogin() {
    return new Promise<boolean>( async (resolve) => {
      console.log('isLogin');
      const user = await this.getState();
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // Obtiene los roles del usuario desde el token de autenticación
  async getRole() {
    if (this.roles) {
      return this.roles;
    }
    if (this.user) {
      const tokenResult = await this.user.getIdTokenResult(true); // Obtiene los claims del token de autenticación
      console.log('tokenResult -> ', tokenResult);
      const claims: any = tokenResult.claims;
      if (claims.roles) {
        this.roles = claims.roles;
        return claims.roles;
      }
    }
    return null;
  }
}
