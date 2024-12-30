import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable,connectFunctionsEmulator } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  private functions: Functions = inject(Functions); // Inyecta el servicio de AngularFire Functions para interactuar con las Cloud Functions de Firebase.

  constructor() {
    connectFunctionsEmulator(this.functions, '127.0.0.1', 5001);
  }

  call<request, response>(name: string, data: request = null) {
    const ws = httpsCallable<request, response>(this.functions, name); // `httpsCallable` crea una función callable que se puede ejecutar desde el cliente.
    return ws(data); // Llama a la función con los datos proporcionados y retorna el resultado.
  }
}
