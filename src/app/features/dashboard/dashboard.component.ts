import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KeycloakService } from '../../core/auth/keycloak.service';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    template: `
    <div class="page-container py-10">

      <!-- Boas vindas -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Ola, {{ userName }} 👋
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">O que você precisa contratualizar hoje?</p>
      </div>

      <!-- CTA principal -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg dark:shadow-blue-900/30">
        <h2 class="text-2xl font-bold mb-2">Gere um contrato em minutos</h2>
        <p class="opacity-90 mb-6 max-w-lg">
          Descreva o que você precisa em linguagem simples e a IA gera um contrato
          completo adaptado à legislação brasileira.
        </p>
        <a mat-flat-button routerLink="/documents/new"
           class="!bg-white !text-blue-600 !font-semibold">
          <mat-icon>auto_awesome</mat-icon>
          Criar novo contrato
        </a>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ totalDocs() }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Contratos gerados</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ docsThisMonth() }}</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Este mês (plano gratuito: 3)</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">0</div>
          <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Assinaturas pendentes</div>
        </div>
      </div>

      <!-- Templates rapidos -->
      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Tipos de contrato populares</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (template of quickTemplates; track template.label) {
          <a routerLink="/documents/new" class="card hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer no-underline text-center block">
            <div class="text-3xl mb-2">{{ template.emoji }}</div>
            <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm">{{ template.label }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ template.description }}</p>
          </a>
        }
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private keycloak = inject(KeycloakService);
  private api = inject(ApiService);

  totalDocs = signal(0);
  docsThisMonth = signal(0);

  get userName(): string {
    return this.keycloak.getUserProfile().name ?? 'usuário';
  }

  quickTemplates = [
    { emoji: '💻', label: 'Prestação de Serviços', description: 'Para freelancers e MEIs' },
    { emoji: '🤝', label: 'Parceria Comercial', description: 'Entre empresas e profissionais' },
    { emoji: '🔒', label: 'NDA / Confidencialidade', description: 'Proteja suas informações' },
    { emoji: '🏠', label: 'Locação', description: 'Residencial ou comercial' },
  ];

  ngOnInit(): void {
    this.api.listDocuments(0, 1).subscribe({
      next: (page) => {
        this.totalDocs.set(page.totalElements);
        this.docsThisMonth.set(Math.min(page.totalElements, 3));
      },
    });
  }
}
