import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  GoogleMap,
  MapType,
  Marker,
  LatLngBounds,
} from '@capacitor/google-maps';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  MenuController,
  IonModal,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  ModalController,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { PlaceDetailComponent } from '../place-detail/place-detail.component';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { InteractionService } from '../../../services/interaction.service';
import { CarritoService } from '../../services/carrito.service';
import { ActivatedRoute, Router } from '@angular/router';

const apiKey = environment.firebaseConfig.apiKey;

@Component({
  selector: 'app-map-direccion-pedido',
  templateUrl: './map-direccion-pedido.component.html',
  styleUrls: ['./map-direccion-pedido.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButtons,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    CommonModule,
    IonFab,
    IonFabButton,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapDireccionPedidoComponent implements OnInit {
  map: GoogleMap; // Objeto para manejar el mapa de Google
  transparency: boolean = false;
  myLocation: Place; // Objeto para almacenar información sobre la ubicación del usuario

  private interactionService: InteractionService = inject(InteractionService);
  private carritoService: CarritoService = inject(CarritoService);

  readonly: boolean = false;

  constructor(
    private menuController: MenuController,
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ionViewDidEnter() {
    this.menuController.enable(false, 'main');
    this.transparency = true;
    this.initMap();
  }

  ionViewDidLeave() {
    this.menuController.enable(true, 'main');
    this.transparency = false;
    this.map?.destroy();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Inicializa el mapa de Google Maps con la configuración básica
  async initMap() {
    this.map = await GoogleMap.create({
      id: 'my-map',
      element: document.getElementById('map'),
      apiKey: apiKey,
      language: 'es',
      config: {
        center: {
          lat: 40.2379641,
          lng: -3.7536673,
        },
        zoom: 15,
      },
    });

    if (Capacitor.isNativePlatform()) {}
    this.getQueryParams();
  }

  // Obtiene parámetros de la URL para configurar el mapa
  getQueryParams() {
    const queryParams = this.route.snapshot.queryParams as any;
    console.log('queryParams -> ', queryParams);
    if (queryParams.readonly) {
      this.readonly = true;
    } else {
      this.setMyLocation();
    }
    if (queryParams.lat && queryParams.lng) {
      this.setMarkerMyPosition(+queryParams.lat, +queryParams.lng);
    }
  }

  setMarkerDemo() {
    const marker: Marker = {
      coordinate: {
        lat: 40.2379641,
        lng: -3.7536673,
      },
    };
    this.map.addMarker(marker);
  }

  setPlacesDemo() {
    places.forEach(async (place) => {
      const id = await this.map.addMarker(place.marker);
      place.id = id;
    });
  }

  addListeners() {
    this.map.setOnMapClickListener((res) => {
      console.log('MapClickListener -> ', res);
      const marker: Marker = {
        title: 'hola mundo',
        snippet: 'un texto más largo',
        draggable: true,
        coordinate: {
          lat: res.latitude,
          lng: res.longitude,
        },
      };
      this.map.addMarker(marker);
    });

    this.map.setOnInfoWindowClickListener((info) => {
      console.log('InfoWindowClickListener -> ', info);
    });

    this.map.setOnMarkerClickListener((marker) => {
      console.log('MarkerClickListener -> ', marker);
      const exist = places.find((place) => place.id == marker.markerId);
      if (exist) {
        this.showDetailMarker(exist);
      }
    });
  }

  // Configura la interacción para seleccionar la ubicación actual del usuario
  setMyLocation() {
    this.map.setOnMapClickListener(async (res) => {
      console.log('MapClickListener -> ', res);
      this.setMarkerMyPosition(res.latitude, res.longitude);
    });

    this.map.setOnMarkerDragEndListener((marker) => {
      console.log('MarkerDragEndListener -> ', marker);
      this.myLocation.marker.coordinate = {
        lat: marker.latitude,
        lng: marker.longitude,
      };
      this.showDetailMarker(this.myLocation);
      this.centerMarkerWithBounds(this.myLocation.marker);
    });

    this.map.setOnMarkerClickListener((marker) => {
      console.log('setMyLocation MarkerClickListener -> ', marker);
      if (marker.markerId == this.myLocation.id) {
        this.showDetailMarker(this.myLocation);
      }
    });

    this.map.setOnMyLocationClickListener((res) => {
      console.log('MyLocationClickListener -> ', res);
      this.setMarkerMyPosition(res.latitude, res.longitude);
    });

    this.map.setOnMyLocationButtonClickListener((res) => {
      console.log('MyLocationButtonClickListener -> ', res);
      this.getCurrentPosition();
    });
  }

  async showDetailMarker(place: Place) {
    const modal = await this.modalController.create({
      component: PlaceDetailComponent,
      componentProps: { place },
      initialBreakpoint: 0.25,
      breakpoints: [0, 0.25],
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      const place = data.place as Place;
      console.log('dismiss modal -> ', data);
      this.carritoService.setCoordenadasPedido(place.marker.coordinate);
      this.router.navigate(['/store/carrito']);
    }
  }

  async setMarkerMyPosition(latitude: number, longitude: number) {
    if (this.myLocation?.id) {
      this.map.removeMarker(this.myLocation.id);
    }
    this.myLocation = {
      name: 'Mi Ubicación',
      description: 'Enviar pedido a está ubicación',
      marker: {
        title: 'Mi Ubicación',
        snippet: 'Enviar pedido a está ubicación',
        draggable: this.readonly ? false : true,
        coordinate: {
          lat: latitude,
          lng: longitude,
        },
      },
    };
    const id = await this.map.addMarker(this.myLocation.marker);
    this.myLocation.id = id;
    this.centerMarkerWithBounds(this.myLocation.marker);
    if (!this.readonly) {
      this.showDetailMarker(this.myLocation);
    }
  }

  centerMarkerWithBounds(marker: Marker) {
    console.log('centerMarkerWithBounds');
    const des: number = 0.0005;
    const northeast = {
      lat: marker.coordinate.lat + des,
      lng: marker.coordinate.lng + des,
    };
    const southwest = {
      lat: marker.coordinate.lat - des,
      lng: marker.coordinate.lng - des,
    };
    let bounds = new LatLngBounds({
      southwest: southwest,
      center: marker.coordinate,
      northeast: northeast,
    });
    this.map.fitBounds(bounds, 100);
  }

  centerMarker(marker: Marker) {
    console.log('centerMarker');
    this.map.setCamera({
      coordinate: marker.coordinate,
      zoom: 16
    });
  }

  async getCurrentPosition() {
    await this.interactionService.showLoading('obteniendo tu ubicación...');
    const check = await Geolocation.checkPermissions();
    console.log('checkPermissions -> ', check);

    if (check.location != 'granted') {
      // solicitar permisos
      if (check.location == 'denied') {
        // no tenemos permisos
        this.interactionService.dismissLoading();
        return;
      }
      if (Capacitor.isNativePlatform()) {
        const response = await Geolocation.requestPermissions({
          permissions: ['coarseLocation'],
        });
        console.log('requestPermissions response -> ', response);
        if (response.location != 'granted') {
          this.interactionService.dismissLoading();
          return;
        }
      }
    }
    console.log('obteniendo posición');
    const location = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    console.log('Current position:', location.coords);
    this.interactionService.dismissLoading();
    this.setMarkerMyPosition(
      location.coords.latitude,
      location.coords.longitude
    );
  }
}

const places: Place[] = [
  {
    name: 'Lugar A',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui consequuntur eos eveniet sint sit necessitatibus perspiciatis quisquam earum! Officiis rerum pariatur incidunt, asperiores quasi veritatis fugiat ex saepe neque ab?',
    marker: {
      title: 'Lugar A',
      snippet:
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui consequuntur eos eveniet sint sit necessitatibus perspiciatis quisquam earum! Officiis rerum pariatur incidunt, asperiores quasi veritatis fugiat ex saepe neque ab?',
      iconUrl: 'assets/icons/moto.png',
      iconSize: {
        width: 35,
        height: 35,
      },
      coordinate: {
        lat: 40.2379641,
        lng: -3.7536673,
      },
    },
  },
  {
    name: 'Lugar B',
    description:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui consequuntur eos eveniet sint sit necessitatibus perspiciatis quisquam earum! Officiis rerum pariatur incidunt, asperiores quasi veritatis fugiat ex saepe neque ab?',
    marker: {
      title: 'Lugar B',
      snippet:
        'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui consequuntur eos eveniet sint sit necessitatibus perspiciatis quisquam earum! Officiis rerum pariatur incidunt, asperiores quasi veritatis fugiat ex saepe neque ab?',
      iconUrl: 'assets/icons/restaurante.png',
      iconSize: {
        width: 35,
        height: 35,
      },
      coordinate: {
        lat: 40.2379641,
        lng: -3.7536673,
      },
    },
  },
];

interface Place {
  id?: string;
  name: string;
  description: string;
  marker: Marker;
}
