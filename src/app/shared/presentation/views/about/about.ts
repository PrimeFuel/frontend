import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * @summary Vista "Acerca de" de FullTank.
 * @remarks Muestra información institucional sobre la plataforma FullTank
 * y el equipo PrimeFuel. Utiliza ngx-translate para mostrar el contenido
 * en el idioma seleccionado. No contiene lógica de negocio.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-about',
  imports: [TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
