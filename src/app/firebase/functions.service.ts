import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable,
  connectFunctionsEmulator } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  private functions: Functions = inject(Functions);

  constructor() {}

  call<request, response>(name: string, data: request = null) {
    const ws = httpsCallable<request, response>(this.functions, name);
    return ws(data);
  }
}
