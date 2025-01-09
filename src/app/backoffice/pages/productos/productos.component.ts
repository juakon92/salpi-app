import { Component, OnInit, inject } from '@angular/core';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss'],
})
export class ProductosComponent implements OnInit {
  private firestoreService: FirestoreService = inject(FirestoreService);
  private interactionService: InteractionService = inject(InteractionService);

  products: QueryDocumentSnapshot<Models.Tienda.Product>[];

  enableOptions: boolean = false;
  productSelected: Models.Tienda.Product;

  numItems: number = 9;
  enableMore: boolean = true;

  constructor(private router: Router) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Método que se ejecuta cuando la vista entra en foco.
   * Inicializa la lista de productos y carga los datos.
   */
  ionViewDidEnter() {
    this.products = [];
    this.loadProducts();
  }

  /**
   * Carga los productos desde Firestore con paginación.
   */
  async loadProducts() {
    console.log('loadProducts');
    const path = Models.Tienda.pathProducts;
    // crear regla en firebase
    const extras: Models.Firestore.extrasQuery = {
      orderParam: 'date',
      directionSort: 'desc',
      limit: this.numItems,
    };

    if (this.products) {
      const last = this.products[this.products.length - 1];
      // const snapDoc = await this.firestoreService.getDocument(`${path}/${last.id}`)
      extras.startAfter = last;
    }

    const res =
      await this.firestoreService.getDocumentsQuery<Models.Tienda.Product>(
        path,
        [[]],
        extras
      );
    console.log('res -> ', res.docs);

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
   * Carga más productos cuando se activa el scroll infinito.
   * @param event - Evento de scroll infinito.
   */
  async loadMore(event: any) {
    console.log('loadMore');
    await this.loadProducts();
    event.target.complete();
  }

  /**
   * Navega a la vista de creación de un nuevo producto.
   */
  addProduct() {
    this.router.navigate(['backoffice/ajustes/producto-detalle']);
  }

  /**
   * Navega a la vista de edición de un producto.
   * @param product - Producto seleccionado para editar.
   */
  editProduct(product: Models.Tienda.Product) {
    if (this.enableOptions) {
      this.enableOptions = false;
      return;
    }
    console.log('editProduct -> ', product.id);
    this.router.navigate(['/backoffice/ajustes/producto-detalle'], {
      queryParams: { id: product.id },
    });
  }

  /**
   * Habilita las opciones para un producto seleccionado.
   * @param event - Evento de clic.
   * @param product - Producto seleccionado.
   */
  showOptions(event: any, product: Models.Tienda.Product) {
    event.preventDefault();
    console.log('showOptions');
    this.enableOptions = true;
    this.productSelected = product;
  }

  /**
   * Elimina un producto seleccionado después de confirmar la acción.
   */
  async delete() {
    console.log('delete -> ', this.productSelected);
    const response = await this.interactionService.presentAlert(
      'Importante',
      '¿Seguro que deseas eliminar este producto?',
      'Cancelar',
      'Eliminar'
    );
    if (response) {
      const path = Models.Tienda.pathProducts;
      await this.interactionService.showLoading('Eliminando...');
      await this.firestoreService.deleteDocument(
        `${path}/${this.productSelected.id}`
      );
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Eliminado con éxito');

      // eliminar manualmente del arreglo de productos
      const index = this.products.findIndex(
        (product) => this.productSelected.id == product.data().id
      );
      console.log('index to delete -> ', index);
      if (index >= 0) {
        this.products.splice(index, 1);
      }
    }
    this.enableOptions = false;
    this.productSelected = null;
  }
}
