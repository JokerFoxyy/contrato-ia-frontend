import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../core/services/api.service';

interface ContractExample {
  label: string;
  icon: string;
  description: string;
}

@Component({
    selector: 'app-document-create',
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
    ],
    template: `
    <div class="page-container py-10">
      <div class="max-w-2xl mx-auto">

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Novo Contrato</h1>
          <p class="text-slate-500 dark:text-slate-400">
            Descreva o que voce precisa em linguagem simples. A IA vai gerar um contrato
            completo adaptado a legislacao brasileira.
          </p>
        </div>

        <!-- Card principal -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="generate()">

            <!-- Exemplos rapidos -->
            <div class="mb-5">
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Exemplos rapidos:</p>
              <div class="flex flex-wrap gap-2">
                @for (example of examples; track example.label) {
                  <button
                    type="button"
                    mat-stroked-button
                    class="!text-xs dark:!text-slate-300 dark:!border-slate-600"
                    (click)="useExample(example.description)"
                  >
                    {{ example.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Campo de descricao -->
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Descreva o seu contrato</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="6"
                placeholder="Ex: Preciso de um contrato de prestacao de servicos de desenvolvimento web. Sou freelancer, meu cliente e uma empresa chamada Tech LTDA. O projeto e um site institucional por R$ 5.000 com prazo de 30 dias..."
              ></textarea>
              <mat-hint align="end">
                {{ form.get('description')?.value?.length || 0 }} / 2000
              </mat-hint>
              @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
                <mat-error>Descreva o que voce precisa no contrato</mat-error>
              }
              @if (form.get('description')?.hasError('minlength')) {
                <mat-error>Minimo de 20 caracteres</mat-error>
              }
            </mat-form-field>

            <!-- Titulo opcional -->
            <mat-form-field class="w-full mt-3" appearance="outline">
              <mat-label>Titulo do documento (opcional)</mat-label>
              <input matInput formControlName="title" placeholder="Ex: Contrato - Site Tech LTDA" />
            </mat-form-field>

            <!-- Erro geral -->
            @if (error()) {
              <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-300">
                {{ error() }}
              </div>
            }

            <!-- Botao de submit -->
            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="w-full !py-3 !text-base"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <mat-progress-spinner diameter="20" mode="indeterminate" class="inline-block mr-2" />
                Gerando contrato...
              } @else {
                <ng-container>
                  <mat-icon class="mr-1">auto_awesome</mat-icon>
                  Gerar Contrato com IA
                </ng-container>
              }
            </button>

          </form>
        </div>

        <!-- Nota informativa -->
        <p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          <mat-icon class="!text-xs align-middle">info</mat-icon>
          Os contratos gerados sao baseados na legislacao brasileira vigente.
          Recomendamos revisao por um advogado para contratos de alto valor.
        </p>

      </div>
    </div>
  `
})
export class DocumentCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    title: [''],
  });

  examples: ContractExample[] = [
    {
      label: 'Prestacao de Servicos',
      icon: 'work',
      description: 'Contrato de prestacao de servicos de desenvolvimento web entre freelancer e empresa. Projeto de site institucional por R$ 5.000 com prazo de 30 dias.',
    },
    {
      label: 'NDA',
      icon: 'lock',
      description: 'Acordo de confidencialidade entre duas empresas que vao compartilhar informacoes estrategicas durante uma negociacao de parceria.',
    },
    {
      label: 'Locacao',
      icon: 'home',
      description: 'Contrato de locacao residencial de apartamento por 12 meses, valor R$ 2.500/mes, com fiador.',
    },
    {
      label: 'Parceria Comercial',
      icon: 'handshake',
      description: 'Contrato de parceria comercial entre dois freelancers para dividir projetos e receitas 50/50.',
    },
  ];

  useExample(description: string): void {
    this.form.patchValue({ description });
  }

  generate(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { description, title } = this.form.value;

    this.api.generateDocument({ description: description!, title: title || undefined }).subscribe({
      next: (doc) => {
        this.router.navigate(['/documents', doc.id]);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erro ao gerar o documento. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
