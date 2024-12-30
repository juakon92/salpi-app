import { Pipe, PipeTransform, inject } from '@angular/core';
import { StorageService } from 'src/app/firebase/storage.service';

@Pipe({
  name: 'reftourl'
})
export class ReftourlPipe implements PipeTransform {
  storageService: StorageService = inject(StorageService);

  // Transforma una referencia de archivo en una URL de descarga
  async transform(ref: string) {
    if(ref) {
      // Verifica si la referencia ya es una URL (comienza con 'http')
      if (ref.search('http') == 0) {
        return ref; // Devuelve la URL directamente si ya está en formato de URL
      }
      // Si no es una URL, asume que es una referencia en Firebase Storage y obtiene la URL de descarga
      const url = await this.storageService.getDownloadURL(ref);
      console.log('transform url -> ', url);
      return url; // Devuelve la URL de descarga generada
    }

    return '';
  }
}
