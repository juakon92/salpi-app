import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { Models } from "src/app/models/models";
import { UserService } from "src/app/services/user.service";

export namespace guards {
  // Guarda que permite la navegación solo si el usuario está autenticado
  export const isLogin = (path: string = '/home') : CanActivateFn => {
    console.log('isLogin guard -> ', path);
    const validador = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);

      const login = await userService.isLogin(); // Verifica si el usuario está autenticado
      console.log('isLogin -> ', login);
      if (!login) {
        router.navigate([path]); // Redirige si el usuario no está autenticado
        return false;
      }
      return true;
    }
    return validador;
  }

  // Guarda que permite la navegación solo si el usuario NO está autenticado
  export const notLogin = (path: string = '/home') : CanActivateFn => {
    console.log('notLogin guard');
    const validador = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const login = await userService.isLogin();
      console.log('Login -> ', login);
      if (login) {
        router.navigate([path ? path: '/']); // Redirige si el usuario ya está autenticado
        return false;
      }
      return true;
    }
    return validador;
  }

  // Guarda que permite la navegación solo si el usuario tiene uno de los roles especificados en su perfil
  export const isRole = (roles: Models.Auth.Role[], path: string = '/home') : CanActivateFn => {
    console.log('isRole -> ', roles);
    const validador = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      let valid = false;
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const user = await userService.getState(); // Obtiene el estado de autenticación del usuario
      if (user) {
        const userProfile = await userService.getUserProfile(user.uid); // Obtiene el perfil del usuario
        console.log('userProfile -> ', userProfile.roles);
        roles.every( rol => {
          if (userProfile.roles[rol] == true) { // Verifica si el usuario tiene alguno de los roles requeridos
            valid = true;
            return false;
          }
          return true;
        });
      }
      if (!valid) {
        router.navigate([path]); // Redirige si el usuario no tiene un rol válido
      }
      console.log('valid -> ', valid);
      return valid;
    }
    return validador;
  }

  // Guarda que permite la navegación solo si el usuario tiene uno de los roles especificados en los claims del token
  export const isRoleClaim = (roles: Models.Auth.Role[], path: string = '/home') : CanActivateFn => {
    console.log('isRoleClaim -> ', roles);
    const validador = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      let valid = false;
      const userService: UserService = inject(UserService);
      const router: Router = inject(Router);
      const user = await userService.getState();
      if (user) {
        const tokenResult = await user.getIdTokenResult(true); // Obtiene los claims del token del usuario
        const claims: any = tokenResult.claims;
        if (claims.roles) {
          roles.every( rol => {
            if (claims.roles[rol] == true) {
              valid = true;
              return false;
            }
            return true;
          });
        }
      }
      if (!valid) {
        router.navigate([path]);
      }
      console.log('valid -> ', valid);
      return valid;
    }
    return validador;
  }
}
