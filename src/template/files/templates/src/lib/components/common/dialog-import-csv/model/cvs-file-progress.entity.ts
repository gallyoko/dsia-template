export class TTfile {
  fichier: CSVFileProgress;

  constructor() {
    this.fichier = new CSVFileProgress();
  }
}

export class CSVFileProgress {
  nomFichier: string;
  contenu: ArrayBuffer | string;

  constructor(csvFileProgress?: CSVFileProgress) {
    if (csvFileProgress) {
      this.nomFichier = csvFileProgress.nomFichier || '';
      this.contenu = csvFileProgress.contenu || '';
    }
  }
}
