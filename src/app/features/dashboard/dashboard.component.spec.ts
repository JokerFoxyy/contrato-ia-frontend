import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService, DocumentResponse, Page } from '../../core/services/api.service';
import { KeycloakService } from '../../core/auth/keycloak.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let keycloakMock: jasmine.SpyObj<KeycloakService>;

  const mockPage: Page<DocumentResponse> = {
    content: [
      {
        id: 'doc-1',
        title: 'Contrato Teste',
        generatedContent: 'Conteudo',
        status: 'DRAFT',
        createdAt: '2026-05-01T10:00:00Z',
        updatedAt: '2026-05-01T10:00:00Z',
      },
    ],
    totalElements: 5,
    totalPages: 1,
    number: 0,
    size: 1,
  };

  function createComponent(pageData: Page<DocumentResponse> = mockPage) {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['listDocuments']);
    apiServiceMock.listDocuments.and.returnValue(of(pageData));

    keycloakMock = jasmine.createSpyObj('KeycloakService', [
      'isAuthenticated',
      'getUserProfile',
      'login',
      'logout',
    ]);
    keycloakMock.getUserProfile.and.returnValue({
      id: 'user-1',
      email: 'victor@email.com',
      name: 'Victor',
    });

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: KeycloakService, useValue: keycloakMock },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should display user name from keycloak profile', () => {
    createComponent();
    expect(component.userName).toBe('Victor');
  });

  it('should default to "usuário" when name is not available', () => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['listDocuments']);
    apiServiceMock.listDocuments.and.returnValue(of(mockPage));

    keycloakMock = jasmine.createSpyObj('KeycloakService', [
      'isAuthenticated',
      'getUserProfile',
    ]);
    keycloakMock.getUserProfile.and.returnValue({
      id: 'user-1',
      email: undefined,
      name: undefined,
    });

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: KeycloakService, useValue: keycloakMock },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userName).toBe('usuário');
  });

  it('should load total documents on init', () => {
    createComponent();
    expect(apiServiceMock.listDocuments).toHaveBeenCalledWith(0, 1);
    expect(component.totalDocs()).toBe(5);
  });

  it('should set docsThisMonth capped at 3', () => {
    createComponent();
    expect(component.docsThisMonth()).toBe(3);
  });

  it('should handle zero documents', () => {
    const emptyPage: Page<DocumentResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 1,
    };
    createComponent(emptyPage);
    expect(component.totalDocs()).toBe(0);
    expect(component.docsThisMonth()).toBe(0);
  });

  it('should have 4 quick templates', () => {
    createComponent();
    expect(component.quickTemplates.length).toBe(4);
  });

  it('should render quick template labels', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prestação de Serviços');
    expect(compiled.textContent).toContain('NDA / Confidencialidade');
  });

  it('should render the greeting with user name', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ola, Victor');
  });

  it('should render CTA button for creating new contract', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Criar novo contrato');
  });

  it('should handle API error gracefully on init', () => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['listDocuments']);
    apiServiceMock.listDocuments.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    keycloakMock = jasmine.createSpyObj('KeycloakService', [
      'isAuthenticated',
      'getUserProfile',
    ]);
    keycloakMock.getUserProfile.and.returnValue({
      id: 'user-1',
      email: 'victor@email.com',
      name: 'Victor',
    });

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: KeycloakService, useValue: keycloakMock },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    // Should not throw
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.totalDocs()).toBe(0);
  });
});
