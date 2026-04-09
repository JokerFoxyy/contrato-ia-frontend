import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentResultComponent } from './document-result.component';
import { ApiService, DocumentResponse } from '../../../core/services/api.service';

describe('DocumentResultComponent', () => {
  let component: DocumentResultComponent;
  let fixture: ComponentFixture<DocumentResultComponent>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;

  const mockDocument: DocumentResponse = {
    id: 'doc-abc',
    title: 'Contrato de Locacao',
    generatedContent: 'CONTRATO DE LOCACAO\n\nPelo presente instrumento...',
    status: 'DRAFT',
    pdfUrl: 'https://example.com/doc.pdf',
    createdAt: '2026-04-09T10:00:00Z',
    updatedAt: '2026-04-09T10:00:00Z',
  };

  function createComponent(docId: string = 'doc-abc', apiReturn: any = of(mockDocument)) {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['getDocument']);
    apiServiceMock.getDocument.and.returnValue(apiReturn);

    TestBed.configureTestingModule({
      imports: [DocumentResultComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: ApiService, useValue: apiServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: docId }),
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(DocumentResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  describe('loading document', () => {
    it('should load document by route param id on init', () => {
      createComponent('doc-abc');
      expect(apiServiceMock.getDocument).toHaveBeenCalledWith('doc-abc');
      expect(component.document()).toEqual(mockDocument);
      expect(component.loading()).toBeFalse();
    });

    it('should pass the correct id from the route', () => {
      createComponent('other-id-999');
      expect(apiServiceMock.getDocument).toHaveBeenCalledWith('other-id-999');
    });

    it('should set error when document is not found', () => {
      createComponent('bad-id', throwError(() => ({ status: 404 })));
      expect(component.error()).toBe('Documento não encontrado.');
      expect(component.loading()).toBeFalse();
      expect(component.document()).toBeNull();
    });
  });

  describe('statusLabel', () => {
    it('should return correct label for DRAFT', () => {
      createComponent();
      expect(component.statusLabel()).toBe('Rascunho');
    });

    it('should return correct label for FINALIZED', () => {
      const finalizedDoc = { ...mockDocument, status: 'FINALIZED' as const };
      createComponent('doc-abc', of(finalizedDoc));
      expect(component.statusLabel()).toBe('Finalizado');
    });

    it('should return empty string for unknown status', () => {
      createComponent('doc-abc', of({ ...mockDocument, status: 'UNKNOWN' as any }));
      expect(component.statusLabel()).toBe('');
    });
  });

  describe('copyContent', () => {
    it('should copy document content to clipboard', () => {
      createComponent();

      const clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.copyContent();

      expect(clipboardSpy).toHaveBeenCalledWith('CONTRATO DE LOCACAO\n\nPelo presente instrumento...');
      expect(component.copied()).toBeTrue();
    });

    it('should reset copied flag after timeout', fakeAsync(() => {
      createComponent();

      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.copyContent();

      expect(component.copied()).toBeTrue();
      tick(2000);
      expect(component.copied()).toBeFalse();
    }));

    it('should not call clipboard when document is null', () => {
      createComponent('bad-id', throwError(() => ({ status: 404 })));

      const clipboardSpy = spyOn(navigator.clipboard, 'writeText');
      component.copyContent();

      expect(clipboardSpy).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should display document title', () => {
      createComponent();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Contrato de Locacao');
    });

    it('should display document content', () => {
      createComponent();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Pelo presente instrumento');
    });

    it('should show error message when document fails to load', () => {
      createComponent('bad-id', throwError(() => ({ status: 404 })));
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Documento não encontrado');
    });
  });
});
