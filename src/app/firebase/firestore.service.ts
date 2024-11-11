import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Models } from '../models/models';
import { DocumentSnapshot, Firestore, QuerySnapshot, and, average, collection,
  collectionData, collectionGroup, deleteDoc, doc, docData, getAggregateFromServer,
  getCountFromServer, getDoc, getDocs, limit, or, orderBy, query, serverTimestamp,
  setDoc, startAfter, sum, updateDoc, where} from '@angular/fire/firestore';
import { WhereFilterOp } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);
  constructor() {}

//---| CREATE |---//
  async createDocument<tipo>(path: string, data: tipo, id: string = null) {
    let refDoc;
    if (id) {
      refDoc = doc(this.firestore, `${path}/${id}`); // Si se proporciona un ID, usa ese ID para el documento
    } else {
      const refCollection = collection(this.firestore, path);
      refDoc = doc(refCollection);
    }
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.date = serverTimestamp();
    await setDoc(refDoc, dataDoc);
    return dataDoc.id;
  }
//----------------//

//---| UPDATE |---//
  async updateDocument(path: string, data: any) {
    const refDoc = doc(this.firestore, path);
    data.updateAt = serverTimestamp(); // Agrega una marca de tiempo de actualización
    return await updateDoc(refDoc, data);
  }
//----------------//

//---| DELETE |---//
  async deleteDocument(path: string) {
    const refDoc = doc(this.firestore, path);
    return await deleteDoc(refDoc);
  }
//----------------//

//---| READ |---//
  async getDocument<tipo>(path: string) {
    const refDocument = doc(this.firestore, path);
    return await getDoc(refDocument) as DocumentSnapshot<tipo>; // Obtiene el documento y lo devuelve como DocumentSnapshot
  }

  // Método para obtener todos los documentos de una colección, o un grupo de colecciones
  async getDocuments<tipo>(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this.firestore, path);
      return await getDocs(refCollection) as QuerySnapshot<tipo>;
    } else {
      const refCollectionGroup = collectionGroup(this.firestore, path);
      return await getDocs(refCollectionGroup) as QuerySnapshot<tipo>;
    }
  }

  // Método para observar los cambios en un documento en tiempo real
  getDocumentChanges<tipo>(path: string) {
    const refDocument = doc(this.firestore, path);
    return docData(refDocument) as Observable<tipo> ;
  }

  // Método para observar cambios en una colección o grupo de colecciones en tiempo real
  getDocumentsChanges<tipo>(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this.firestore, path);
      return collectionData(refCollection) as Observable<tipo[]>;
    } else {
      const refCollectionGroup = collectionGroup(this.firestore, path);
      return collectionData(refCollectionGroup) as Observable<tipo[]>;
    }
  }
//----------------//

//---| QUERY |---//

  // Método para obtener documentos basados en una consulta
  async getDocumentsQuery<tipo>(
    path: string, querys: Models.Firestore.whereQuery[],
    extras: Models.Firestore.extrasQuery = Models.Firestore.defaultExtrasQuery) {
      let q = this.getQuery(path, querys, extras); // Configura la consulta
      return await getDocs(q) as QuerySnapshot<tipo>;
  }

  // Método para observar cambios en documentos que cumplan una consulta
  getDocumentsQueryChanges<tipo>(
    path: string, querys: Models.Firestore.whereQuery[],
    extras: Models.Firestore.extrasQuery = Models.Firestore.defaultExtrasQuery) {
      let q = this.getQuery(path, querys, extras); // Configura la consulta
      return collectionData(q) as Observable<tipo[]>;
  }

  // Método para ejecutar una consulta con una sola condición
  async getDocumentsOneQuery<tipo>(path: string, campo: string, condicion: WhereFilterOp, valor: string) {
    let ref = collection(this.firestore, path);
    let q = query(ref, where(campo, condicion, valor));
    return await getDocs(q) as QuerySnapshot<tipo>;
  }
//----------------//

//---| AGGREGATIONS |---//
  // Método para contar documentos que cumplen con una condición
  async getCount(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this.firestore, path);
      let q = query(refCollection, where('enable', '==', true)); // Configura la consulta para contar documentos habilitados
      const snapshot = await getCountFromServer(q );
      return snapshot.data().count;
    } else {
      const refCollectionGroup = collectionGroup(this.firestore, path);
      let q = query(refCollectionGroup, where('user.id', '==', '8njXZ7n0GuhJyi1ysXO9')); // Configura la consulta en el grupo
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    }
  }

  // Método para sumar valores de un campo específico en documentos de una colección o grupo de colecciones
  async getSum(path: string, field: string, group: boolean = false) {
    let ref = group? collectionGroup(this.firestore, path) : collection(this.firestore, path);
    const snapshot = await getAggregateFromServer(ref, {
      total: sum(field)
    });
    return snapshot.data().total;
  }

  // Método para obtener el promedio de valores de un campo específico
  async getAverage(path: string, field: string, group: boolean = false) {
    let ref = group? collectionGroup(this.firestore, path) : collection(this.firestore, path);
    const snapshot = await getAggregateFromServer(ref, {
      total: average(field) // Calcula el promedio del campo especificado
    });
    return snapshot.data().total; // Devuelve el promedio
  }

  // Método para ejecutar agregaciones personalizadas en documentos de una colección
  async getAggregations(path: string, aggregate: any,
                        querys: Models.Firestore.whereQuery[] = [],
                        extras: Models.Firestore.extrasQuery = Models.Firestore.defaultExtrasQuery) {
    let q = this.getQuery(path, querys, extras);
    const snapshot = await getAggregateFromServer(q, aggregate); // Ejecuta la consulta de agregación
    return snapshot.data();
  }
//----------------//
  // Método privado para construir una consulta avanzada
  private getQuery(path: string, querys: Models.Firestore.whereQuery[], extras: Models.Firestore.extrasQuery = Models.Firestore.defaultExtrasQuery) {
    let ref = extras.group? collectionGroup(this.firestore, path) : collection(this.firestore, path);
    let ors: any = [];

    // Configura filtros OR con ANDs internos
    querys.forEach( (row) => {
      let wheres: any = [];
      for (let col = 0; col < row.length; col = col + 3) {
        wheres.push(where(row[col], row[col + 1], row[col + 2])); // Agrega condiciones de filtro
      }
      const AND = and(...wheres); // Crea un grupo AND de condiciones
      ors.push(AND); // Agrega el grupo AND a la lista de ORs
    });
    let q = query(ref, or(...ors)); // Construye la consulta con OR

    // limit
    if (extras.limit) {
      q = query(q, limit(extras.limit));
    }

    // orderBy
    if (extras.orderParam) {
      q = query(q, orderBy(extras.orderParam, extras.directionSort));
    }

    // startAfter
    if (extras.startAfter) {
      q = query(q, startAfter(extras.startAfter));
    }

    return q;
  }
}
