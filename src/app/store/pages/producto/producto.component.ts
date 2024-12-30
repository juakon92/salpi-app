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
  count = signal(0);
  suscriberCarrito: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {
    const data = this.router.getCurrentNavigation().extras.state as any;
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

  getParam() {
    this.route.params.subscribe((params: any) => {
      if (params.enlace) {
        console.log('getParam -> ', params.enlace);
        this.loadProduct(params.enlace);
      }
    });
  }

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

  async getRole() {
    const user = await this.userService.getState();
    if (user) {
      this.roles = await this.userService.getRole();
      console.log('getRole -> ', this.roles);
    }
  }

  editProduct() {
    this.router.navigate(['/backoffice/ajustes/producto-detalle'], {
      queryParams: { id: this.product.id },
    });
  }

  getCarrito() {
    const carrito = this.carritoService.getCarrito();
    this.setCant(carrito);
    this.carritoService.getCarritoChanges().subscribe((res) => {
      this.setCant(res);
    });
  }

  setCant(carrito: Models.Tienda.Carrito) {
    const item = carrito?.items.find(
      (itemExist) => itemExist?.product?.id == this.product?.id
    );
    console.log('item -> ', item);
    if (item) {
      this.count.set(item.cant); // = item.cant;
    } else {
      this.count.set(0);
    }
  }

  add() {
    this.carritoService.addItem(this.product);
  }

  remove() {
    this.carritoService.removeItem(this.product);
  }
}