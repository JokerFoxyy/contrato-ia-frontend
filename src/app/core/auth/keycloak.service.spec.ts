/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  let service: KeycloakService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeycloakService],
    });
    service = TestBed.inject(KeycloakService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return false when keycloak is not initialized', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when keycloak instance has authenticated = false', () => {
      // Access the private keycloak property via bracket notation for testing
      (service as any).keycloak = { authenticated: false };
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when keycloak instance has authenticated = true', () => {
      (service as any).keycloak = { authenticated: true };
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('getUserProfile', () => {
    it('should return undefined fields when keycloak is not initialized', () => {
      const profile = service.getUserProfile();
      expect(profile.id).toBeUndefined();
      expect(profile.email).toBeUndefined();
      expect(profile.name).toBeUndefined();
    });

    it('should return user profile from token when keycloak is initialized', () => {
      (service as any).keycloak = {
        subject: 'user-123',
        tokenParsed: {
          email: 'user@example.com',
          name: 'John Doe',
        },
      };

      const profile = service.getUserProfile();
      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('user@example.com');
      expect(profile.name).toBe('John Doe');
    });

    it('should handle missing tokenParsed fields gracefully', () => {
      (service as any).keycloak = {
        subject: 'user-456',
        tokenParsed: {},
      };

      const profile = service.getUserProfile();
      expect(profile.id).toBe('user-456');
      expect(profile.email).toBeUndefined();
      expect(profile.name).toBeUndefined();
    });
  });

  describe('getToken', () => {
    it('should call updateToken and return the token', async () => {
      const mockKeycloak = {
        updateToken: jasmine.createSpy('updateToken').and.returnValue(Promise.resolve(true)),
        token: 'mock-jwt-token',
        init: jasmine.createSpy('init'),
        login: jasmine.createSpy('login'),
      };
      (service as any).keycloak = mockKeycloak;

      const token = await service.getToken();

      expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30);
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('login', () => {
    it('should call keycloak.login()', () => {
      const mockKeycloak = {
        login: jasmine.createSpy('login'),
        init: jasmine.createSpy('init'),
      };
      (service as any).keycloak = mockKeycloak;

      service.login();
      expect(mockKeycloak.login).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call keycloak.logout() with redirectUri', () => {
      const mockKeycloak = {
        logout: jasmine.createSpy('logout'),
      };
      (service as any).keycloak = mockKeycloak;

      service.logout();
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: window.location.origin,
      });
    });

    it('should not throw when keycloak is null', () => {
      (service as any).keycloak = null;
      expect(() => service.logout()).not.toThrow();
    });
  });
});
