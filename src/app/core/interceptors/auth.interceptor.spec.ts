import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { KeycloakService } from '../auth/keycloak.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let keycloakMock: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    keycloakMock = jasmine.createSpyObj('KeycloakService', [
      'isAuthenticated',
      'getToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: KeycloakService, useValue: keycloakMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should pass request without Authorization header when not authenticated', () => {
    keycloakMock.isAuthenticated.and.returnValue(false);

    httpClient.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should add Authorization header with Bearer token when authenticated', fakeAsync(() => {
    keycloakMock.isAuthenticated.and.returnValue(true);
    keycloakMock.getToken.and.returnValue(Promise.resolve('test-jwt-token'));

    httpClient.get('/api/test').subscribe();
    tick();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  }));

  it('should preserve existing headers when adding Authorization', fakeAsync(() => {
    keycloakMock.isAuthenticated.and.returnValue(true);
    keycloakMock.getToken.and.returnValue(Promise.resolve('my-token'));

    httpClient
      .get('/api/data', { headers: { 'X-Custom': 'value' } })
      .subscribe();
    tick();

    const req = httpTesting.expectOne('/api/data');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  }));

  it('should call getToken to refresh token before attaching', fakeAsync(() => {
    keycloakMock.isAuthenticated.and.returnValue(true);
    keycloakMock.getToken.and.returnValue(Promise.resolve('refreshed-token'));

    httpClient.get('/api/secure').subscribe();
    tick();

    expect(keycloakMock.getToken).toHaveBeenCalled();
    const req = httpTesting.expectOne('/api/secure');
    expect(req.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    req.flush({});
  }));
});
