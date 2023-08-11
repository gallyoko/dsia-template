import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FORMAT_NOK } from '../../../shared/const';
import { CSVFileProgress, TTfile } from './model/cvs-file-progress.entity';

@Component({
  selector: 'lib-dialog-import-csv',
  templateUrl: './dialog-import-csv.component.html',
  styleUrls: ['./dialog-import-csv.component.scss'],
})
export class DialogImportCSVComponent {
  fileData: ArrayBuffer | string = '';
  fileToUpload: File;
  fileNameMatcher: RegExp;
  public notification: string;
  public iconNotification: string;

  constructor(public dialogRef: MatDialogRef<DialogImportCSVComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fileNameMatcher = data.matcher;
    this.notification = data.notification || '';
    this.iconNotification = data.iconNotification || null;
  }

  annuler() {
    this.dialogRef.close(false);
  }

  ok() {
    const requestParams = new TTfile();
    requestParams.fichier = new CSVFileProgress();
    requestParams.fichier.nomFichier = this.fileToUpload.name;
    requestParams.fichier.contenu = this.fileData;
    // Fermeture du fichier et envoi de la réponse
    this.dialogRef.close(requestParams);
  }

  /**
   * Sélection et encodage en base 64 des datas du fichier à la réception de l'événement
   * @param file : File
   */
  onFileSelected(file: File) {
    this.fileToUpload = file;
    const reader = new FileReader();
    if (this.fileToUpload && this.fileToUpload.name.match(this.fileNameMatcher)) {
      reader.onload = (eventProgress: ProgressEvent) => {
        this.fileData = (eventProgress.target as FileReader).result;
      };
      reader.readAsDataURL(this.fileToUpload);
    } else {
      this.fileToUpload = null;
      this.dialogRef.close(FORMAT_NOK);
    }
  }
}
