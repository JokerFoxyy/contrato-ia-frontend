import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentRequest {
  description: string;
  title?: string;
  templateId?: string;
}

export interface DocumentResponse {
  id: string;
  title: string;
  generatedContent: string;
  status: 'GENERATING' | 'DRAFT' | 'FINALIZED' | 'SIGNING' | 'SIGNED' | 'ARCHIVED';
  pdfUrl?: string;
  docxUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  generateDocument(request: DocumentRequest): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>(`${this.baseUrl}/v1/documents/generate`, request);
  }

  listDocuments(page = 0, size = 10): Observable<Page<DocumentResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<DocumentResponse>>(`${this.baseUrl}/v1/documents`, { params });
  }

  getDocument(id: string): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/v1/documents/${id}`);
  }
}
