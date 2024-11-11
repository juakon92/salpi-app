import { Injectable } from '@angular/core';
import { AlertController, IonicSafeString, 
  LoadingController, ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private loading: HTMLIonLoadingElement;

  constructor(private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertController: AlertController) { }

  // Muestra un indicador de carga con un mensaje opcional
  async showLoading(message: string = 'Cargando...') {
    this.loading = await this.loadingCtrl.create({
      message,
      backdropDismiss: true,
    });
    await this.loading.present(); // Muestra el indicador de carga
  }

  // Oculta el indicador de carga si está presente
  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss(); // Cierra el indicador de carga
    }
    this.loading = null;
  }

  // Muestra una notificación tipo toast con un mensaje, duración y posición opcionales
  async showToast(message: string, duration: number = 2000, position: "bottom" | "top" | "middle" = 'bottom') {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position,
      color: 'dark'
    });
    await toast.present();
  }

  // Muestra un cuadro de diálogo de alerta con botones de confirmación y cancelación opcionales
  async presentAlert(header: string, message: string, textCANCEL: string = null, textOK: string = 'OK'): Promise<boolean> {
    return new Promise(  async  (resolve) => { 
      let buttons = [];

      // Agrega un botón de cancelación si se especifica un texto
      if (textCANCEL) {
        buttons.push( {
          text: textCANCEL,
          role: 'cancel',
          handler: () => {
            resolve(false);
          }
        });
      }

      // Agrega el botón de confirmación
      buttons.push({
        text: textOK,
        handler: async () => {
          resolve(true);
        }
      });  

      // Crea y muestra la alerta con los botones especificados
      const alert = await this.alertController.create({
        header,
        message: (new IonicSafeString(message)).value,
        buttons,
        backdropDismiss: false
      });
      await alert.present();
    });
  }
}
