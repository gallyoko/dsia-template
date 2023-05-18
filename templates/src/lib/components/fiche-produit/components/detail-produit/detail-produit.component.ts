import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Tab } from '@dsia/wms-common';
import { User } from '@lap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ResizeContainer } from '../../../../services/resize-container';
import { Produit } from '../../model/produit.model';
import { ListeProduitService } from '../../services/liste-produit.service';
import { ListeSupportService } from '../../services/liste-support.service';

@Component({
  selector: 'lib-detail-produit',
  templateUrl: './detail-produit.component.html',
  styleUrls: ['../../../../../assets/style/detail-n1.component.scss', './detail-produit.component.scss'],
})
export class DetailProduitComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() tabList: Tab[] = [];
  @Input() user: User;
  @Input() codeProduit: string;

  private readonly destroy$: Subject<void> = new Subject();
  private resizeContainer: ResizeContainer;
  private previousCodeProduit: string;

  public selectedIndex = 0;
  public hideButtonAction = true;
  public tabsDetailSupport: Tab[] = [];
  public modeDetailSupport = false;
  public listeSupportClosed = false;
  public uniqIdSupport: string;
  public isLoading = false;
  public produit: Produit;

  constructor(
    private readonly listeProduitService: ListeProduitService,
    private readonly listeSupportService: ListeSupportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tabList.forEach(element => (element['disabled'] = false));
    this.listeSupportService.currentCodeSupport = null;
    this.tabsDetailSupport = this.listeSupportService.context.tabs;

    this.selectedIndex = this.listeProduitService.selectedIndex || 0;

    this.cdr.detectChanges();

    this.listeProduitService.hideButtonActionDetail$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hide: boolean) => (this.hideButtonAction = hide));

    this.listeProduitService.detailProduitOpen$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListeSupport());

    this.listeSupportService.detailLigneSupportClose$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListeSupport());
  }

  ngOnDestroy(): void {
    this.resizeContainer.stopListener();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.codeProduit) {
      this.showDetail();
    }
  }

  ngAfterViewInit(): void {
    this.resizeContainer = new ResizeContainer('drawerLeftListeSupport', 'drawerRightListeSupport', 8);
  }

  public showDetail(): void {
    if (this.selectedIndex <= 2 && this.previousCodeProduit !== this.codeProduit) {
      this.previousCodeProduit = this.codeProduit;

      if (this.selectedIndex !== 0) {
        this.isLoading = true;
      }

      this.listeProduitService
        .getDetail(this.user.context['idsite'], this.user.context['do'], this.codeProduit)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (detail: Produit) => {
            this.produit = detail;
            this.isLoading = false;
          },
          () => (this.isLoading = false)
        );
    }
  }

  public closeDetailListeProduit(): void {
    this.selectedIndex = 0;
    this.listeProduitService.selectedIndex = 0;
    this.listeProduitService.closeDetail$.next(true);
    this.listeSupportService.currentCodeSupport = null;
    this.listeSupportService.currentRowSelect = null;
    this.listeSupportService.currentListeSupport = [];
    this.listeSupportService.detailLigneSupportOpen = false;
  }

  public selectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.listeProduitService.selectedIndex = index;
    if (this.listeProduitService.selectedIndex !== 0) {
      this.listeSupportService.currentCodeSupport = null;
      this.listeSupportService.currentRowSelect = null;
      this.listeSupportService.currentListeSupport = [];
    }

    this.showDetail();
  }

  public export(): void {
    if (this.selectedIndex === 0) {
      this.listeSupportService.exportLignesSupport$.next();
    }
  }

  public showHideColumn(): void {
    if (this.selectedIndex === 0) {
      this.listeSupportService.showHideColumnLignesSupport$.next();
    }
  }

  public showDetailListeSupport(uniqIdSupport: string): void {
    this.resizeContainer.startListener();
    this.modeDetailSupport = true;
    this.uniqIdSupport = uniqIdSupport;
    this.tabList.forEach(element => {
      if (element.order > 1) {
        element['disabled'] = true;
      }
    });
  }

  public closeListeSupport(): void {
    this.listeSupportClosed = true;
    this.listeSupportService.ligneSupportClose$.next();
  }

  public openListeSupport(): void {
    this.listeSupportClosed = false;
    this.listeSupportService.ligneSupportOpen$.next();
  }

  public closeDetailListeSupport(): void {
    this.modeDetailSupport = false;
    this.listeSupportClosed = false;
    this.tabList.forEach(element => (element['disabled'] = false));
  }
}
