import { APP_BASE_HREF } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { DsiaFileUploaderModule } from '@dsia/file-uploader';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { AppModule } from 'src/app/app.module';
import { DialogImportCSVComponent } from './dialog-import-csv.component';

describe('DialogImportCSVComponent', () => {
  let component: DialogImportCSVComponent;
  let fixture: ComponentFixture<DialogImportCSVComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        RouterTestingModule,
        TranslateModule.forChild(),
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatToolbarModule,
        MatDialogModule,
        DsiaFileUploaderModule,
        MatButtonModule,
      ],
      declarations: [DialogImportCSVComponent],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {
              console.log('Fake close method');
            },
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            matcher: /\w+/g,
          },
        },
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogImportCSVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should call 'dialogRef.close' on 'onFileSelected' without file", () => {
    const dialogRefCloseSpy = spyOn(component.dialogRef, 'close');

    component.onFileSelected(null);

    fixture.detectChanges();

    expect(component.fileToUpload).toBeNull();
    expect(dialogRefCloseSpy).toHaveBeenCalledWith('FORMAT_NOK');
  });
});
