import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, DocumentRequest, DocumentResponse, Page } from './api.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [ApiService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateDocument', () => {
    it('should POST to /v1/documents/generate with the request body', () => {
      const request: DocumentRequest = {
        description: 'Contrato de prestacao de servicos',
        title: 'Contrato Teste',
      };

      const mockResponse: DocumentResponse = {
        id: 'abc-123',
        title: 'Contrato Teste',
        generatedContent: 'Conteudo gerado pela IA...',
        status: 'DRAFT',
        createdAt: '2026-04-09T10:00:00Z',
        updatedAt: '2026-04-09T10:00:00Z',
      };

      service.generateDocument(request).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/v1/documents/generate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });

    it('should send request without title when title is not provided', () => {
      const request: DocumentRequest = {
        description: 'Contrato simples',
      };

      service.generateDocument(request).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/v1/documents/generate`);
      expect(req.request.body.description).toBe('Contrato simples');
      expect(req.request.body.title).toBeUndefined();
      req.flush({});
    });
  });

  describe('listDocuments', () => {
    it('should GET /v1/documents with default page=0 and size=10', () => {
      const mockPage: Page<DocumentResponse> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10,
      };

      service.listDocuments().subscribe((page) => {
        expect(page).toEqual(mockPage);
      });

      const req = httpMock.expectOne((r) =>
        r.url === `${baseUrl}/v1/documents` &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should pass custom page and size params', () => {
      service.listDocuments(2, 25).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${baseUrl}/v1/documents` &&
        r.params.get('page') === '2' &&
        r.params.get('size') === '25'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ content: [], totalElements: 0, totalPages: 0, number: 2, size: 25 });
    });

    it('should return documents when available', () => {
      const mockDocs: DocumentResponse[] = [
        {
          id: '1',
          title: 'Contrato A',
          generatedContent: 'Conteudo A',
          status: 'DRAFT',
          createdAt: '2026-04-08T10:00:00Z',
          updatedAt: '2026-04-08T10:00:00Z',
        },
        {
          id: '2',
          title: 'Contrato B',
          generatedContent: 'Conteudo B',
          status: 'FINALIZED',
          createdAt: '2026-04-09T10:00:00Z',
          updatedAt: '2026-04-09T10:00:00Z',
        },
      ];

      const mockPage: Page<DocumentResponse> = {
        content: mockDocs,
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 10,
      };

      service.listDocuments().subscribe((page) => {
        expect(page.content.length).toBe(2);
        expect(page.totalElements).toBe(2);
        expect(page.content[0].title).toBe('Contrato A');
      });

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/v1/documents`);
      req.flush(mockPage);
    });
  });

  describe('getDocument', () => {
    it('should GET /v1/documents/:id', () => {
      const mockDoc: DocumentResponse = {
        id: 'doc-456',
        title: 'Contrato de Locacao',
        generatedContent: 'Conteudo do contrato...',
        status: 'FINALIZED',
        pdfUrl: 'https://example.com/doc.pdf',
        createdAt: '2026-04-09T10:00:00Z',
        updatedAt: '2026-04-09T10:00:00Z',
      };

      service.getDocument('doc-456').subscribe((doc) => {
        expect(doc).toEqual(mockDoc);
        expect(doc.pdfUrl).toBe('https://example.com/doc.pdf');
      });

      const req = httpMock.expectOne(`${baseUrl}/v1/documents/doc-456`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoc);
    });

    it('should propagate HTTP errors', () => {
      service.getDocument('nonexistent').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/v1/documents/nonexistent`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
