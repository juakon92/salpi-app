import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { Models } from 'src/app/models/models';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent  implements OnInit {
  private firestoreService = inject(FirestoreService); // Inyecta el servicio FirestoreService para interactuar con la base de datos de Firebase

  roles: Models.Auth.Role[] = ['admin', 'client', 'dealer'];
  rolSelected: Models.Auth.Role = 'admin';
  users: Models.Auth.UserProfile[]; // Array para almacenar los perfiles de usuario obtenidos de Firestore
  cargando: boolean = true;
  enableMore: boolean = false;

  enableBuscarPorEmail: boolean = false;

  // Formulario reactivo para validar la entrada de correo electrónico
  formEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  rolSegment: Models.Auth.Role = 'admin';
  numItems: number = 4;

  constructor(private fb: FormBuilder) {
    this.getMoreUsers(); // Llama a getMoreUsers para cargar los primeros usuarios al instanciar el componente
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Método para obtener más usuarios basados en el rol seleccionado
  async getMoreUsers(rol: Models.Auth.Role = this.rolSelected) {
    console.log(' getMoreUsers -> ', this.rolSegment);

    // Si el rol seleccionado cambia, reinicia la lista de usuarios y estado de carga
    if (this.rolSelected != rol) {
      this.users = null;
      this.cargando = true;
      this.enableMore = true;
    }

    this.rolSelected = rol;
    console.log('getMoreUsers');
    const path = Models.Auth.PathUsers;
    const numItems = this.numItems;
    let q: Models.Firestore.whereQuery[];
    q = [ [`roles.${rol}`, '==', true] ]; // Define la consulta para obtener usuarios con el rol seleccionado
    const extras: Models.Firestore.extrasQuery = {
      orderParam: 'date',
      directionSort: 'desc',
      limit: numItems,
    }

    // Si ya existen usuarios cargados, configuramos la paginación
    if (this.users) {
      const last = this.users[ this.users.length - 1 ];
      const snapDoc = await this.firestoreService.getDocument(`${path}/${last.id}`);
      extras.startAfter = snapDoc;
    }

    const res = await this.firestoreService.getDocumentsQuery<Models.Auth.UserProfile>(path, q, extras); // Realiza la consulta a Firestore para obtener los usuarios
    this.cargando = false;
    console.log('res -> ', res);
    if (res.size) {
      if (res.size < numItems) {
        this.enableMore = false;
      }
      if (!this.users) {
        this.users = [];
      }
      res.forEach( item => {
        this.users.push(item.data());
      });
    } else {
      this.enableMore = false;
    }
  }

  // Método para manejar la carga adicional de usuarios en el componente al hacer scroll
  async loadData(ev: any) {
    console.log('loadData');
    await this.getMoreUsers();
    ev.target.complete();
  }

  // Método para buscar usuarios por correo electrónico
  async onSearchChange(ev: any) {
    this.enableBuscarPorEmail = true;
    console.log('onSearchChange -> ', ev);
    const email = ev.detail.value;
    this.users = null;
    this.cargando = true;
    this.enableMore = false;
    const path = Models.Auth.PathUsers;
    let q: Models.Firestore.whereQuery[];
    q = [ [`email`, '==', email] ];
    const response = await this.firestoreService.getDocumentsQuery<Models.Auth.UserProfile>(path, q);
    this.cargando = false;
    if (!response.empty) {
      response.forEach((item) => {
        this.users = [];
        this.users.push(item.data());
      });
    }
  }

  // Método para cancelar la búsqueda por correo electrónico y volver a la lista inicial de usuarios
  cancelSearch() {
    setTimeout(() => {
      this.enableBuscarPorEmail = false;
      this.getMoreUsers(); // Recarga la lista inicial de usuarios
    }, 200);
  }
}
