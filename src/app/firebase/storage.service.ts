import { Injectable, inject } from '@angular/core';
import { Storage, uploadString, getDownloadURL, ref, uploadBytes,
          uploadBytesResumable, getBlob, listAll,
          list, getMetadata, deleteObject} from '@angular/fire/storage';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage = inject(Storage);

  constructor() {}

  // Método para subir una cadena de texto como archivo a Firebase Storage
  uploadString(folder: string, name: string, text: string) {
    const storageRef = ref(this.storage, `${folder}/${name}`); // Crea una referencia en Storage
    uploadString(storageRef, text).then((snapshot) => {
      console.log('Uploaded string! -> ', snapshot);
    });
  }

  // Método para subir un archivo o Blob a Firebase Storage
  async uploadFile(folder: string, name: string, file: File | Blob) {
    const storageRef = ref(this.storage, `${folder}/${name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return snapshot;
  }

  // Obtiene la URL de descarga de un archivo en Firebase Storage
  getDownloadURL(path: string) {
    const storageRef = ref(this.storage, path);
    return getDownloadURL(storageRef);
  }

  // Subida de archivo con progreso
  uploadFileProgress(folder: string, name: string, file: File | Blob) {
    const storageRef = ref(this.storage, `${folder}/${name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Sujeto para observar el progreso de subida
    const uploadTask$ = new Subject<ProgressUploadFile>();

    // Monitorea el progreso de la tarea de subida
    uploadTask.on('state_changed',
      (snapshot) => {
        // Observar eventos de cambio de estado como progreso, pausa y reanudación
        // Obtener el progreso de la tarea, incluido el número de bytes cargados y el número total de bytes
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
        const event: ProgressUploadFile = {
          type: snapshot.state,
          progress
        }
        uploadTask$.next(event);
      },
      (error) => {
        const event: ProgressUploadFile = {
          type: 'error',
          error: error.message
        }
        uploadTask$.next(event);
      },
      async () => {
        // Al completar la subida, obtiene la URL de descarga
        const url = await this.getDownloadURL(storageRef.fullPath);
        const event: ProgressUploadFile = {
          type: 'complete',
          url,
          ref: storageRef.fullPath
        }
        uploadTask$.next(event);
      }
    );
    return uploadTask$.asObservable();
  }

  // Lista todos los archivos en una carpeta específica en Storage
  listAll(path: string) {
    const storageRef = ref(this.storage, path);
    return listAll(storageRef);
  }

  // Lista archivos con un número máximo de resultados y paginación opcional
  list(path: string, maxResults: number = 100, pageToken: any = null) {
    const storageRef = ref(this.storage, path);
    const opts: any = {maxResults};
    if (pageToken) {
      opts.pageToken = pageToken; // Agrega el token de página para la paginación
    }
    return list(storageRef, opts); // Devuelve la lista de archivos paginada
  }

  // Convierte un archivo en una URL local
  fileToUlr(file: File) {
    return URL.createObjectURL(file);
  }

  // Convierte un archivo en Base64
  fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
     });
  }

  // Obtiene los metadatos de un archivo en Storage
  getMetadata(path: string) {
    const storageRef = ref(this.storage, path);
    return getMetadata(storageRef);
  }

  // Convierte una URL en un Blob (útil para descarga o manipulación)
  async urlToBlob(url: string) {
    const response = await fetch(url);
    return response.blob();
  }

  // Descarga un archivo desde Firebase Storage y lo guarda localmente
  async downloadFile(path: string) {
    console.log('saveFile');
    const storageRef = ref(this.storage, path);
    const blob = await getBlob(storageRef);
    console.log('blob -> ', blob);

    // creando un elemento <a></a>
    const urlLocal = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlLocal;
    link.download = storageRef.name;
    link.click();
    link.remove();
  }

  // Elimina un archivo de Firebase Storage
  deleteFile(path: string) {
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }
}

// Interfaz para el seguimiento del progreso de subida de archivos
interface ProgressUploadFile {
  type: string;
  url?: string;
  ref?: string;
  progress?: number;
  error?: string;
}
