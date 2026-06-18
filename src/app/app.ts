import { Component, inject, signal } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('FrontedFulltank');
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'es']);
    const saved = localStorage.getItem('fulltank.lang');
    const lang = saved === 'es' || saved === 'en' ? saved : 'en';
    this.translate.use(lang);
  }
}
