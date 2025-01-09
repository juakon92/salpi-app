import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Models } from 'src/app/models/models';
import { FirestoreService } from '../../../firebase/firestore.service';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private firestoreService: FirestoreService = inject(FirestoreService);
  private interactionService: InteractionService = inject(InteractionService);

  cargando: boolean;
  categories: Models.Tienda.Category[];
  categories$: Observable<Models.Tienda.Category[]>; // Observable para manejar categorías en tiempo real

  s: Subscription;

  enableOptions: boolean = false;
  categorySelected: Models.Tienda.Category;

  constructor(private router: Router) {
    this.loadCategories();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  ngOnDestroy() {
    this.s?.unsubscribe();
  }

  /**
   * Carga las categorías desde Firestore.
   * Se utiliza un observable para manejar actualizaciones en tiempo real.
   */
  async loadCategories() {
    const path = Models.Tienda.pathCategories;
    const extras: Models.Firestore.extrasQuery = {
      orderParam: 'date',
    };

    this.categories$ = this.firestoreService.getDocumentsQueryChanges(
      path,
      [[]],
      extras
    );
  }

  /**
   * Navega a la vista de creación de una nueva categoría.
   */
  newCategorie() {
    this.router.navigate(['/backoffice/ajustes/categoria-detalle']);
  }

  /**
   * Navega a la vista de edición de una categoría existente.
   * @param category - Categoría a editar
   */
  editCategorie(category: Models.Tienda.Category) {
    if (this.enableOptions) {
      this.enableOptions = false;
      return;
    }
    console.log('editCategorie -> ', category.id);
    this.router.navigate(['/backoffice/ajustes/categoria-detalle'], {
      queryParams: { id: category.id },
    });
  }

  /**
   * Elimina una categoría seleccionada después de confirmar la acción con el usuario.
   */
  async delete() {
    console.log('delete -> ');
    const response = await this.interactionService.presentAlert(
      'Importante',
      '¿Seguro que deseas eliminar esta categoria?',
      'Cancelar',
      'Eliminar'
    );
    if (response) {
      const path = Models.Tienda.pathCategories;
      await this.interactionService.showLoading('Eliminando...');
      await this.firestoreService.deleteDocument(
        `${path}/${this.categorySelected.id}`
      );
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Eliminado con éxito');
    }
    this.enableOptions = false;
    this.categorySelected = null;
  }

  /**
   * Muestra opciones para editar o eliminar una categoría seleccionada.
   * @param event - Evento de clic
   * @param category - Categoría seleccionada
   */
  showOptions(event: any, category: Models.Tienda.Category) {
    event.preventDefault();
    console.log('mousedown');
    this.enableOptions = true;
    this.categorySelected = category;
  }
}
