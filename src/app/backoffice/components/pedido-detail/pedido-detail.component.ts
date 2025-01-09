import { Component, Input, OnInit, inject } from '@angular/core';
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

  @Input() pedido: Models.Tienda.Pedido; // Entrada (Input) desde un componente padre, representa un pedido específico
  estados = Models.Tienda.StepsPedido; // Referencia a los estados posibles de un pedido definidos en el modelo

  constructor() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Método asincrónico para cambiar el estado de un pedido.
   * Realiza la actualización del estado en Firestore y maneja interacciones con el usuario.
   */
  async changeState() {
    console.log('changeState -> ', this.pedido.state);
    await this.interactionService.showLoading('Actualizando estado...'); // Muestra un indicador de carga al usuario
    try {
      // Construcción del path al documento Firestore del pedido específico
      const path = `${Models.Auth.PathUsers}/${this.pedido.info.datos.id}/${Models.Tienda.pathPedidos}/${this.pedido.id}`;

      // Datos que se actualizarán en el documento Firestore
      const updateData = {
        state: this.pedido.state, // Nuevo estado del pedido
      };

      // Actualización del documento en Firestore
      await this.firestoreService.updateDocument(path, updateData);

      // Dismiss el indicador de carga después de la actualización exitosa
      this.interactionService.dismissLoading();
    } catch (error) {
      // Manejo de errores en caso de que falle la actualización
      console.error(error); // Registro del error en la consola
      this.interactionService.presentAlert(
        'Error',
        'No se pudo actualizar el estado' // Mensaje de error mostrado al usuario
      );
      this.interactionService.dismissLoading(); // Cierra el indicador de carga aunque haya ocurrido un error
    }
  }
}
