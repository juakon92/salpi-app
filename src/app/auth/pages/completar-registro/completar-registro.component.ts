import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/firebase/authentication.service';
import { Models } from 'src/app/models/models';
import { FirestoreService } from '../../../firebase/firestore.service';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { InteractionService } from 'src/app/services/interaction.service';
import { StorageService } from 'src/app/firebase/storage.service';

@Component({
  selector: 'app-completar-registro',
  templateUrl: './completar-registro.component.html',
  styleUrls: ['./completar-registro.component.scss'],
})
export class CompletarRegistroComponent  implements OnInit {
  authenticationService: AuthenticationService = inject(AuthenticationService);
  firestoreService:   FirestoreService = inject(  FirestoreService);
  storageService: StorageService = inject(StorageService);

  cargando: boolean = false;

  user: User;
  userProfile: Models.Auth.UserProfile;

  // Formulario para completar el registro del usuario
  datosFormCompleteRegistro = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    photo: [null, Validators.required],
    age: [null, Validators.required],
  });


  constructor(private fb: FormBuilder,
              private router: Router,
              private interactionService: InteractionService) {
    this.user =  this.authenticationService.auth.currentUser;

    // Inicializa el formulario con la información actual del usuario
    const photo: any = this.user.photoURL;
    this.datosFormCompleteRegistro.setValue({
    email: this.user.email,
    name: this.user.displayName,
    photo: photo,
    age: null
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Método para completar el registro del usuario y guardar los datos en Firestore
  async completarRegistro() {
    this.cargando = true;
    await this.interactionService.showLoading('Procensando...');
    console.log('datosFormCompleteRegistro -> ', this.datosFormCompleteRegistro);

    // Verifica si el formulario es válido antes de continuar
    if (this.datosFormCompleteRegistro.valid) {
      const data = this.datosFormCompleteRegistro.value;
      console.log('valid -> ', data);
      try {
        let photo: any = data.photo;

        // Si la foto no es una URL (es un archivo), la sube a Firebase Storage
        if (typeof data.photo != 'string') {
          const foto: File = data.photo;
          const folder = `PhotosPerfil/${this.user.uid}`;
          const snapshot = await this.storageService.uploadFile(folder, foto.name, foto);
          const url = await this.storageService.getDownloadURL(snapshot.ref.fullPath);
          console.log('url -> ', url);
          photo = snapshot.ref.fullPath; // Actualiza la variable photo con la URL de la foto en Storage
        }

        // Crea el objeto de perfil con el nombre y la foto del usuario
        let profile: Models.Auth.UpdateProfileI = {
          displayName: data.name,
          photoURL: photo
        };

        const user = this.authenticationService.getCurrentUser();
        await this.authenticationService.updateProfile(profile); // Actualiza el perfil del usuario en Firebase Authentication

        // Crea el objeto de usuario con toda la información para guardarlo en Firestore
        const datosUser: Models.Auth.UserProfile = {
          name: data.name,
          photo: photo,
          age: data.age,
          id: user.uid,
          email: data.email,
          roles: { client: true }
        }
        console.log('datosUser -> ', datosUser);

        // Guarda el perfil del usuario en la colección de usuarios de Firestore
        await this.firestoreService.createDocument(Models.Auth.PathUsers, datosUser, user.uid);
        console.log('completado registro con éxito');

        // Oculta el mensaje de carga y muestra una notificación de éxito
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Completado registro con éxito');
        this.router.navigate(['/user/perfil']);
      } catch (error) {
        console.log('registrarse error -> ', error);
        this.interactionService.presentAlert('Error', 'Ocurrió un error, intenta nuevamente');
      }
    }
    this.cargando = false; // Cambia el estado de carga a false al finalizar
  }

  // Método para mostrar una vista previa de la imagen seleccionada
  async viewPreview(input: HTMLInputElement) {
    if (input.files.length) {
      const files = input.files; // Obtiene los archivos seleccionados
      console.log('viewPreview files -> ', files);

      // Establece el archivo seleccionado como valor en el campo 'photo' del formulario
      const img: any = files.item(0);
      this.datosFormCompleteRegistro.controls.photo.setValue(img);
      console.log('this.datosFormCompleteRegistro.controls.photo -> ', this.datosFormCompleteRegistro.controls.photo.value);
    }
  }
}
