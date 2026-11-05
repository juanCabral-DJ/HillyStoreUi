import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../../core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.scss',
})
export class PublicFooterComponent {
  protected readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.settings;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly hasSocials = computed(() => {
    const s = this.settings();
    return Boolean(s.instagramUrl || s.facebookUrl || s.tiktokUrl);
  });
}
