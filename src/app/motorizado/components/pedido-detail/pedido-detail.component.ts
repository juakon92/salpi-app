import { Component, Input, OnInit, inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AuthenticationService } from 'src/app/firebase/authentication.service';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-pedido-detail',
  templateUrl: './pedido-detail.component.html',
  styleUrls: ['./pedido-detail.component.scss'],
})
export class PedidoDetailComponent implements OnInit {
  private firestoreService: FirestoreService = inject(FirestoreService);
  private interactionService: InteractionService = inject(InteractionService);
  private authenticationService: AuthenticationService = inject(
    AuthenticationService
  );
  user: User;

  @Input() pedido: Models.Tienda.Pedido;
  estados = Models.Tienda.StepsPedido;

  constructor() {
    this.user = this.authenticationService.getCurrentUser();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Toma un pedido asignándolo al usuario actual.
   * Actualiza el estado del pedido en Firestore a "asignado" y almacena los datos del repartidor.
   */
  async tomarPedido() {
    await this.interactionService.showLoading('Tomando pedido...');
    try {
      const path = `${Models.Auth.PathUsers}/${this.pedido.uid}/${Models.Tienda.pathPedidos}/${this.pedido.id}`;

      // Datos a actualizar en el documento del pedido
      const updateData: any = {
        state: 'asignado',
        dealer: {
          uid: this.user.uid,
          name: this.user.displayName,
          coordinate: null,
        },
      };

      // Actualiza el documento en Firestore con los nuevos datos
      await this.firestoreService.updateDocument(path, updateData);
      this.interactionService.dismissLoading();
    } catch (error) {
      console.error(error);
      this.interactionService.presentAlert(
        'Error',
        'No se pudo tomar el estado'
      );
      this.interactionService.dismissLoading();
    }
  }
}
