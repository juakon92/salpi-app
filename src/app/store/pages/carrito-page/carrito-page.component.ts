import { Component, OnInit, inject } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Models } from 'src/app/models/models';
import { AuthenticationService } from 'src/app/firebase/authentication.service';

@Component({
  selector: 'app-carrito-page',
  templateUrl: './carrito-page.component.html',
  styleUrls: ['./carrito-page.component.scss'],
})
export class CarritoPageComponent implements OnInit {
  private carritoService: CarritoService = inject(CarritoService);
  carrito: Models.Tienda.Carrito;
  infoPedido: Models.Tienda.InfoPedido;

  constructor() {
    this.loadCarrito();
    this.loadInfoPedido();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Carga el estado actual del carrito desde el servicio y suscribe a cambios.
   * Se actualiza cada vez que hay un cambio en el estado del carrito.
   */
  loadCarrito() {
    this.carrito = this.carritoService.getCarrito();
    this.carritoService.getCarritoChanges().subscribe((res) => {
      this.carrito = res;
    });
  }

  /**
   * Carga la información del pedido desde el servicio y suscribe a cambios.
   * Se actualiza cada vez que hay un cambio en la información del pedido.
   */
  loadInfoPedido() {
    this.infoPedido = this.carritoService.getInfoPedido();
    this.carritoService.getInfoPedidoChanges().subscribe((res) => {
      this.infoPedido = res;
      console.log('infoPedido in carrito-page -> ', this.infoPedido);
    });
  }

  /**
   * Inicia el proceso de realizar el pedido.
   * Llama al servicio de carrito para realizar el pedido con la información actual.
   */
  pedir() {
    console.log('pedir infoPedido -> ', this.infoPedido);
    this.carritoService.pedir();
  }
}
