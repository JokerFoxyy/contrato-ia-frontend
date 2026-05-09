import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KeycloakService } from '../../core/auth/keycloak.service';

@Component({
    selector: 'app-login',
    imports: [MatButtonModule, MatIconModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div class="max-w-md w-full">

        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl shadow-lg mb-4">
            <mat-icon class="!text-white !text-4xl">description</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">ContratoIA</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Contratos juridicos com Inteligencia Artificial</p>
        </div>

        <!-- Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 p-8 border border-transparent dark:border-slate-700 transition-colors duration-200">
          <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Acesse sua conta</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Gere contratos profissionais adaptados a legislacao brasileira em minutos.
          </p>

          <button mat-flat-button color="primary" class="w-full !py-3 !text-base"
                  (click)="login()">
            <mat-icon class="mr-2">login</mat-icon>
            Entrar com Keycloak
          </button>

          <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div class="space-y-3">
              @for (feature of features; track feature.text) {
                <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <mat-icon class="!text-green-500 dark:!text-green-400 !text-base shrink-0">check_circle</mat-icon>
                  {{ feature.text }}
                </div>
              }
            </div>
          </div>
        </div>

        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Plano gratuito inclui 3 contratos/mes
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private keycloak = inject(KeycloakService);

  features = [
    { text: 'Contratos gerados por IA juridica brasileira' },
    { text: 'Exportacao em PDF e DOCX' },
    { text: 'Assinatura digital integrada' },
    { text: 'Legislacao brasileira atualizada' },
  ];

  login(): void {
    this.keycloak.login();
  }
}
