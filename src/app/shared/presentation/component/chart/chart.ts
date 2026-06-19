import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Thin, reusable Chart.js wrapper. Pass a Chart.js `config` and it renders /
 * re-renders on change. Used by dashboards and reporting views so chart wiring
 * lives in one place (shared) instead of being copy-pasted per context.
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`:host { display: block; position: relative; width: 100%; height: 100%; } canvas { max-width: 100%; }`],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() config!: ChartConfiguration;

  private chart: Chart | null = null;
  private ready = false;

  ngAfterViewInit(): void {
    this.ready = true;
    this.render();
  }

  ngOnChanges(): void {
    if (this.ready) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.config || !this.canvas) return;
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, this.config);
  }
}
