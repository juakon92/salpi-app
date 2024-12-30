export namespace ModelsFunctions {
  // Interfaz para la solicitud de asignación de roles de usuario
  export interface RequestSetRole {
    roles: {
      admin?: boolean;
      client?: boolean;
      dealer?: boolean;
    };
    uid: string;// Identificador único del usuario al que se le asignará el rol
  }

  // Interfaz para la respuesta de la función setRole, indicando si fue exitosa
  export interface ResponseSetRole {
    ok: boolean;
  }

  // Perfil de usuario con datos básicos y roles asignados
  export interface UserProfile {
    name: string;
    photo: string;
    age: number;
    id: string;
    email: string;
    roles?: {
        admin?: boolean;
        client?: boolean;
        dealer?: boolean;
    };
    token: string; // Token de autenticación del usuario
  }

  // Interfaz para la respuesta de creación de usuario en Firebase
  export interface ResponseCreateUser {
    ok: boolean;
    uid?: string;
  }

  // Interfaz para notificaciones push enviadas a dispositivos
  export interface NotificationPush {
    tokens: string[];
    message: {
      title: string;
      content: string;
      image?: string;
    };
    data?: any;
    tag?: string;
  }

  // Representa el carrito de compras con los artículos, total y cantidad
  export interface Carrito {
    items: any[];
    total: number;
    cant: number;
  }

  // Información sobre un pedido, incluyendo el client y la dirección de entrega
  export interface InfoPedido {
    datos: DatosUserPedido;
    fechaEntrega: Date | any;
    direccionEntrega: any;
  }

  // Información básica del usuario que realiza el pedido
  export interface DatosUserPedido {
    id?: string;
    name: string;
    mail: string;
    phone: string;
  }

  // Representa un pedido con información sobre el carrito, estado y detalles del dealer
  export interface Pedido {
    carrito: Carrito;
    info: InfoPedido;
    id?: string;
    date?: any;
    uid: string;
    state: StatePedido;
    dealer?: {
      uid: string;
      name: string;
      coordinate: any;
    };
  }

  // Tipo para representar los posibles estados de un pedido
  export type StatePedido =
    'nuevo' |
    'tomado' |
    'asignado' |
    'en camino' |
    'entregado' |
    'cancelado';

  // Representa una notificación dentro de la aplicación
  export interface NotificationApp {
    titulo: string;
    descripcion: string;
    enlace: string;
    icono: string;
    color: string;
    state: 'nueva' | 'vista';
    id?: string;
    date?: any;
  }
}
