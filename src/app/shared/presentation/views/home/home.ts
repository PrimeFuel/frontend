import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {Toolbar} from '../../component/toolbar/toolbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Toolbar, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
