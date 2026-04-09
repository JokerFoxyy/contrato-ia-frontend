import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentListComponent } from './document-list.component';
import { ApiService, DocumentResponse, Page } from '../../../core/services/api.service';

describe('DocumentListComponent', () => {
  let component: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;

  const mockDocuments: DocumentResponse[] = [
    {
      id: 'doc-1',
      title: 'Contrato de Prestacao',
      generatedContent: 'Conteudo 1',
      status: 'DRAFT',
      createdAt: '2026-04-08T10:00:00Z',
      updatedAt: '2026-04-08T10:00:00Z',
    },
    {
      id: 'doc-2',
      title: 'NDA Confidencialidade',
      generatedContent: 'Conteudo 2',
      status: 'FINALIZED',
      createdAt: '2026-04-09T10:00:00Z',
      updatedAt: '2026-04-09T10:00:00Z',
    },
  ];

  const mockPage: Page<DocumentResponse> = {
    content: mockDocuments,
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
  };

  function createComponent(pageData: Page<DocumentResponse> = mockPage) {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['listDocuments']);
    apiServiceMock.listDocuments.and.returnValue(of(pageData));

    TestBed.configureTestingModule({
      imports: [DocumentListComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
      ],
    });

    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load documents on init', () => {
    createComponent();
    expect(apiServiceMock.listDocuments).toHaveBeenCalled();
    expect(component.documents()).toEqual(mockDocuments);
    expect(component.loading()).toBeFalse();
  });

  it('should set loading to false after documents are loaded', () => {
    createComponent();
    expect(component.loading()).toBeFalse();
  });

  it('should handle empty document list', () => {
    const emptyPage: Page<DocumentResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
    };
    createComponent(emptyPage);
    expect(component.documents()).toEqual([]);
    expect(component.loading()).toBeFalse();
  });

  it('should set loading to false on API error', () => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['listDocuments']);
    apiServiceMock.listDocuments.and.returnValue(throwError(() => new Error('Server error')));

    TestBed.configureTestingModule({
      imports: [DocumentListComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
      ],
    });

    fixture = TestBed.createComponent(DocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.documents()).toEqual([]);
  });

  it('should render document titles in the template', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    const titles = compiled.querySelectorAll('h3');
    expect(titles.length).toBe(2);
    expect(titles[0].textContent).toContain('Contrato de Prestacao');
    expect(titles[1].textContent).toContain('NDA Confidencialidade');
  });

  it('should show empty state when no documents exist', () => {
    const emptyPage: Page<DocumentResponse> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
    };
    createComponent(emptyPage);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum documento ainda');
  });
});
