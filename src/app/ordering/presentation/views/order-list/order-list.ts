import { AfterViewChecked, Component, computed, inject, ViewChild } from '@angular/core';
import { OrderingStore } from '../../../application/ordering.store';
import { Router } from '@angular/router';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-list',
  imports: [
    DecimalPipe,
    TranslatePipe,
    MatProgressSpinner,
    MatError,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatSortHeader,
    MatCellDef,
    MatIconButton,
    MatIcon,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatChip,
    MatChipSet,
    MatTooltip,
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList implements AfterViewChecked {

  ngAfterViewChecked(): void {
    if (this.dataSource().paginator !== this.paginator) {
      this.dataSource().paginator = this.paginator;
    }
    if (this.dataSource().sort !== this.sort) {
      this.dataSource().sort = this.sort;
    }
  }

  readonly store = inject(OrderingStore);
  protected router = inject(Router);

  displayedColumns: string[] = ['id', 'requestId', 'quantity', 'totalAmount', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.orders());
    source.sort = this.sort;
    source.paginator = this.paginator;
    return source;
  });

  viewOrder(id: string) {
    this.router.navigate(['/ordering/order-detail', id]).then();
  }

  deleteOrder(id: string) {
    this.store.deleteOrder(id);
  }

  shortId(id: string): string {
    return id.length > 8 ? `${id.substring(0, 8)}…` : id;
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

}
