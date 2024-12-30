import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreRoutingModule } from './store-routing.module';
import { HomeStoreComponent } from './pages/home-store/home-store.component';
import { CarritoPageComponent } from './pages/carrito-page/carrito-page.component';
import { ProductoComponent } from './pages/producto/producto.component';
import {
  IonHeader,
  IonFooter,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonToolbar,
  IonContent,
  IonMenuButton,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonRouterLink,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonItem,
  IonBadge,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonCard,
  IonCardContent,
  IonImg,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonList,
  IonListHeader,
  IonChip,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonText,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { ItemProductComponent } from './components/item-product/item-product.component';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { StepperModule } from 'primeng/stepper';
import { ButtonCarritoComponent } from './components/button-carrito/button-carrito.component';
import { ItemCarritoComponent } from './components/item-carrito/item-carrito.component';
import { DatosPedidoComponent } from './components/datos-pedido/datos-pedido.component';
import { FechaPedidoComponent } from './components/fecha-pedido/fecha-pedido.component';
import { DireccionPedidoComponent } from './components/direccion-pedido/direccion-pedido.component';

@NgModule({
  declarations: [
    HomeStoreComponent,
    CarritoPageComponent,
    ProductoComponent,
    ItemProductComponent,
    FechaPedidoComponent
  ],
  imports: [
    CommonModule,
    StoreRoutingModule,
    IonHeader,
    IonFooter,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonToolbar,
    IonContent,
    IonMenuButton,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonRouterLink,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    FormsModule,
    IonItem,
    IonBadge,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
    IonFab,
    IonFabButton,
    IonList,
    IonListHeader,
    IonChip,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonText,
    GalleriaModule,
    ImageModule,
    ButtonCarritoComponent,
    StepperModule,
    ItemCarritoComponent,
    DatosPedidoComponent,
    DireccionPedidoComponent
  ],
})
export class StoreModule {}
