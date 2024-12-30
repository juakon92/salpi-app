import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonToolbar, IonMenu, IonSplitPane, IonHeader, IonTitle, IonContent, IonIcon, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { IoniconsService } from './services/ionicons.service';
import { SidemenuComponent } from './shared/components/sidemenu/sidemenu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButtons, IonIcon, IonMenu, IonContent, IonTitle, IonHeader, IonSplitPane, IonToolbar, IonApp, IonRouterOutlet, IonMenuButton, SidemenuComponent],
})
export class AppComponent {
  private ioniconsService: IoniconsService = inject(IoniconsService);

  constructor() {
    this.ioniconsService.loadAllIcons();
  }
}
