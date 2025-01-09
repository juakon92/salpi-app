import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { IonButton, IonIcon, IonRouterLink } from '@ionic/angular/standalone';
import { BadgeModule } from 'primeng/badge';
import { Models } from 'src/app/models/models';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button-carrito',
  templateUrl: './button-carrito.component.html',
  styleUrls: ['./button-carrito.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, BadgeModule, RouterModule, IonRouterLink],
})
export class ButtonCarritoComponent implements OnInit, OnDestroy {
  count = signal(0); // Variable reactiva para almacenar la cantidad de productos en el carrito
  private carritoService: CarritoService = inject(CarritoService);
  suscriberCarrito: Subscription; // Suscripción para escuchar cambios en el carrito

  constructor() {
    this.init();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  ngOnDestroy(): void {
    this.suscriberCarrito?.unsubscribe();
  }

  /**
   * Inicializa el estado del componente.
   * Obtiene el carrito actual desde el servicio y escucha los cambios en el carrito.
   */
  init() {
    const carrito = this.carritoService.getCarrito();
    this.setCount(carrito);
    this.carritoService.getCarritoChanges().subscribe((carrito) => {
      this.setCount(carrito);
    });
  }

  /**
   * Actualiza la cantidad de productos en el carrito.
   * @param carrito - El carrito actual desde el servicio.
   */
  setCount(carrito: Models.Tienda.Carrito) {
    if (carrito) {
      this.count.set(carrito.cant);
    }
  }
}
