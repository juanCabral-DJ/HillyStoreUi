import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { SettingsService } from '../../../../core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, AnimateOnScroll],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly settingsService = inject(SettingsService);
  protected readonly settings = this.settingsService.settings;
}
