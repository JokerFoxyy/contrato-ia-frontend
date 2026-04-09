import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KeycloakService } from '../../core/auth/keycloak.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full">

        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <mat-icon class="!text-white !text-4xl">description</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-slate-800">ContratoIA</h1>
          <p class="text-slate-500 mt-2">Contratos jurídicos com Inteligência Artificial</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-xl font-semibold text-slate-800 mb-2">Acesse sua conta</h2>
          <p class="text-slate-500 text-sm mb-6">
            Gere contratos profissionais adaptados à legislação brasileira em minutos.
          </p>

          <button mat-flat-button color="primary" class="w-full !py-3 !text-base"
                  (click)="login()">
            <mat-icon class="mr-2">login</mat-icon>
            Entrar com Keycloak
          </button>

          <div class="mt-6 pt-6 border-t border-slate-100">
            <div class="space-y-3">
              @for (feature of features; track feature.text) {
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <mat-icon class="!text-green-500 !text-base shrink-0">check_circle</mat-icon>
                  {{ feature.text }}
                </div>
              }
            </div>
          </div>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">
          Plano gratuito inclui 3 contratos/mês
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private keycloak = inject(KeycloakService);

  features = [
    { text: 'Contratos gerados por IA jurídica brasileira' },
    { text: 'Exportação em PDF e DOCX' },
    { text: 'Assinatura digital integrada' },
    { text: 'Legislação brasileira atualizada' },
  ];

  login(): void {
    this.keycloak.login();
  }
}
