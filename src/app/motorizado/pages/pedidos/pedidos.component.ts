import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {
  private firestoreService: FirestoreService = inject(FirestoreService);
  pedidos: Models.Tienda.Pedido[];
  numItems: number = 2;
  enableMore: boolean = true;

  subscribersPedidos: Subscription[] = [];

  constructor() {}

  ngOnInit() {
    this.loadMorePedidos();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy pedidos motorizado');
    this.clearSubscribers();
  }

  /**
   * Carga más pedidos desde Firestore.
   * Utiliza la paginación para obtener los pedidos en bloques.
   * @param event - Evento opcional para manejar el scroll infinito.
   */
  loadMorePedidos(event: any = null) {
    console.log('loadMorePedidos');

    const path = Models.Tienda.pathPedidos;
    const query: Models.Firestore.whereQuery[] = [
      ['state', '==', 'tomado'],
      ['state', '==', 'asignado'],
    ];
    const extras: Models.Firestore.extrasQuery = {
      limit: this.numItems,
      orderParam: 'date',
      directionSort: 'desc',
      group: true,
    };

    if (this.pedidos?.length) {
      const last = this.pedidos[this.pedidos.length - 1];
      extras.startAfter = new Date(last.date.seconds * 1000);
    }

    const subscriberPedidos = this.firestoreService
      .getDocumentsQueryChanges<Models.Tienda.Pedido>(path, query, extras)
      .subscribe((res) => {
        console.log('loadPedidos changes -> ', res);
        if (res.length) {
          if (this.pedidos) {
            res.forEach((pedidoLoad) => {
              const index = this.pedidos.findIndex(
                (pedido) => pedido.id == pedidoLoad.id
              );
              if (index >= 0) {
                this.pedidos[index] = pedidoLoad;
              } else [this.pedidos.push(pedidoLoad)];
            });
          }
        }

        if (!this.pedidos) {
          this.pedidos = res;
        }

        // ordenar por fecha
        this.pedidos.sort((a, b) => b.date?.seconds - a.date?.seconds);

        if (res.length == this.numItems) {
          this.enableMore = true;
        } else {
          this.enableMore = false;
        }

        if (event) {
          event.target.complete();
        }
      });
    this.subscribersPedidos.push(subscriberPedidos);
  }

  /**
   * Limpia todas las suscripciones activas.
   * Esto es importante para evitar fugas de memoria.
   */
  clearSubscribers() {
    this.subscribersPedidos.forEach((subscriber) => {
      subscriber?.unsubscribe();
    });
    this.subscribersPedidos = [];
  }
}
