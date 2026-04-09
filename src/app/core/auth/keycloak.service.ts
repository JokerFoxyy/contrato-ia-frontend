import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloak: Keycloak | null = null;
  private initialized = false;

  private getOrCreate(): Keycloak {
    if (!this.keycloak) {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });
    }
    return this.keycloak;
  }

  /**
   * Inicializa o Keycloak verificando se já há sessão ativa.
   * Chamado apenas quando o usuário interage com a tela de login.
   */
  async initAndCheck(): Promise<boolean> {
    const kc = this.getOrCreate();
    try {
      const authenticated = await kc.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });
      this.initialized = true;
      return authenticated;
    } catch {
      return false;
    }
  }

  login(): void {
    this.getOrCreate().login();
  }

  logout(): void {
    this.keycloak?.logout({ redirectUri: window.location.origin });
  }

  async getToken(): Promise<string> {
    const kc = this.getOrCreate();
    await kc.updateToken(30);
    return kc.token!;
  }

  isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }

  getUserProfile() {
    return {
      id: this.keycloak?.subject,
      email: this.keycloak?.tokenParsed?.['email'] as string | undefined,
      name: this.keycloak?.tokenParsed?.['name'] as string | undefined,
    };
  }
}
