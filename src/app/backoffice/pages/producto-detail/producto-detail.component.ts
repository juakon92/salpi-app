import { Component, OnInit, inject } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/firebase/firestore.service';
import { StorageService } from 'src/app/firebase/storage.service';
import { Models } from 'src/app/models/models';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-producto-detail',
  templateUrl: './producto-detail.component.html',
  styleUrls: ['./producto-detail.component.scss'],
})
export class ProductoDetailComponent implements OnInit {
  private firestoreService: FirestoreService = inject(FirestoreService);
  private interactionService: InteractionService = inject(InteractionService);
  private storageService: StorageService = inject(StorageService);

  // Formulario reactivo para manejar los datos del producto
  product = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>(''),
    price: new FormControl<number>(null, [Validators.required]),
    enlacePermanente: new FormControl<string>('', [Validators.required]),
    images: new FormControl<string[]>([]),
    category: new FormControl<string>(null, [Validators.required]),
  });

  categories: QuerySnapshot<Models.Tienda.Category>; // Lista de categorías disponibles
  productExist: Models.Tienda.Product;
  images: File[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  /**
   * Guarda el producto en Firestore.
   * Si el producto ya existe, se actualiza; de lo contrario, se crea uno nuevo.
   */
  async save() {
    console.log('this.product.valid -> ', this.product.valid);
    if (this.product.valid) {
      try {
        await this.interactionService.showLoading('Guardando...');
        // subir imagenes
        await this.saveImages();
        const data = this.product.value;
        console.log('data -> ', data);
        const path = Models.Tienda.pathProducts;
        const category = this.categories.docs.find(
          (category) => category.data().id == data.category
        );
        data.category = category.data() as any;

        // crear regla en la base de datos
        if (this.productExist) {
          await this.firestoreService.updateDocument(
            `${path}/${this.productExist.id}`,
            data
          );
        } else {
          await this.firestoreService.createDocument(path, data);
        }
        this.interactionService.dismissLoading();
        this.interactionService.showToast('Guardado con éxito');
        // navegadar de vuelta a la página de categorias
        // this.router.navigate(['/backoffice/ajustes/productos'])
      } catch (error) {
        // capturar el error -> pero mostrar en la consola para saber que sucedió
        console.error(error);
        this.interactionService.dismissLoading();
        this.interactionService.presentAlert('Error', 'No se pudo guardar');
      }
    }
  }

  /**
   * Carga las categorías disponibles desde Firestore.
   */
  async loadCategories() {
    const path = Models.Tienda.pathCategories;
    this.categories = await this.firestoreService.getDocuments(path);
  }

  /**
   * Obtiene los parámetros de consulta para cargar un producto existente.
   */
  getQueryParams() {
    this.route.queryParams.subscribe((query: any) => {
      if (query.id) {
        this.loadProduct(query.id);
      }
    });
  }

  /**
   * Carga un producto específico desde Firestore.
   * @param id - ID del producto a cargar.
   */
  async loadProduct(id: string) {
    await this.interactionService.showLoading('Cargando...');
    const path = Models.Tienda.pathProducts;
    const response =
      await this.firestoreService.getDocument<Models.Tienda.Product>(
        `${path}/${id}`
      );
    this.interactionService.dismissLoading();
    if (response.exists()) {
      this.productExist = response.data();
      console.log(' this.productExist -> ', this.productExist);
      this.product.setValue({
        name: this.productExist.name,
        description: this.productExist.description,
        price: this.productExist.price,
        enlacePermanente: this.productExist.enlacePermanente
          ? this.productExist.enlacePermanente
          : '',
        category: this.productExist.category.id,
        images: this.productExist.images,
      });
    }
  }

  /**
   * Vista previa de las imágenes seleccionadas.
   * @param input - Elemento de entrada de tipo archivo.
   */
  async viewPreview(input: HTMLInputElement) {
    if (input.files.length) {
      for (let index = 0; index < input.files.length; index++) {
        const image = input.files.item(index);
        this.images.push(image);
      }
      console.log('viewPreview files -> ', this.images);
    }
  }

  /**
   * Elimina una imagen seleccionada de la lista.
   * @param index - Índice de la imagen a eliminar.
   */
  remove(index: number) {
    this.images.splice(index, 1);
  }

  /**
   * Guarda las imágenes seleccionadas en Firebase Storage.
   */
  async saveImages() {
    // agregar reglas en storage
    const path = Models.Tienda.folderProducts;
    const images = this.product.controls.images.value;
    for (let index = 0; index < this.images.length; index++) {
      const image = this.images[index];
      const response = await this.storageService.uploadFile(
        path,
        image.name,
        image
      );
      const url = await this.storageService.getDownloadURL(
        response.ref.fullPath
      );
      images.push(url);
    }
    this.product.controls.images.setValue(images);
    this.images = [];
  }

  /**
   * Elimina una imagen específica de Firebase Storage y del formulario.
   * @param url - URL de la imagen a eliminar.
   * @param index - Índice de la imagen en la lista.
   */
  async deleteImage(url: string, index: number) {
    const response = await this.interactionService.presentAlert(
      'Importante',
      '¿Seguro que desea eliminar esta imagen?',
      'Cancelar',
      'Eliminar'
    );
    if (response) {
      try {
        await this.interactionService.showLoading('Eliminando...');
        await this.storageService.deleteFile(url);
        // eliminar manualmente del formulario
        const images = this.product.controls.images.value;
        images.splice(index, 1);
        const updateDoc = { images };
        const path = Models.Tienda.pathProducts;
        await this.firestoreService.updateDocument(
          `${path}/${this.productExist.id}`,
          updateDoc
        );
        this.interactionService.dismissLoading();
      } catch (error) {
        console.error(error);
        this.interactionService.presentAlert('Error', 'No se pudo eliminar');
      }
    }
  }
}
