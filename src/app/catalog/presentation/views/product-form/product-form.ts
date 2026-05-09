import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { CatalogStore } from '../../../application/catalog.store';
import { CreateProductCommand } from '../../../domain/model/create-product.command';
import { UpdateProductCommand } from '../../../domain/model/update-product.command';

/**
 * @summary Formulario para crear y editar productos de combustible.
 * @remarks Maneja creación y actualización según presencia de productId en ruta.
 * Valida campos obligatorios y formatos numéricos.
 * @author FullTank Platform
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  protected readonly store = inject(CatalogStore);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected productForm!: FormGroup;
  protected isEditMode = false;
  protected productId: string | null = null;

  protected readonly fuelTypes = [
    { value: 'DIESEL', label: 'fuel-type.diesel' },
    { value: 'GASOLINE_90', label: 'fuel-type.gasoline_90' },
    { value: 'GASOLINE_95', label: 'fuel-type.gasoline_95' },
    { value: 'GASOLINE_97', label: 'fuel-type.gasoline_97' },
  ];

  protected readonly units = [
    { value: 'LITERS', label: 'unit.liters' },
    { value: 'GALLONS', label: 'unit.gallons' },
  ];

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    this.initForm();

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      pricePerLiter: [0, [Validators.required, Validators.min(0.01)]],
      unit: ['LITERS', Validators.required],
      isActive: [true],
    });
  }

  private loadProduct(productId: string): void {
    this.store.loadProductById(productId);

    // Esperar a que el producto se cargue y poblar el formulario
    setTimeout(() => {
      const product = this.store.selectedProduct();
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          type: product.type,
          description: product.description,
          pricePerLiter: product.pricePerLiter,
          unit: product.unit,
          isActive: product.isActive,
        });
      }
    }, 500);
  }

  protected onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.productId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct(): void {
    const command: CreateProductCommand = {
      name: this.productForm.value.name,
      type: this.productForm.value.type,
      description: this.productForm.value.description,
      pricePerLiter: this.productForm.value.pricePerLiter,
      unit: this.productForm.value.unit,
    };

    this.store.createProduct(command, () => {
      this.router.navigate(['../product-inventory'], { relativeTo: this.route });
    });
  }

  private updateProduct(): void {
    if (!this.productId) return;

    const command: UpdateProductCommand = {
      productId: this.productId,
      name: this.productForm.value.name,
      type: this.productForm.value.type,
      description: this.productForm.value.description,
      pricePerLiter: this.productForm.value.pricePerLiter,
      unit: this.productForm.value.unit,
      isActive: this.productForm.value.isActive,
    };

    this.store.updateProduct(this.productId, command, () => {
      this.router.navigate(['../../product-inventory'], { relativeTo: this.route });
    });
  }

  protected onCancel(): void {
    const path = this.isEditMode ? '../../product-inventory' : '../product-inventory';
    this.router.navigate([path], { relativeTo: this.route });
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length: ${field.errors['minlength'].requiredLength}`;
    if (field.errors['min']) return `Minimum value: ${field.errors['min'].min}`;

    return '';
  }
}
