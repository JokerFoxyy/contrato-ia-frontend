import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { KeycloakService } from './keycloak.service';

describe('authGuard', () => {
  let keycloakServiceMock: jasmine.SpyObj<KeycloakService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    keycloakServiceMock = jasmine.createSpyObj('KeycloakService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeycloakService, useValue: keycloakServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should return true when user is authenticated', () => {
    keycloakServiceMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

    expect(result).toBeTrue();
    expect(keycloakServiceMock.isAuthenticated).toHaveBeenCalled();
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', () => {
    keycloakServiceMock.isAuthenticated.and.returnValue(false);
    const fakeUrlTree = {} as UrlTree;
    routerMock.createUrlTree.and.returnValue(fakeUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

    expect(result).toBe(fakeUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
