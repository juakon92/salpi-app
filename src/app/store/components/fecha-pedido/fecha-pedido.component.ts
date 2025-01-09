import { Component, OnInit, inject } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-fecha-pedido',
  templateUrl: './fecha-pedido.component.html',
  styleUrls: ['./fecha-pedido.component.scss'],
})
export class FechaPedidoComponent implements OnInit {
  private carritoService: CarritoService = inject(CarritoService);

  fechaEntrega = new Date().toISOString();
  min = new Date().toISOString();
  max: any;

  constructor() {
    this.setMaxDate();
  }

  ngOnInit() {
    this.carritoService.setFechaEntregaPedido(new Date(this.fechaEntrega));
  }

  /**
   * Establece el límite máximo permitido para la fecha de entrega.
   * El límite es 10 días después de la fecha actual.
   */
  setMaxDate() {
    const now = new Date();
    now.setDate(now.getDate() + 10);
    this.max = now.toISOString();
  }

  /**
   * Método que se ejecuta cuando el usuario cambia la fecha de entrega.
   * Actualiza la fecha de entrega seleccionada en el servicio del carrito.
   */
  changeDate() {
    console.log('changeDate() -> ', this.fechaEntrega);
    this.carritoService.setFechaEntregaPedido(new Date(this.fechaEntrega));
  }
}
