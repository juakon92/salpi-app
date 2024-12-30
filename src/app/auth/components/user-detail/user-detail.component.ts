import { Component, Input, OnInit, inject } from '@angular/core';
import { Models } from 'src/app/models/models';
import { FunctionsService } from 'src/app/firebase/functions.service';
import { InteractionService } from '../../../services/interaction.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent  implements OnInit {
  @Input() user: Models.Auth.UserProfile; // Entrada que recibe un objeto 'user' desde el componente padre, que representa el perfil de usuario
  private functionsService: FunctionsService = inject(FunctionsService); // Injecta FunctionsService para llamar a las funciones de firebase
  roles: Models.Auth.Role[] = ['admin', 'client', 'dealer'];
  rolesSelect: Models.Auth.Role[] = [];

  constructor(private interactionService: InteractionService) { }

  ngOnInit() {
    this.initRoles()
  }

  // Inicializa los roles del usuario actual llenando el array 'rolesSelect' con los roles activos
  initRoles() {
    for (const key in this.user.roles) {
      const rol: any = key;
      this.rolesSelect.push(rol);
    }
    // Recorremos las claves del objeto roles del usuario y agregamos al array rolesSelect
    console.log('this.rolesSelect -> ', this.rolesSelect);
  }

  // Método para cambiar el rol del usuario
  async changeRole(ev: any) {
    console.log('changeRole -> ', ev.detail.value);
    await this.interactionService.showLoading('Actualizando...');
    const roles: any = {};
    this.rolesSelect.forEach( rol => {
      roles[rol] = true;
    });

    // Objeto que representa los datos de actualización que se enviarán a la base de datos
    const updateDoc = {
      roles
    }
    console.log('updateDoc roles -> ', updateDoc);

    // Objeto de solicitud que incluye los roles actualizados y el ID del usuario
    const request: Models.Functions.RequestSetRole = {
      roles,
      uid: this.user.id
    }
    try {
      const response = await this.functionsService.call<any, any>('setRole', request) // Llama a la función 'setRole' de Firebase para actualizar los roles del usuario
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Rol actualizado con éxito');
      console.log('response -> ', response);
    } catch (error) {
      this.interactionService.dismissLoading();
      this.interactionService.presentAlert('Error', 'No se pudo actualizar el rol del usuario');
      console.log('changeRole error -> ', error);
    }
  }
}
