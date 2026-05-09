import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, DocumentResponse } from '../../../core/services/api.service';

@Component({
    selector: 'app-document-list',
    imports: [
        RouterLink,
        DatePipe,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
    ],
    template: `
    <div class="page-container py-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Meus Documentos</h1>
        <a mat-flat-button color="primary" routerLink="/documents/new">
          <mat-icon>add</mat-icon>
          Novo Contrato
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <mat-progress-spinner mode="indeterminate" />
        </div>
      }

      @if (!loading() && documents().length === 0) {
        <div class="text-center py-20 card">
          <mat-icon class="!text-6xl text-slate-300 dark:text-slate-600">description</mat-icon>
          <h2 class="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Nenhum documento ainda</h2>
          <p class="text-slate-400 dark:text-slate-500 mt-1">Crie seu primeiro contrato com IA</p>
          <a mat-flat-button color="primary" routerLink="/documents/new" class="mt-4">
            Criar primeiro contrato
          </a>
        </div>
      }

      <div class="grid gap-4">
        @for (doc of documents(); track doc.id) {
          <a [routerLink]="['/documents', doc.id]"
             class="card hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer no-underline block">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <mat-icon class="text-blue-500 dark:text-blue-400">description</mat-icon>
                <div>
                  <h3 class="font-semibold text-slate-800 dark:text-slate-100">{{ doc.title }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {{ doc.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>
              </div>
              <mat-icon class="text-slate-400 dark:text-slate-500">chevron_right</mat-icon>
            </div>
          </a>
        }
      </div>
    </div>
  `
})
export class DocumentListComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  documents = signal<DocumentResponse[]>([]);

  ngOnInit(): void {
    this.api.listDocuments().subscribe({
      next: (page) => {
        this.documents.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
