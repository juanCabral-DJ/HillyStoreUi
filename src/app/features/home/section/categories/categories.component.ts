import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeCategoryCard } from '../../../../shared/contracts';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  readonly categories = signal<HomeCategoryCard[]>([
    {
      id: 'mujeres',
      title: 'Moda Femenina',
      subtitle: 'Vestidos, blusas, tops, jeans y enterizos en tendencia.',
      slug: 'mujeres',
      routeQuery: { publico: 'Mujeres' },
      imageUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      badge: 'Tendencia',
    },
    {
      id: 'hombres',
      title: 'Moda Masculina',
      subtitle: 'Camisas de lino, polos piqué, t-shirts y bermudas casuales.',
      slug: 'hombres',
      routeQuery: { publico: 'Hombres' },
      imageUrl:
        'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      badge: 'Esenciales',
    },
    {
      id: 'accesorios',
      title: 'Accesorios',
      subtitle: 'Carteras, bolsos de mano, lentes de sol y complementos boutique.',
      slug: 'accesorios',
      routeQuery: { categoria: 'accesorios' },
      imageUrl:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      badge: 'Boutique',
    },
    {
      id: 'colonias',
      title: 'Colonias & Splashes',
      subtitle: 'Fragancias importadas, aromas florales, dulces y frescos.',
      slug: 'colonias',
      routeQuery: { categoria: 'colonias' },
      imageUrl:
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      badge: 'Favoritos',
    },
  ]);

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80';
  }
}
