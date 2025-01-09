import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';
import { UserService } from '../../../services/user.service';
import { CarritoService } from '../../services/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit, OnDestroy {
  private firestoreService: FirestoreService = inject(FirestoreService);
  private userService: UserService = inject(UserService);
  product: Models.Tienda.Product;
  title: string;
  roles: Models.Auth.Roles;

  private carritoService: CarritoService = inject(CarritoService);
  count = signal(0); // Cantidad del producto actual en el carrito
  suscriberCarrito: Subscription; // Subscripción para cambios en el carrito

  constructor(private router: Router, private route: ActivatedRoute) {
    const data = this.router.getCurrentNavigation().extras.state as any;
    // Si el producto fue pasado como estado de navegación, se inicializa directamente
    if (data?.product) {
      console.log('data -> ', data);
      this.router.navigate([], { state: null, replaceUrl: true });
      this.product = data?.product;
      this.title = this.product.name;
      this.getCarrito();
    } else {
      this.getParam();
    }
    this.getRole();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  ngOnDestroy(): void {
    this.suscriberCarrito?.unsubscribe();
  }

  /**
   * Obtiene los parámetros de la ruta activa y carga el producto correspondiente.
   */
  getParam() {
    this.route.params.subscribe((params: any) => {
      if (params.enlace) {
        console.log('getParam -> ', params.enlace);
        this.loadProduct(params.enlace);
      }
    });
  }

  /**
   * Carga el producto desde Firestore utilizando su enlace permanente.
   * @param enlace - El enlace permanente del producto.
   */
  async loadProduct(enlace: string) {
    const path = Models.Tienda.pathProducts;
    const extras: Models.Firestore.extrasQuery = {
      limit: 1,
    };
    const response =
      await this.firestoreService.getDocumentsQuery<Models.Tienda.Product>(
        `${path}`,
        [['enlacePermanente', '==', enlace]],
        extras
      );
    console.log('loadProduct response -> ', response.size);

    if (response.size) {
      this.product = response.docs[0].data();
      console.log(' this.product -> ', this.product);
      this.title = this.product.name;
      this.getCarrito();
    }
  }

  /**
   * Obtiene los roles del usuario autenticado desde el servicio `UserService`.
   */
  async getRole() {
    const user = await this.userService.getState();
    if (user) {
      this.roles = await this.userService.getRole();
      console.log('getRole -> ', this.roles);
    }
  }

  /**
   * Navega al formulario de edición del producto actual.
   */
  editProduct() {
    this.router.navigate(['/backoffice/ajustes/producto-detalle'], {
      queryParams: { id: this.product.id },
    });
  }

  /**
   * Obtiene el carrito actual y suscribe a cambios en el mismo.
   */
  getCarrito() {
    const carrito = this.carritoService.getCarrito();
    this.setCant(carrito);
    this.carritoService.getCarritoChanges().subscribe((res) => {
      this.setCant(res);
    });
  }

  /**
   * Actualiza la cantidad del producto actual en el carrito.
   * @param carrito - El carrito actual.
   */
  setCant(carrito: Models.Tienda.Carrito) {
    const item = carrito?.items.find(
      (itemExist) => itemExist?.product?.id == this.product?.id
    );
    console.log('item -> ', item);
    if (item) {
      this.count.set(item.cant);
    } else {
      this.count.set(0);
    }
  }

  /**
   * Agrega el producto actual al carrito.
   */
  add() {
    this.carritoService.addItem(this.product);
  }

  /**
   * Elimina una unidad del producto actual del carrito.
   */
  remove() {
    this.carritoService.removeItem(this.product);
  }
}
