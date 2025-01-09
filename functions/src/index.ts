import { initializeApp } from 'firebase-admin/app';
initializeApp();

import { Users } from './users';
export const setRole = Users.setRole;

import { Store } from './store';
export const newPedido = Store.newPedido;
export const cambioEstadoPedido = Store.cambioEstadoPedido;
