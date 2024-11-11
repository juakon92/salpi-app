import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filetourl'
})
export class FiletourlPipe implements PipeTransform {
  // Transforma un archivo o una cadena de texto en una URL válida para visualización
  transform(file: File | any): string {
    // Verifica si el valor proporcionado ya es una URL (cadena de texto que comienza con 'http')
    if (typeof file == 'string') {
      if (file.search('http') == 0) {
        return file; // Devuelve la URL directamente si ya está en formato de URL
      }
    }
    return URL.createObjectURL(file); // Si el valor no es una URL, se asume que es un archivo y se crea una URL local para previsualización
  }
}
