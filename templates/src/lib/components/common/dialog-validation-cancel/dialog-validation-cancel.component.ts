import { Component, Inject } from '@angular/core';
import { DialogValidationCancelData } from './validation-cancel-dialog-data.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'lib-dialog-validation-cancel',
  templateUrl: './dialog-validation-cancel.component.html',
  styleUrls: ['./dialog-validation-cancel.component.scss'],
})
export class ReverseDialogValidationCancelComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DialogValidationCancelData = {}
  ) {}
}
