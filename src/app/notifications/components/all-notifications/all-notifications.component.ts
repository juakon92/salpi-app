import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NotificationsService } from '../../notifications.service';
import { Models } from 'src/app/models/models';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-all-notifications',
  templateUrl: './all-notifications.component.html',
  styleUrls: ['./all-notifications.component.scss'],
})
export class AllNotificationsComponent implements OnInit, OnDestroy {
  notificationsService: NotificationsService = inject(NotificationsService);
  notifications: Models.Notifications.Notification[];
  private subscribersNotifications: Subscription;

  /**
   * Constructor del componente.
   * @param modalController - Controlador de modales de Ionic.
   */
  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscribersNotifications?.unsubscribe();
  }

  /**
   * Carga las notificaciones iniciales y escucha cambios en tiempo real.
   */
  loadNotifications() {
    this.notifications = this.notificationsService.getNotications();
    this.subscribersNotifications = this.notificationsService
      .getNoticationsChanges()
      .subscribe((res) => {
        this.notifications = res;
      });
  }

  /**
   * Cierra el modal actual.
   */
  dismiss() {
    this.modalController.dismiss();
  }

  /**
   * Solicita cargar más notificaciones.
   * Este método es útil para implementar scroll infinito.
   * @param ev - Evento de scroll infinito.
   */
  loadMore(ev: any) {
    console.log('loadmore');
    this.notificationsService.getMoreNotifications(ev);
  }
}
