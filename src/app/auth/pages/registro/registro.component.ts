import { InteractionService } from './../../../services/interaction.service';
import { Component, OnInit, inject} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/firebase/authentication.service';
import { Models } from 'src/app/models/models';
import { FirestoreService } from '../../../firebase/firestore.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/firebase/storage.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent  implements OnInit {
  // Inyecta los servicios necesarios para autenticación, Firestore, almacenamiento y manejo de usuario
  authenticationService: AuthenticationService = inject(AuthenticationService);
  firestoreService: FirestoreService = inject(  FirestoreService);
  storageService: StorageService = inject(StorageService);
  userService: UserService = inject(UserService);

  // Define el formulario de registro con validaciones para cada campo
  datosForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    name: ['', Validators.required],
    photo: [null, Validators.required],
    age: [null, Validators.required],
  });

  cargando: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private interactionService: InteractionService) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  async ngOnInit() {}

  // Método para registrar un nuevo usuario
  async registrarse() {
    this.cargando = true;
    console.log('datosForm -> ', this.datosForm);

    // Verifica si el formulario es válido antes de continuar
    if (this.datosForm.valid) {
      const data = this.datosForm.value;
      console.log('valid -> ', data);
      try {
        await this.interactionService.showLoading('Registrando...');
        const foto: File = data.photo;
        this.userService.validateHasProfile = false;
        const res =  await this.authenticationService.createUser(data.email, data.password); // Crea un nuevo usuario en Firebase Authentication
        const folder = `PhotosPerfil/${res.user.uid}`;

        // Sube la foto a Firebase Storage y obtiene la referencia de la foto subida
        const snapshot = await this.storageService.uploadFile(folder, foto.name, foto);
        const url = await this.storageService.getDownloadURL(snapshot.ref.fullPath);
        console.log('url -> ', url);

        // Crea un objeto perfil para actualizar el perfil de usuario en Firebase Authentication
        let profile: Models.Auth.UpdateProfileI = {
          displayName: data.name,
          photoURL: snapshot.ref.fullPath
        };

        await this.authenticationService.updateProfile(profile);

        // Define el objeto usuario con la información completa para guardarlo en Firestore
        const datosUser: Models.Auth.UserProfile = {
          name: data.name,
          photo: snapshot.ref.fullPath,
          age: data.age,
          id: res.user.uid,
          email: data.email,
          roles: { client: true}
        }
        console.log('datosUser -> ', datosUser);
        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, res.user.uid);
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Usuario creado con éxito');
        console.log('usuario creado con éxito');
        this.router.navigate(['/user/perfil']);
      } catch (error) {
        console.log('registrarse error -> ', error);
        this.interactionService.presentAlert('Error', 'Ocurrió un error, intenta nuevamente');
      }
    }
    this.cargando = false;
  }

  // Método para mostrar una vista previa de la imagen seleccionada
  async viewPreview(input: HTMLInputElement) {
    if (input.files.length) {
      const files = input.files;
      console.log('viewPreview files -> ', files);

      // Establece el archivo seleccionado como valor en el campo 'photo' del formulario
      const img: any = files.item(0);
      this.datosForm.controls.photo.setValue(img);
      console.log('this.datosForm.controls.photo -> ', this.datosForm.controls.photo.value);
    }
  }

  // Método para descargar el archivo desde Firebase Storage
  download(path: string) {
    this.storageService.downloadFile(path); // Llama al servicio de almacenamiento para descargar el archivo
  }
}
