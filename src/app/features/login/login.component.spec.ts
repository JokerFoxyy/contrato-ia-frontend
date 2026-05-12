import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';
import { KeycloakService } from '../../core/auth/keycloak.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let keycloakMock: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    keycloakMock = jasmine.createSpyObj('KeycloakService', ['login', 'logout', 'isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: KeycloakService, useValue: keycloakMock },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 features listed', () => {
    expect(component.features.length).toBe(4);
  });

  it('should call keycloak login when login method is invoked', () => {
    component.login();
    expect(keycloakMock.login).toHaveBeenCalled();
  });

  it('should render the app title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ContratoIA');
  });

  it('should render the login button text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Entrar com Keycloak');
  });

  it('should render all feature items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Contratos gerados por IA');
    expect(compiled.textContent).toContain('PDF e DOCX');
    expect(compiled.textContent).toContain('Assinatura digital');
  });

  it('should render free plan information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3 contratos/mês');
  });

  it('should call keycloak login when login button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loginButton = compiled.querySelector('button[mat-flat-button]') as HTMLButtonElement;
    expect(loginButton).toBeTruthy();

    loginButton.click();
    expect(keycloakMock.login).toHaveBeenCalled();
  });

  it('should render the access card heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acesse sua conta');
  });
});
