import { log } from './../../../../../node_modules/google-gax/node_modules/@grpc/grpc-js/src/logging';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../firebase/authentication.service';
import { OAuthProvider } from '@angular/fire/auth';
import { Models } from 'src/app/models/models';
import { FirestoreService } from '../../../firebase/firestore.service';
import { UserService } from 'src/app/services/user.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { MenuController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-request-login',
  templateUrl: './request-login.component.html',
  styleUrls: ['./request-login.component.scss'],
})
export class RequestLoginComponent  implements OnInit {
  private authenticationService: AuthenticationService = inject(AuthenticationService); // Inyecta el servicio de autenticación para manejar el inicio de sesión
  private firestoreService: FirestoreService = inject(FirestoreService); // Inyecta el servicio FirestoreService para interactuar con la base de datos de Firebase
  userService: UserService = inject(UserService); // Inyecta el servicio UserService para manejar la validación del perfil del usuario

  // Constructor con inyección de dependencias para servicios y router
  constructor(private route: ActivatedRoute,
              private router: Router,
              private interactionService: InteractionService,
              private menuController: MenuController) {
    this.getQueryParams(); // Obtiene y procesa los parámetros de consulta de la URL
    this.getTokenOfProvider(); // Obtiene el token de autenticación del proveedor
    this.userService.validateHasProfile = false;
    this.menuController.enable(false, 'main');
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Método para obtener y procesar los parámetros de consulta de la URL
  async getQueryParams() {
    const queryParams: any = this.route.snapshot.queryParams;
    console.log('queryParams -> ', queryParams);

    // Si existen los parámetros 'provider' e 'intentId', inicia el proceso de login con el proveedor
    if (queryParams.provider && queryParams.intentId) {
      const provider = queryParams.provider;
      await this.interactionService.showLoading('Procesando...');
      this.authenticationService.loginWithProvider(provider);
      this.router.navigate(['/user/request-login'], { queryParams: { intentId: queryParams.intentId}});
    }
  }

  // Método para obtener el token de autenticación desde el proveedor y guardarlo
  async getTokenOfProvider() {
    await this.interactionService.showLoading('Redirigiendo...');
    const result =  await this.authenticationService.getRedirectResult();
    console.log('getRedirectResult -> ', result);

    // Si existe un resultado válido, obtiene las credenciales y guarda el token
    if (result) {
      const credential = OAuthProvider.credentialFromResult(result);
      console.log('credential -> ', credential);
      const token = credential.idToken ? credential.idToken : credential.accessToken;
      this.saveToken(token);
      console.log('token -> ', token);
    } else {
      this.interactionService.dismissLoading();
    }
  }

  // Método para guardar el token de autenticación en Firestore y cerrar sesión
  async saveToken(token: string) {
    const queryParams: any = this.route.snapshot.queryParams;
    const intentId = queryParams.intentId;
    // console.log('intentId -> ', intentId);
    // console.log('saveToken -> ', token);

    // Si existe un 'intentId' válido, procede a guardar el token
    if (intentId) {
      const path = Models.Auth.PathIntentsLogin;
      const dataUpdate = { token };
      await this.firestoreService.updateDocument(`${path}/${intentId}`, dataUpdate); // Guarda el token en Firestore
      this.authenticationService.logout();
      console.log('guardado token con éxito');
    }
  }
}
