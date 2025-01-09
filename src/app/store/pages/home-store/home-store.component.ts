import { Component, OnInit, inject } from '@angular/core';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';
import { Observable } from 'rxjs';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-home-store',
  templateUrl: './home-store.component.html',
  styleUrls: ['./home-store.component.scss'],
})
export class HomeStoreComponent implements OnInit {
  private firestoreService: FirestoreService = inject(FirestoreService);

  categories$: Observable<Models.Tienda.Category[]>;
  categorySelected: string;

  products: QueryDocumentSnapshot<Models.Tienda.Product>[];
  numItems: number = 8;
  enableMore: boolean = true;

  constructor() {
    this.loadCategories();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Carga las categorías desde Firestore y establece la primera categoría como seleccionada.
   * También dispara la carga inicial de productos asociados a la primera categoría.
   */
  loadCategories() {
    const path = Models.Tienda.pathCategories;
    this.categories$ = this.firestoreService.getDocumentsChanges(path);
    this.categories$.subscribe((res) => {
      if (!this.categorySelected && res) {
        this.categorySelected = res[0].id;
        console.log('this.categorySelected -> ', this.categorySelected);
        this.loadProducts();
      }
    });
  }

  /**
   * Maneja el cambio de categoría seleccionada en el segmento de la interfaz.
   * Resetea los productos actuales y carga los nuevos productos de la categoría seleccionada.
   */
  segmentChanged() {
    console.log('segmentChanged -> ', this.categorySelected);
    this.products = [];
    this.loadProducts();
  }

  /**
   * Carga los productos desde Firestore según la categoría seleccionada.
   * Implementa la paginación para cargar más productos cuando sea necesario.
   */
  async loadProducts() {
    console.log('loadProducts');
    const path = Models.Tienda.pathProducts;
    const extras: Models.Firestore.extrasQuery = {
      limit: this.numItems
    };

    if (this.products) {
      const last = this.products[this.products.length - 1];
      extras.startAfter = last;
    }

    const res =
      await this.firestoreService.getDocumentsQuery<Models.Tienda.Product>(
        path,
        [['category.id', '==', this.categorySelected]],
        extras
      );

    console.log('loadProducts res -> ', res.size);

    if (res.size) {
      if (this.products) {
        this.products.push(...res.docs);
      } else {
        this.products = res.docs;
      }
    }

    if (res.size == this.numItems) {
      this.enableMore = true;
    } else {
      this.enableMore = false;
    }
  }

  /**
   * Carga más productos cuando el usuario alcanza el final de la lista.
   * Se activa mediante un evento de desplazamiento.
   *
   * @param event Evento disparado al intentar cargar más productos
   */
  async loadMore(event: any) {
    console.log('loadMore');
    await this.loadProducts();
    event.target.complete();
  }
}
