import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { APP_BASE_HREF } from '@angular/common';
import { ReverseDialogValidationCancelComponent } from './dialog-validation-cancel.component';
import { FicheDeBaseModule } from '../../fiche-de-base.module';

describe('DialogValidationCancelComponent', () => {
  let component: ReverseDialogValidationCancelComponent;
  let fixture: ComponentFixture<ReverseDialogValidationCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReverseDialogValidationCancelComponent],
      imports: [AppModule, FicheDeBaseModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverseDialogValidationCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
