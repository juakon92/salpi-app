import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page.component';
import { HomeStoreComponent } from './pages/home-store/home-store.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { guards } from '../shared/guards/guards';

const routes: Routes = [
  { path: '', component: HomeStoreComponent },
  { path: 'item/:enlace', component: ProductoComponent },
  { path: 'carrito', component: CarritoPageComponent },
  {
    path: 'map-direccion-pedido',
    loadComponent: () =>
      import(
        './components/map-direccion-pedido/map-direccion-pedido.component'
      ).then((m) => m.MapDireccionPedidoComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {}