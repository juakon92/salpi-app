import { inject, Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { InteractionService } from './interaction.service';
import { LocalStorageService } from './local-storage.service';
import { User } from '@angular/fire/auth';
import { FirestoreService } from '../firebase/firestore.service';
import { Models } from '../models/models';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NotificationsPushService {
  private interactionService: InteractionService = inject(InteractionService);
  private localStorageService: LocalStorageService =
    inject(LocalStorageService);
  private firestoreService: FirestoreService = inject(FirestoreService);
  private user: User;
  private enable: boolean = false;

  constructor(private route: Router) {}

  /**
   * Inicializa el servicio de notificaciones push.
   * Solicita permisos para notificaciones y registra el dispositivo si está en una plataforma nativa.
   * @param user - Usuario autenticado actualmente.
   */
  init(user: User) {
    this.user = user;
    if (Capacitor.isNativePlatform()) {
      console.log('Initializing NotificationsPushService');

      // Solicita permisos para notificaciones
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        } else {
          this.interactionService.presentAlert(
            'Error',
            'Debes habilitar las notificaciones'
          );
        }
      });
      this.addListener();
    }
  }

  /**
   * Agrega listeners para manejar eventos relacionados con notificaciones push.
   */
  private addListener() {
    PushNotifications.addListener('registration', (token: Token) => {
      this.saveToken(token.value);
      this.enable = true;
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      this.interactionService.presentAlert('Error', `Registro fallido`);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {}
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        if (notification?.notification?.data?.enlace) {
          this.route.navigateByUrl(notification.notification.data.enlace);
        }
      }
    );
  }

  /**
   * Guarda el token de notificación push en Firestore y en el almacenamiento local.
   * @param token - Token generado por APNS/FCM.
   */
  private async saveToken(token: string) {
    const path = 'Token';
    console.log('saveToken -> ', token);
    const data = await this.localStorageService.getData(path);
    console.log('get token saved -> ', data);
    if (data) {
      if (data.token == token) {
        console.log('el token es el mismo');
        return;
      }
    }
    const updateDoc = {
      token,
    };
    await this.firestoreService.updateDocument(
      `${Models.Auth.PathUsers}/${this.user.uid}`,
      updateDoc
    );
    console.log('saved token éxito');
    await this.localStorageService.setData(path, updateDoc);
  }

  /**
   * Elimina el token de notificación push del almacenamiento local y de Firestore.
   */
  async deleteToken() {
    console.log('deleteToken');
    try {
      if (this.enable) {
        // del local storage
        const path = 'Token';
        await this.localStorageService.deleteData(path);
        // de firestore
        const updateDoc: any = {
          token: null,
        };
        await this.firestoreService.updateDocument(
          `${Models.Auth.PathUsers}/${this.user.uid}`,
          updateDoc
        );
      }
    } catch (error) {
      console.log('no se pudo borrar el token de notificaciones del usuario');
      // no se pudo borrar el token de notificaciones del usuario
    }
  }
}
