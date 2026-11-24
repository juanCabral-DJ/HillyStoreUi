import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { ApiClient } from '../../../../core/api';
import { HomeCategoryCard } from '../../../../shared/contracts';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, Button, Skeleton],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly api = inject(ApiClient);

  readonly categories = signal<HomeCategoryCard[]>([]);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading.set(true);
    this.api.getCategories().subscribe({
      next: (cats) => {
        const activeCats = (cats || [])
          .filter((c) => c.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        // Máximo 8 categorías en total para el Home (en móvil se restringen a 4 vía CSS responsive)
        const cards: HomeCategoryCard[] = activeCats.slice(0, 8).map((cat) => ({
          id: cat.id,
          title: cat.name,
          subtitle: cat.usesSizes
            ? 'Colección disponible con variedad de tallas'
            : 'Prendas, accesorios y artículos boutique',
          slug: cat.slug,
          routeQuery: { categoria: cat.slug },
          imageUrl: cat.imageUrl || '/hero.png',
          badge: cat.usesSizes ? 'En Stock' : 'Boutique',
        }));

        this.categories.set(cards);
        this.loading.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loading.set(false);
      },
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/hero.png';
  }
}
