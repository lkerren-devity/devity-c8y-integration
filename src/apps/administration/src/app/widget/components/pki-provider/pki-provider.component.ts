import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PKIProvider } from '~models/pki-provider.model';
import { KeynoaService } from '~services/keynoa.service';
import { DevityAdminPKIProviderModalComponent } from '../admin-pki-provider-modal/admin-pki-provider-modal.component';
import { DevityCertificateAuthorityModalComponent } from '../certificate-authority-modal/certificate-authority-modal.component';

@Component({
  selector: 'devity-pki-provider',
  templateUrl: './pki-provider.component.html',
  standalone: false
})
export class DevityPKIProviderComponent implements OnInit {
  providers?: PKIProvider[];
  isLoading = true;
  id: string | number;

  // get providerHasCA(): boolean {
  //   if (!this.id || !this.providers) return false;

  //   const pki = this.providers.find((pki) => pki.id === this.id);

  //   if (!pki) return false;

  //   return has(pki, 'caId') && !!pki['caId'];
  // }

  constructor(
    private bdModalService: BsModalService,
    private keynoaService: KeynoaService,
    router: Router
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const regex = /^\/auth-configuration\/pki-provider\/([0-9]*)/;
        const match = event.url.match(regex);

        this.id = match && match[1] ? match[1] : null;
      }
    });
  }

  ngOnInit(): void {
    void this.reload();
  }

  async delete(provider: PKIProvider): Promise<void> {
    this.isLoading = true;
    await this.keynoaService.delete(provider.id);
    this.isLoading = false;

    await this.reload();
  }

  openCAModal(): void {
    let provider: PKIProvider;
    if (this.id) {
      provider = this.providers.find((pki) => pki.id === this.id);
    }

    const modalRef = this.bdModalService.show(
      DevityCertificateAuthorityModalComponent,
      {
        initialState: {
          pkiProvider: provider,
        },
        class: 'modal-xs',
      }
    );

    modalRef.onHide.subscribe(() => this.reload());
  }

  openPKIModal(provider?: PKIProvider): void {
    const modalRef = this.bdModalService.show(
      DevityAdminPKIProviderModalComponent,
      {
        initialState: {
          pkiProvider: provider,
        },
      }
    );

    modalRef.onHide.subscribe(() => this.reload());
  }

  async reload(): Promise<void> {
    this.isLoading = true;

    try {
      this.providers = await this.keynoaService.list();
    } catch (error) {
      console.error(error);
    }

    this.isLoading = false;
  }
}
