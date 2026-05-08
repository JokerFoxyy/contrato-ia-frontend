import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService, DocumentResponse } from '../../../core/services/api.service';

@Component({
    selector: 'app-document-result',
    imports: [
        RouterLink,
        DatePipe,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTooltipModule,
    ],
    template: `
    <div class="page-container py-10">

      @if (loading()) {
        <div class="flex justify-center py-20">
          <mat-progress-spinner mode="indeterminate" />
        </div>
      }

      @if (document()) {
        <div class="max-w-4xl mx-auto">

          <!-- Header com ações -->
          <div class="flex items-start justify-between mb-6 gap-4">
            <div>
              <a routerLink="/documents" class="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
                <mat-icon class="!text-sm">arrow_back</mat-icon>
                Meus documentos
              </a>
              <h1 class="text-2xl font-bold text-slate-800">{{ document()!.title }}</h1>
              <div class="flex items-center gap-2 mt-1">
                <mat-chip [class]="statusClass()">{{ statusLabel() }}</mat-chip>
                <span class="text-xs text-slate-400">
                  Gerado em {{ document()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
            </div>

            <!-- Botões de exportar -->
            <div class="flex gap-2 shrink-0">
              @if (document()!.pdfUrl) {
                <a [href]="document()!.pdfUrl" target="_blank" mat-stroked-button>
                  <mat-icon>picture_as_pdf</mat-icon>
                  PDF
                </a>
              }
              @if (document()!.docxUrl) {
                <a [href]="document()!.docxUrl" target="_blank" mat-stroked-button>
                  <mat-icon>description</mat-icon>
                  DOCX
                </a>
              }
              <button mat-flat-button color="primary" (click)="copyContent()"
                [matTooltip]="copied() ? 'Copiado!' : 'Copiar texto'">
                <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
                {{ copied() ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>

          <!-- Conteúdo do documento -->
          <div class="card">
            <div class="prose prose-slate max-w-none">
              <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{{ document()!.generatedContent }}</pre>
            </div>
          </div>

          <!-- CTA para assinar -->
          <div class="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p class="font-semibold text-blue-800">Pronto para assinar?</p>
              <p class="text-sm text-blue-600">Envie para assinatura digital diretamente pela plataforma.</p>
            </div>
            <button mat-flat-button color="primary">
              <mat-icon>draw</mat-icon>
              Enviar para Assinatura
            </button>
          </div>

        </div>
      }

      @if (error()) {
        <div class="text-center py-20">
          <mat-icon class="!text-5xl text-red-400">error_outline</mat-icon>
          <p class="mt-4 text-slate-600">{{ error() }}</p>
          <a mat-flat-button color="primary" routerLink="/documents/new" class="mt-4">
            Tentar novamente
          </a>
        </div>
      }

    </div>
  `
})
export class DocumentResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  loading = signal(true);
  document = signal<DocumentResponse | null>(null);
  error = signal<string | null>(null);
  copied = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getDocument(id).subscribe({
      next: (doc) => {
        this.document.set(doc);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Documento não encontrado.');
        this.loading.set(false);
      },
    });
  }

  copyContent(): void {
    const content = this.document()?.generatedContent;
    if (content) {
      navigator.clipboard.writeText(content);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  statusLabel(): string {
    const labels: Record<string, string> = {
      GENERATING: 'Gerando...',
      DRAFT: 'Rascunho',
      FINALIZED: 'Finalizado',
      SIGNING: 'Em assinatura',
      SIGNED: 'Assinado',
      ARCHIVED: 'Arquivado',
    };
    return labels[this.document()?.status ?? ''] ?? '';
  }

  statusClass(): string {
    const classes: Record<string, string> = {
      DRAFT: '!bg-yellow-100 !text-yellow-800',
      FINALIZED: '!bg-green-100 !text-green-800',
      SIGNING: '!bg-blue-100 !text-blue-800',
      SIGNED: '!bg-emerald-100 !text-emerald-800',
    };
    return classes[this.document()?.status ?? ''] ?? '';
  }
}
