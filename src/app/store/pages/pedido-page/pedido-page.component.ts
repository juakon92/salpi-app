import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonRow,
  IonGrid,
  IonCol,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonRouterLink,
  IonIcon,
  IonLabel,
  IonBackButton,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonThumbnail,
  IonText,
  IonCard,
  IonBadge,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/firebase/authentication.service';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';
import { DatefirePipe } from 'src/app/shared/pipes/datefire.pipe';
import { StepperModule, Stepper } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { NotificationsModule } from 'src/app/notifications/notifications.module';

@Component({
  selector: 'app-pedido-page',
  templateUrl: './pedido-page.component.html',
  styleUrls: ['./pedido-page.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    RouterModule,
    IonRouterLink,
    IonIcon,
    IonBackButton,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonThumbnail,
    IonText,
    IonBadge,
    DatefirePipe,
    CommonModule,
    StepperModule,
    StepsModule,
    NotificationsModule
  ],
})
export class PedidoPageComponent implements OnInit, OnDestroy {
  authenticationService: AuthenticationService = inject(AuthenticationService);
  firestoreService: FirestoreService = inject(FirestoreService);
  user: User;
  suscriberPedido: Subscription;
  cargando: boolean = true;

  pedido: Models.Tienda.Pedido;
  step: number = null; // Paso actual del estado del pedido
  steps = Models.Tienda.StepsPedido; // Lista de estados del pedido

  constructor(private route: ActivatedRoute) {
    this.user = this.authenticationService.getCurrentUser();
    this.getParams();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  ngOnDestroy(): void {
    this.suscriberPedido?.unsubscribe();
  }

  /**
   * Obtiene los parámetros de la ruta activa y carga el pedido asociado.
   */
  getParams() {
    this.route.params.subscribe((params: any) => {
      if (params.id) {
        this.loadPedido(params.id);
      }
    });
  }

  /**
   * Carga el pedido especificado desde Firestore y suscribe a cambios en tiempo real.
   * @param id - ID del pedido a cargar.
   */
  async loadPedido(id: string) {
    console.log('loadPedido -> ', id);
    const uid = this.user.uid;
    const path = `${Models.Auth.PathUsers}/${uid}/${Models.Tienda.pathPedidos}/${id}`;
    this.cargando = true;
    this.suscriberPedido = this.firestoreService
      .getDocumentChanges<Models.Tienda.Pedido>(path)
      .subscribe((res) => {
        console.log('loadPedidoChanges -> ', res);
        this.cargando = false;
        if (res) {
          this.pedido = res;
          this.setStep();
        }
      });
  }

  /**
   * Calcula el paso actual del pedido en función de su estado.
   */
  setStep() {
    const step = this.steps.findIndex((step) => step == this.pedido.state);
    this.step = step;
    console.log('step -> ', this.step);
  }
}
