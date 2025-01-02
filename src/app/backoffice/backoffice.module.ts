import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonRouterLink,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BackofficeRoutingModule } from './backoffice-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AjustesComponent } from './pages/ajustes/ajustes.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { CategoriaDetailComponent } from './pages/categoria-detail/categoria-detail.component';
import { ProductoDetailComponent } from './pages/producto-detail/producto-detail.component';
import { SharedModule } from '../shared/shared.module';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { CalendarModule } from 'primeng/calendar';
import { PedidoDetailComponent } from './components/pedido-detail/pedido-detail.component';
import { DatefirePipe } from '../shared/pipes/datefire.pipe';

@NgModule({
  declarations: [
    AjustesComponent,
    CategoriasComponent,
    ProductosComponent,
    CategoriaDetailComponent,
    ProductoDetailComponent,
    PedidosComponent,
    PedidoDetailComponent
  ],
  imports: [
    CommonModule,
    BackofficeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonBadge,
    IonFab,
    IonFabButton,
    IonSpinner,
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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonText,
    IonList,
    IonListHeader,
    SharedModule,
    CalendarModule,
    DatefirePipe,
    IonThumbnail,
    IonAccordion,
    IonAccordionGroup,
  ],
})
export class BackofficeModule {}
