import { initializeApp } from "firebase-admin/app";
initializeApp();

import { Users } from "./users";
export const setRole = Users.setRole;

// Users.initAdmin();
