import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  /**
   * Inicializa el almacenamiento local si aún no está creado.
   * Este método asegura que la instancia de almacenamiento esté lista antes de usarla.
   */
  async init() {
    if (!this._storage) {
      const storage = await this.storage.create();
      this._storage = storage;
    }
  }

  /**
   * Obtiene un valor almacenado en el almacenamiento local.
   * @param path - La clave del dato que se desea obtener.
   * @returns El valor almacenado o `null` si no existe.
   */
  async getData(path: string) {
    await this.init();
    const data = await this._storage.get(path);
    return data ? data : null;
  }

  /**
   * Almacena un valor en el almacenamiento local.
   * @param path - La clave donde se almacenará el dato.
   * @param data - El valor que se desea almacenar.
   * @returns Una promesa que indica que la operación ha terminado.
   */
  async setData(path: string, data: any) {
    return this.storage.set(path, data);
  }

  /**
   * Elimina un dato del almacenamiento local.
   * @param path - La clave del dato que se desea eliminar.
   * @returns Una promesa que indica que la operación ha terminado.
   */
  async deleteData(path: string) {
    await this.init();
    return this.storage.remove(path);
  }
}
