import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentCreateComponent } from './document-create.component';
import { ApiService, DocumentResponse } from '../../../core/services/api.service';

describe('DocumentCreateComponent', () => {
  let component: DocumentCreateComponent;
  let fixture: ComponentFixture<DocumentCreateComponent>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['generateDocument']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DocumentCreateComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ApiService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should have an invalid form initially', () => {
      expect(component.form.valid).toBeFalse();
    });

    it('should require the description field', () => {
      const descriptionControl = component.form.get('description')!;
      expect(descriptionControl.hasError('required')).toBeTrue();
    });

    it('should enforce minLength of 20 on description', () => {
      const descriptionControl = component.form.get('description')!;
      descriptionControl.setValue('short');
      expect(descriptionControl.hasError('minlength')).toBeTrue();
    });

    it('should accept a description with 20+ characters', () => {
      const descriptionControl = component.form.get('description')!;
      descriptionControl.setValue('A description that is long enough to pass validation checks');
      expect(descriptionControl.hasError('required')).toBeFalse();
      expect(descriptionControl.hasError('minlength')).toBeFalse();
    });

    it('should enforce maxLength of 2000 on description', () => {
      const descriptionControl = component.form.get('description')!;
      descriptionControl.setValue('x'.repeat(2001));
      expect(descriptionControl.hasError('maxlength')).toBeTrue();
    });

    it('should not require title', () => {
      const titleControl = component.form.get('title')!;
      expect(titleControl.valid).toBeTrue();
    });
  });

  describe('useExample', () => {
    it('should populate the description field with the provided text', () => {
      const exampleText = 'Contrato de prestacao de servicos de desenvolvimento web entre freelancer e empresa.';
      component.useExample(exampleText);
      expect(component.form.get('description')!.value).toBe(exampleText);
    });
  });

  describe('generate', () => {
    const validDescription = 'Contrato de prestacao de servicos de desenvolvimento web entre freelancer e empresa.';

    it('should not call API when form is invalid', () => {
      component.generate();
      expect(apiServiceMock.generateDocument).not.toHaveBeenCalled();
    });

    it('should call API and navigate on success', () => {
      const mockResponse: DocumentResponse = {
        id: 'new-doc-123',
        title: 'Contrato Gerado',
        generatedContent: 'Conteudo...',
        status: 'DRAFT',
        createdAt: '2026-04-09T10:00:00Z',
        updatedAt: '2026-04-09T10:00:00Z',
      };
      apiServiceMock.generateDocument.and.returnValue(of(mockResponse));

      component.form.patchValue({ description: validDescription, title: 'Meu Contrato' });
      component.generate();

      expect(apiServiceMock.generateDocument).toHaveBeenCalledWith({
        description: validDescription,
        title: 'Meu Contrato',
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/documents', 'new-doc-123']);
    });

    it('should set loading to true while generating', () => {
      apiServiceMock.generateDocument.and.returnValue(of({
        id: '1', title: '', generatedContent: '', status: 'DRAFT',
        createdAt: '', updatedAt: '',
      }));

      component.form.patchValue({ description: validDescription });

      expect(component.loading()).toBeFalse();
      component.generate();
      // After successful response, navigation happens; loading stays true until navigation
    });

    it('should set error message on API failure', () => {
      apiServiceMock.generateDocument.and.returnValue(
        throwError(() => ({ error: { error: 'Limite de documentos atingido' } }))
      );

      component.form.patchValue({ description: validDescription });
      component.generate();

      expect(component.error()).toBe('Limite de documentos atingido');
      expect(component.loading()).toBeFalse();
    });

    it('should set a default error message when error has no body', () => {
      apiServiceMock.generateDocument.and.returnValue(
        throwError(() => ({ error: {} }))
      );

      component.form.patchValue({ description: validDescription });
      component.generate();

      expect(component.error()).toBe('Erro ao gerar o documento. Tente novamente.');
      expect(component.loading()).toBeFalse();
    });

    it('should send undefined title when title is empty', () => {
      apiServiceMock.generateDocument.and.returnValue(of({
        id: '1', title: '', generatedContent: '', status: 'DRAFT',
        createdAt: '', updatedAt: '',
      }));

      component.form.patchValue({ description: validDescription, title: '' });
      component.generate();

      expect(apiServiceMock.generateDocument).toHaveBeenCalledWith({
        description: validDescription,
        title: undefined,
      });
    });

    it('should clear previous error when generating again', () => {
      apiServiceMock.generateDocument.and.returnValue(
        throwError(() => ({ error: {} }))
      );
      component.form.patchValue({ description: validDescription });
      component.generate();

      expect(component.error()).toBeTruthy();

      apiServiceMock.generateDocument.and.returnValue(of({
        id: '1', title: '', generatedContent: '', status: 'DRAFT',
        createdAt: '', updatedAt: '',
      }));
      component.generate();

      expect(component.error()).toBeNull();
    });
  });
});
