import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SettingsService } from '../../core';
import { PublicFooterComponent } from './public-footer/public-footer.component';
import { PublicHeaderComponent } from './public-header/public-header.component';
import { WhatsappFabComponent } from './whatsapp-fab/whatsapp-fab.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    PublicHeaderComponent,
    PublicFooterComponent,
    WhatsappFabComponent,
  ],
  providers: [MessageService],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
})
export class PublicShellComponent
 implements OnInit {
  private readonly settingsService = inject(SettingsService);

  ngOnInit(): void {
    this.settingsService.load().subscribe();
  }
}
