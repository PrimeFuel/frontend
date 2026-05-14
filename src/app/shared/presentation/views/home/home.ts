import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Toolbar } from '../../component/toolbar/toolbar';

/**
 * @summary Vista de inicio (Home) de FullTank.
 * @remarks Página de bienvenida pública que presenta la plataforma FullTank
 * a visitantes no autenticados. Incluye el toolbar, sección de autenticación
 * y una imagen hero. Utiliza ngx-translate para soporte multiidioma.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Toolbar, TranslatePipe, RouterModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
