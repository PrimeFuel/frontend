import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CatalogStore } from '../../../application/catalog.store';
import { EquipmentStore } from '../../../../equipment/application/equipment.store';
import { CoordinationService } from '../../../../shared/application/coordination.service';
import { CatalogProduct } from '../../../domain/model/catalog-product.entity';
import { Equipment } from '../../../../equipment/domain/model/equipment.entity';
import { IamStore } from '../../../../iam/application/iam.store';
import { NotificationsFacade } from '../../../../shared/application/notifications.facade';
import { fuelLabel } from '../../../../shared/domain/model/view-helpers';

@Component({
  selector: 'app-provider-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './provider-detail.html',
  styleUrl: './provider-detail.css',
})
export class ProviderDetail implements OnInit {
  protected readonly catalogStore = inject(CatalogStore);
  protected readonly equipmentStore = inject(EquipmentStore);
  private readonly coordinationService = inject(CoordinationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly iam = inject(IamStore);
  private readonly notifications = inject(NotificationsFacade);

  selectedProduct = signal<CatalogProduct | null>(null);
  showRequestPanel = signal(false);
  hoveredRating = signal(0);

  requestForm: FormGroup = this.fb.group({
    equipmentId: [null],
    quantity: [100, [Validators.required, Validators.min(1)]],
    deliveryAddress: ['', Validators.required],
    desiredDeliveryDate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.catalogStore.loadProviderById(id);
    });
    this.equipmentStore.loadAll();
  }

  back(): void {
    this.router.navigate(['/catalog']);
  }

  requestFuel(product: CatalogProduct): void {
    this.selectedProduct.set(product);
    this.showRequestPanel.set(true);
    const defaultDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    this.requestForm.reset({
      equipmentId: null,
      quantity: 100,
      deliveryAddress: '',
      desiredDeliveryDate: defaultDate,
    });
  }

  closeRequestPanel(): void {
    this.showRequestPanel.set(false);
    this.selectedProduct.set(null);
  }

  getCompatibleEquipment(): Equipment[] {
    const product = this.selectedProduct();
    if (!product) return this.equipmentStore.equipmentList();
    return this.equipmentStore.equipmentList().filter(
      (e) => e.requiredFuelType === product.fuelType,
    );
  }

  getSelectedEquipment(): Equipment | undefined {
    const id = this.requestForm.get('equipmentId')?.value;
    return this.equipmentStore.equipmentList().find((e) => e.id === String(id));
  }

  getQuantityError(): string | null {
    const product = this.selectedProduct();
    const equipment = this.getSelectedEquipment();
    const quantity = this.requestForm.get('quantity')?.value;
    if (product?.stock !== undefined && quantity > product.stock) {
      return `Cantidad excede el stock disponible (${product.stock} L)`;
    }
    if (equipment && quantity > equipment.remainingCapacity) {
      return `Cantidad excede la capacidad restante del equipo (${equipment.remainingCapacity} ${equipment.unit})`;
    }
    return null;
  }

  get estimatedTotal(): number {
    const product = this.selectedProduct();
    const quantity = Number(this.requestForm.get('quantity')?.value ?? 0);
    return product ? quantity * product.pricePerLiter : 0;
  }

  get selectedEquipmentLabel(): string {
    return this.getSelectedEquipment()?.name ?? 'No seleccionado';
  }

  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const product = this.selectedProduct();
    if (!product) return;

    const quantityError = this.getQuantityError();
    if (quantityError) {
      this.snackBar.open(quantityError, 'OK', { duration: 5000 });
      return;
    }

    const formValue = this.requestForm.value;
    const provider = this.catalogStore.selectedProvider();

    this.coordinationService
      .createFuelRequest({
        providerId: Number(product.providerId),
        productId: Number(product.id),
        equipmentId: formValue.equipmentId ? Number(formValue.equipmentId) : null,
        quantity: formValue.quantity,
        fuelType: product.fuelType,
        productName: product.name,
        unitPrice: product.pricePerLiter,
        deliveryAddress: formValue.deliveryAddress,
        desiredDeliveryDate: formValue.desiredDeliveryDate,
      })
      .subscribe({
        next: (request) => {
          this.notifications.notifyBuyer(
            this.iam.currentCompanyId(),
            'REQUEST_PENDING',
            'Solicitud pendiente',
            `Tu solicitud de ${product.name} fue enviada y esta pendiente de aprobacion.`,
            request?.id,
          );
          this.notifications.notifyProvider(
            product.providerId,
            'NEW_REQUEST',
            'Nueva solicitud de combustible',
            `${this.iam.companyName()} solicito ${formValue.quantity} L de ${product.name}.`,
            request?.id,
          );
          this.snackBar.open('Solicitud enviada exitosamente', 'OK', { duration: 4000 });
          this.closeRequestPanel();
        },
        error: (err) => {
          this.snackBar.open('Error al enviar solicitud: ' + err.message, 'OK', { duration: 5000 });
        },
      });
  }

  /**
   * Fuel-type labels mirror the inventory vocabulary (Gasohol 84/90/95/97,
   * Diesel B5, …) via the shared helper, so the catalog never shows a raw enum
   * code like `GASOLINE_84` nor an out-of-sync translation.
   */
  getFuelTypeLabel(type: string): string {
    return fuelLabel(type);
  }

  getFuelTypeClass(type: string): string {
    const map: Record<string, string> = {
      DIESEL: 'fuel-diesel',
      GASOLINE_90: 'fuel-g90',
      GASOLINE_95: 'fuel-g95',
      GASOLINE_97: 'fuel-g97',
    };
    return map[type] ?? 'fuel-default';
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  get currentRating(): number {
    const provider = this.catalogStore.selectedProvider();
    const companyId = this.iam.currentCompanyId();
    return provider && companyId
      ? this.catalogStore.ratingForBuyer(companyId, Number(provider.id))
      : 0;
  }

  get displayedRating(): number {
    return this.hoveredRating() || this.currentRating;
  }

  rateProvider(value: number): void {
    const provider = this.catalogStore.selectedProvider();
    const companyId = this.iam.currentCompanyId();
    if (!provider || !companyId) return;
    this.catalogStore.rateProvider(companyId, Number(provider.id), value);
    this.snackBar.open('Valoracion guardada', 'OK', { duration: 2500 });
  }
}



