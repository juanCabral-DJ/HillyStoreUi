import { Component, OnInit, inject } from '@angular/core';
import { SeoService } from '../../core';
import { HeroComponent } from './section/hero/hero.component';
import { SheinStepsComponent } from './section/shein-steps/shein-steps.component';
import { StockCarouselComponent } from './section/stock-carousel/stock-carousel.component';
import { CategoriesComponent } from './section/categories/categories.component';
import { DeliveryInfoComponent } from './section/delivery-info/delivery-info.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    SheinStepsComponent,
    StockCarouselComponent,
    CategoriesComponent,
    DeliveryInfoComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageSeo({
      title: 'HillyStore · Tienda de ropa en Baní y Pedidos Shein',
      description:
        'Tienda de ropa en Baní, República Dominicana. Realiza pedidos de Shein con solo 50% de anticipo o compra en nuestro catálogo en stock.',
      canonicalPath: '/',
    });
  }
}
