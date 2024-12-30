import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AuthenticationService } from '../../../firebase/authentication.service';
import { Models } from 'src/app/models/models';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InteractionService } from '../../../services/interaction.service';
import { IonModal } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent  implements OnInit {
  authenticationService: AuthenticationService = inject(AuthenticationService); // Inyecta el servicio de autenticación
  cargando: boolean = false;

  enableLoginWithEmailAndPassword: boolean = false; // Activa o desactiva el formulario de login por email y contraseña

  datosForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  reestablecerPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  @ViewChild('modalRecuperarPassword') modalRecuperarPassword: IonModal // Modal para reestablecer contraseña

  // Lista de proveedores de autenticación disponibles
  providers: Models.Auth.ProviderLoginI[] = [
    {
      name: 'Iniciar sesión con Google',
      id: 'google',
      color: '#20a3df',
      textColor: 'white',
      icon: 'logo-google'
    },
    {
      name: 'Iniciar sesión con Apple',
      id: 'apple',
      color: 'black',
      textColor: 'white',
      icon: 'logo-apple'
    },
    {
      name: 'Iniciar sesión con Facebook',
      id: 'facebook',
      color: '#1871ed',
      textColor: 'white',
      icon: 'logo-facebook'
    },
    {
      name: 'Iniciar sesión con correo y contraseña',
      id: 'password',
      color: '#9e9e9e',
      textColor: 'white',
      icon: 'mail'
    }
  ]

  constructor(private fb: FormBuilder,private router: Router,private interactionService: InteractionService) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Método para iniciar sesión con un proveedor seleccionado
  async loginWithProvider(provider: Models.Auth.ProviderLoginI) {
    // Si se selecciona "correo y contraseña", activa el formulario de login por email y contraseña
    if (provider.id == 'password') {
      this.enableLoginWithEmailAndPassword = true;
      return;
    }

    // Si la plataforma es nativa, usa el token del proveedor para autenticar
    if (Capacitor.isNativePlatform()) {
      await this.interactionService.showLoading('Procesando...');
      const token = await this.authenticationService.getTokenOfProvider(provider.id);
      console.log(`token: ${token} para hacer el login con -> ${provider.id}`);
      const response = await this.authenticationService.loginWithTokenOfProvider(provider.id, token);
      this.interactionService.dismissLoading();

      // Si la autenticación es exitosa, muestra un mensaje de bienvenida y redirige al perfil
      if (response) {
        const user = response.user;
        this.interactionService.showToast(`Bienvenido ${user.displayName}`);
        setTimeout(() => {
          this.router.navigate(['user', 'perfil'], {replaceUrl: true});
        }, 200);
      }
    } else {
      // Si la plataforma no es nativa, redirige al proveedor de autenticación
      await this.interactionService.showLoading('Procesando...');
      this.authenticationService.loginWithProvider(provider.id);
    }
  }

  // Método para enviar un correo de reestablecimiento de contraseña
  async resetPassword() {
    if (this.reestablecerPasswordForm.valid) {
      const data = this.reestablecerPasswordForm.value;
      this.modalRecuperarPassword.dismiss(); // Cierra el modal de reestablecimiento de contraseña
      await this.interactionService.showLoading('Enviando correo...');
      console.log('resetPassword valid -> ', data);

      try {
        // Envía el correo de reestablecimiento
        await this.authenticationService.sendPasswordResetEmail(data.email);
        this.interactionService.dismissLoading();
        this.interactionService.presentAlert('Importante',
          'Te hemos enviado un correo para reestablecer tu contraseña');
        console.log('te hemos enviado un correo para reestablecer tu contraseña');
      } catch (error) {
        console.log('resetPassword error -> ', error);
      }
    }
  }

  // Método para iniciar sesión con email y contraseña
  async loginWithEmail() {
    if (this.loginForm.valid) {
      const data = this.loginForm.value;
      await this.interactionService.showLoading('Ingresando...');
      try {
        // Inicia sesión usando el email y contraseña ingresados
        const response = await this.authenticationService.login(data.email, data.password);
        this.interactionService.dismissLoading();

        // Si la autenticación es exitosa, muestra mensaje de bienvenida y redirige al perfil
        const user = response.user;
        this.interactionService.showToast(`Bienvenido ${user.displayName}`);
        setTimeout(() => {
          this.router.navigate(['user', 'perfil'], {replaceUrl: true});
        }, 500);
      } catch (error) {
        console.log('login error -> ', error);
        this.interactionService.dismissLoading();
        this.interactionService.presentAlert('Error', 'Credenciales inválidas'); // Muestra alerta de error en caso de credenciales inválidas
      }
    }
  }
}
