import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { AuthenticationService } from '../../../firebase/authentication.service';
import { Models } from 'src/app/models/models';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/firebase/storage.service';
import { IonModal } from '@ionic/angular/standalone';
import { InteractionService } from '../../../services/interaction.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  authenticationService: AuthenticationService = inject(AuthenticationService);
  firestoreService: FirestoreService = inject(FirestoreService);
  userService: UserService = inject(UserService);
  storageService: StorageService = inject(StorageService);

  user: User;

  userProfile: Models.Auth.UserProfile;
  newName: string = '';
  newPhoto: string = '';
  iniciando: boolean = true;

  // Formulario para cambiar el correo electrónico
  formNewEmail = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Validador personalizado para comparar las contraseñas
  isSame = (input: FormControl) => {
    console.log('input -> ', input.value);
    if (this.formCambiarPassword?.value?.newPassword != input?.value) {
      return { notSame: true };
    }
    return {};
  };

  // Formulario para cambiar la contraseña
  formCambiarPassword = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    repetPassword: ['', [Validators.required, this.isSame]],
  });

  newImage: File;

  @ViewChild('modalEditInfo') modalEditInfo: IonModal; // Referencia al modal de edición de perfil
  titleModal: string;
  opcModal: 'email' | 'photo' | 'name' | 'password'; // Opciones para abrir distintas secciones del modal

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private interactionService: InteractionService
  ) {
    this.iniciando = true;
    this.user = this.authenticationService.getCurrentUser();
    this.getDatosProfile(this.user.uid);
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  // Método que se ejecuta al cargar la vista del componente
  ionViewDidEnter() {
    const user = this.authenticationService.getCurrentUser();
    console.log('ionViewDidEnter login -> ', user);
    if (user) {
      this.user = user;
    }
  }

  // Cierra la sesión del usuario
  salir() {
    this.authenticationService.logout();
  }

  // Método para actualizar el perfil del usuario
  async actualizarPerfil() {
    let data: Models.Auth.UpdateProfileI = {};
    if (this.newName) {
      data.displayName = this.newName;
    }
    if (data.displayName) {
      this.modalEditInfo.isOpen = false;
      await this.interactionService.showLoading('Actualizando...');
      await this.authenticationService.updateProfile(data);

      // Actualiza el perfil del usuario en Firestore
      const user = this.authenticationService.getCurrentUser();
      const updateData: any = {
        name: user.displayName,
        photo: user.photoURL,
      };
      await this.firestoreService.updateDocument(
        `${Models.Auth.PathUsers}/${user.uid}`,
        updateData
      );
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Actualizado con éxito');
      this.user = user;
      this.newName = null;
      this.newPhoto = null;
    }
  }

  // Obtiene el perfil del usuario desde Firestore y actualiza el estado de carga
  async getDatosProfile(uid: string) {
    console.log('getDatosProfile -> ', uid);
    this.firestoreService
      .getDocumentChanges<Models.Auth.UserProfile>(
        `${Models.Auth.PathUsers}/${uid}`
      )
      .subscribe((res) => {
        if (res) {
          this.userProfile = res;
          console.log('this.userProfile -> ', this.userProfile);
        }
        this.iniciando = false;
      });
  }

  // Actualiza la edad del usuario en Firestore
  async actualizarEdad() {
    const user = this.authenticationService.getCurrentUser();
    const updateDoc: any = {
      age: this.userProfile.age,
    };
    await this.interactionService.showLoading('Actualizando...');
    await this.firestoreService.updateDocument(
      `${Models.Auth.PathUsers}/${user.uid}`,
      updateDoc
    );
    console.log('actualizado con éxito');
    await this.interactionService.dismissLoading();
    this.interactionService.showToast('Actualizado con éxito');
  }

  // Actualiza el correo electrónico del usuario, enviando un enlace de verificación
  async actualizarEmail() {
    if (this.formNewEmail.valid) {
      const data = this.formNewEmail.value;
      console.log('valid -> ', data);
      try {
        await this.interactionService.showLoading(
          'Enviando enlace de verificación...'
        );
        await this.authenticationService.verifyBeforeUpdateEmail(data.email);
        this.interactionService.dismissLoading();
        await this.interactionService.presentAlert(
          'Importante',
          `Te hemos enviado un correo a <strong>${data.email}</strong> para que puedas verificar tu nuevo correo,
          verifícalo e inicia sesión con el nuevo correo, en caso contrario inicia sesión con tu correo de siempre`
        );
        await this.authenticationService.logout(false);
        this.modalEditInfo.isOpen = false;
        setTimeout(() => {
          this.router.navigate(['/user/login']);
        }, 200);
      } catch (error) {
        console.log('error al actualizar el correo -> ', error);
        this.interactionService.dismissLoading();
        this.modalEditInfo.isOpen = false;
        const response = await this.interactionService.presentAlert(
          'Error',
          `Para realizar esta acción debes haber realizado un inicio de sesión reciente.
        ¿Deseas cerrar sesión y volver a ingresar para realizar esta acción?`,
          'Cancelar'
        );
        if (response) {
          await this.authenticationService.logout(false);
          setTimeout(() => {
            this.router.navigate(['/user/login'], { replaceUrl: true });
          }, 200);
        }
      }
    }
  }

  // Enviar correo de verificación de cuenta
  async enviarCorreo() {
    this.interactionService.showLoading('Enviando correo...');
    await this.authenticationService.sendEmailVerification();
    this.interactionService.dismissLoading();
    await this.interactionService.presentAlert(
      'Importante',
      `Te hemos enviado un enlace de verificación a tu correo`
    );
    console.log('correo enviado -> comprueba tu correo');
  }

  // Cambia la contraseña del usuario, verificando que ambas contraseñas coincidan
  async cambiarPassword() {
    console.log('this.formCambiarPassword -> ', this.formCambiarPassword);
    if (this.formCambiarPassword.valid) {
      const data = this.formCambiarPassword.value;
      console.log('valid -> ', data);
      try {
        await this.interactionService.showLoading('Validando...');
        await this.authenticationService.updatePassword(data.newPassword);
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Contraseña establecida con éxito');
        this.modalEditInfo.isOpen = false;
        console.log('contraseña actualizada con éxito');
      } catch (error) {
        console.log('error al cambiar la contraseña -> ', error);
        this.interactionService.dismissLoading();
        const responseAlert = await this.interactionService.presentAlert(
          'Error',
          `Para establacer una nueva contraseña debes cerrar tu sesión e ingresar nuevamente, <strong>¿Deseas cerrar tu sesión?</strong>`,
          'Cancelar'
        );
        if (responseAlert) {
          await this.authenticationService.logout(false);
          setTimeout(() => {
            this.router.navigate(['/user/login']);
          }, 200);
        }
      }
    }
  }

  // Elimina la cuenta del usuario después de confirmar y verificar permisos
  async eliminarCuenta() {
    // Preguntar al usuario si está seguro de eliminar la cuenta
    const responseAlert = await this.interactionService.presentAlert(
      'Importante',
      `Seguro que deseas eliminar tu cuenta, <strong>esta acción no se puede revertir</strong>`,
      'Cancelar'
    );
    if (responseAlert) {
      try {
        await this.interactionService.showLoading('Eliminando...');
        const user = this.authenticationService.getCurrentUser();
        // si falla al actualizar la contraseña entonces no podrá eliminar la cuenta
        // debe tener un inicio de sesión reciente
        await this.authenticationService.updatePassword('xxxxxx');
        // primero eliminamos el documento porque en ese momento tenemos permisos
        await this.firestoreService.deleteDocument(
          `${Models.Auth.PathUsers}/${user.uid}`
        );
        // luego si eliminamos la cuenta
        await this.authenticationService.deleteUser();
        console.log('cuenta eliminada con éxito');
        await this.interactionService.dismissLoading();
        await this.authenticationService.logout();
        this.router.navigate(['/user/login']);
      } catch (error) {
        console.log('error al eliminar la cuenta -> ', error);
        const responseAlert = await this.interactionService.presentAlert(
          'Error',
          `Para eliminar tu cuenta debes cerrar tu sesión e ingresar nuevamente, <strong>¿Deseas cerrar tu sesión?</strong>`,
          'Cancelar'
        );
        if (responseAlert) {
          await this.authenticationService.logout(false);
          setTimeout(() => {
            this.router.navigate(['/user/login'], { replaceUrl: true });
          }, 200);
        }
      }
    }
  }

  // Descarga la foto de perfil del usuario
  async downloadProfilePicture() {
    await this.storageService.downloadFile(this.userProfile.photo);
    console.log('imagen descargada con éxito');
  }

  // Edita la foto de perfil del usuario y la sube a Firebase Storage
  async editarProfilePicture() {
    console.log('subiendo...');
    await this.interactionService.showLoading('Subiendo...');
    const folder = `PhotosPerfil/${this.user.uid}`;
    const name = this.newImage.name;
    const snapshot = await this.storageService.uploadFile(
      folder,
      name,
      this.newImage
    );
    await this.authenticationService.updateProfile({
      photoURL: snapshot.ref.fullPath,
    });
    const updateDoc: any = {
      photo: snapshot.ref.fullPath,
    };
    await this.firestoreService.updateDocument(
      `${Models.Auth.PathUsers}/${this.user.uid}`,
      updateDoc
    );
    this.user = this.authenticationService.getCurrentUser();
    this.interactionService.dismissLoading();
    this.interactionService.showToast('Actualizado con éxito');
    this.newImage = null;
    this.modalEditInfo.isOpen = false;
  }

  // Vista previa de la imagen seleccionada
  async viewPreview(input: HTMLInputElement) {
    if (input.files.length) {
      const files = input.files;
      this.newImage = files.item(0);
    }
  }

  // Abre el modal de edición de perfil en la sección indicada
  selectOpcModal(opc: 'email' | 'photo' | 'name' | 'password') {
    this.opcModal = opc;
    if (this.opcModal == 'email') {
      this.titleModal = 'Cambiar correo';
    }
    if (this.opcModal == 'photo') {
      this.titleModal = 'Cambiar foto';
    }
    if (this.opcModal == 'name') {
      this.titleModal = 'Cambiar nombre';
      this.newName = this.user.displayName;
    }
    if (this.opcModal == 'password') {
      this.titleModal = 'Cambiar contraseña';
    }
    this.modalEditInfo.isOpen = true;
  }
}
