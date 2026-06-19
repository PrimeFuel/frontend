import { AfterViewChecked, Component, computed, inject, ViewChild } from '@angular/core';
import { OrderingStore } from '../../../application/ordering.store';
import { Router } from '@angular/router';
import { Request } from '../../../domain/model/request.entity';
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-request-list',
  imports: [
    DatePipe,
    FormsModule,
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
    MatButton,
    MatChip,
    MatChipSet,
    MatTooltip,
  ],
  templateUrl: './request-list.html',
  styleUrl: './request-list.css',
})
export class RequestList implements AfterViewChecked {

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

  displayedColumns: string[] = ['id', 'productId', 'quantity', 'desiredDeliveryDate', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.pendingRequests());
    source.sort = this.sort;
    source.paginator = this.paginator;
    return source;
  });

  rejectingRequestId: string | null = null;
  rejectionReason = '';

  navigateToNew() {
    this.router.navigate(['/ordering/request-form']).then();
  }

  acceptRequest(request: Request) {
    this.store.acceptRequest(request);
  }

  denyRequest(request: Request) {
    this.store.deleteRequest(request.id);
  }

  deleteRequest(id: string) {
    this.store.deleteRequest(id);
  }

  shortId(id: string): string {
    return id.length > 8 ? `${id.substring(0, 8)}…` : id;
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

}
