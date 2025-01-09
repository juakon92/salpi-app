import { Component, OnInit, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonLabel,
  IonItem,
  IonRouterLink,
  MenuController,
  IonToggle,
  IonAvatar,
  Platform,
} from '@ionic/angular/standalone';
import { Models } from 'src/app/models/models';
import { UserService } from '../../../services/user.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../../firebase/authentication.service';
import { User } from '@angular/fire/auth';
import { SharedModule } from '../../shared.module';
import { StatusBar, Style } from '@capacitor/status-bar';
import { environment } from 'src/environments/environment';
import { InteractionService } from 'src/app/services/interaction.service';
import { FirestoreService } from 'src/app/firebase/firestore.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonMenuToggle,
    RouterModule,
    CommonModule,
    IonRouterLink,
    IonToggle,
    FormsModule,
    SharedModule,
  ],
})
export class SidemenuComponent implements OnInit {
  menu: Menu[] = []; // Lista de opciones del menú
  paletteToggle = false; // Estado del modo oscuro
  user: User;
  roles: Models.Auth.Roles;
  version: string = environment.version;

  private interactionService: InteractionService = inject(InteractionService);
  private firestoreService: FirestoreService = inject(FirestoreService);

  /**
   * Constructor del componente.
   * @param menuController - Controlador para manejar el menú lateral.
   * @param authenticationService - Servicio de autenticación.
   * @param userService - Servicio para manejar información del usuario.
   * @param platform - Servicio para detectar la plataforma.
   */
  constructor(
    private menuController: MenuController,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private platform: Platform
  ) {
    this.initDarkMode();

    // Escucha los cambios en el estado de autenticación
    this.authenticationService.authState.subscribe(async (res) => {
      this.user = res;
      if (this.user) {
        const roles = await this.userService.getRole();
        console.log('roles -> ', roles);
        this.roles = roles;
      }
      this.initMenu();
    });
    this.compararVersion();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Inicializa el menú lateral según los roles del usuario.
   */
  initMenu() {
    console.log('initMenu -> ', this.roles);
    this.menu = [];
    menu.forEach((opc) => {
      let enable: boolean = false;
      if (opc.roles) {
        if (this.roles) {
          opc.roles.every((role) => {
            if (this.roles[role]) {
              enable = true;
              return false;
            }
            return true;
          });
        }
      } else {
        enable = true;
      }
      if (enable) {
        this.menu.push(opc);
      }
    });
    console.log(' this.menu -> ', this.menu);
  }

  /**
   * Cierra el menú lateral si está abierto.
   */
  async closeMenu() {
    const isOpen = await this.menuController.isOpen('sidemenu');
    if (isOpen) {
      this.menuController.close('sidemenu');
    }
  }

  /**
   * Inicializa el modo oscuro basado en la configuración del sistema.
   */
  initDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.initializeDarkPalette(prefersDark.matches);

    prefersDark.addEventListener('change', (mediaQuery) =>
      this.initializeDarkPalette(mediaQuery.matches)
    );
  }

  /**
   * Establece la paleta de colores según el modo oscuro.
   * @param isDark - Indica si el modo oscuro está activado.
   */
  initializeDarkPalette(isDark: any) {
    this.paletteToggle = isDark;
    this.toggleDarkPalette(isDark);
  }

  /**
   * Cambia el modo oscuro manualmente.
   * @param ev - Evento del toggle.
   */
  toggleChange(ev: any) {
    this.toggleDarkPalette(ev.detail.checked);
  }

  /**
   * Aplica el tema oscuro o claro a la app.
   * @param shouldAdd - Indica si se debe activar el modo oscuro.
   */
  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
    if (this.platform.is('capacitor')) {
      if (shouldAdd) {
        StatusBar.setBackgroundColor({ color: '#08265d' });
        StatusBar.setStyle({ style: Style.Dark });
      } else {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#93abd7' });
      }
    }
  }

  /**
   * Cierra la sesión del usuario.
   */
  salir() {
    this.authenticationService.logout();
  }

  /**
   * Compara la versión actual de la app con la versión más reciente.
   */
  compararVersion() {
    // if (this.platform.is('capacitor')) {
    const path = 'Version/version';
    this.firestoreService
      .getDocumentChanges<Version>(path)
      .subscribe(async (res) => {
        if (res) {
          console.log('compararVersion -> ', res);

          const versionActual = res.version.split('.');
          console.log('versionActual -> ', versionActual);

          const versionApp = this.version.split('.');
          console.log('versionApp -> ', versionApp);

          // verificar si hay un cambio mayor
          if (+versionApp[0] < +versionActual[0]) {
            this.gotoStore(res);
            return;
          }

          // verificar si hay un cambio menor
          if (+versionApp[1] < +versionActual[1]) {
            this.gotoStore(res);
            return;
          }

          // verificar si hay un patch o una corrección en la app
          if (+versionApp[2] < +versionActual[2]) {
            this.gotoStore(res);
            return;
          }
        }
      });
    // }
  }

  /**
  * Redirige al usuario a la tienda de aplicaciones para actualizar la app.
  * @param res - Información de la nueva versión.
  */
  async gotoStore(res: Version) {
    await this.interactionService.presentAlert('Importante', res.novedad);
    let enlace: string;
    if (this.platform.is('android')) {
      enlace = res.android;
    }
    if (this.platform.is('ios')) {
      enlace = res.ios;
    }
    window.open(enlace, 'blank');
    this.gotoStore(res);
  }
}

interface Menu {
  name: string;
  enlace: string;
  icon: string;
  roles?: Models.Auth.Role[];
}

const menu: Menu[] = [
  { name: 'Usuarios', enlace: '/user/admin', icon: 'people', roles: ['admin'] },
  {
    name: 'Ajustes',
    enlace: '/backoffice/ajustes',
    icon: 'cog',
    roles: ['admin'],
  },
  { name: 'Tienda', enlace: '/store', icon: 'storefront' },
  {
    name: 'Mis pedidos',
    enlace: '/store/mis-pedidos',
    icon: 'cube',
    roles: ['client'],
  },
  {
    name: 'Pedidos',
    enlace: '/backoffice/pedidos',
    icon: 'cube',
    roles: ['admin'],
  },
  {
    name: 'Pedidos',
    enlace: '/motorizado/pedidos',
    icon: 'cube',
    roles: ['dealer'],
  },
  {
    name: 'Mis pedidos',
    enlace: '/motorizado/mis-pedidos',
    icon: 'bicycle',
    roles: ['dealer'],
  },
];

interface Version {
  version: string;
  android: string;
  ios: string;
  novedad: string;
}
