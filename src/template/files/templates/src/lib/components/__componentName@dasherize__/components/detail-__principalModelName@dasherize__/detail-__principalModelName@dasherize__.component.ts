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
import { <%= classify(principalModelName) %> } from '../../model/<%= dasherize(principalModelName) %>.model';
import { Liste<%= classify(principalModelName) %>Service } from '../../services/liste-<%= dasherize(principalModelName) %>.service';
import { Liste<%= classify(secondModelName) %>Service } from '../../services/liste-<%= dasherize(secondModelName) %>.service';

@Component({
  selector: 'lib-detail-<%= dasherize(principalModelName) %>',
  templateUrl: './detail-<%= dasherize(principalModelName) %>.component.html',
  styleUrls: ['../../../../../assets/style/detail-n1.component.scss', './detail-<%= dasherize(principalModelName) %>.component.scss'],
})
export class Detail<%= classify(principalModelName) %>Component implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() tabList: Tab[] = [];
  @Input() user: User;
  @Input() <%= camelize(principalModelKey) %>: string;

  private readonly destroy$: Subject<void> = new Subject();
  private resizeContainer: ResizeContainer;
  private previous<%= classify(principalModelKey) %>: string;

  public selectedIndex = 0;
  public hideButtonAction = true;
  public tabsDetail<%= classify(secondModelName) %>: Tab[] = [];
  public modeDetail<%= classify(secondModelName) %> = false;
  public liste<%= classify(secondModelName) %>Closed = false;
  public uniqId<%= classify(secondModelName) %>: string;
  public isLoading = false;
  public <%= camelize(principalModelName) %>: <%= classify(principalModelName) %>;

  constructor(
    private readonly liste<%= classify(principalModelName) %>Service: Liste<%= classify(principalModelName) %>Service,
    private readonly liste<%= classify(secondModelName) %>Service: Liste<%= classify(secondModelName) %>Service,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tabList.forEach(element => (element['disabled'] = false));
    this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
    this.tabsDetail<%= classify(secondModelName) %> = this.liste<%= classify(secondModelName) %>Service.context.tabs;

    this.selectedIndex = this.liste<%= classify(principalModelName) %>Service.selectedIndex || 0;

    this.cdr.detectChanges();

    this.liste<%= classify(principalModelName) %>Service.hideButtonActionDetail$
      .pipe(takeUntil(this.destroy$))
      .subscribe((hide: boolean) => (this.hideButtonAction = hide));

    this.liste<%= classify(principalModelName) %>Service.detail<%= classify(principalModelName) %>Open$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListe<%= classify(secondModelName) %>());

    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Close$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetailListe<%= classify(secondModelName) %>());
  }

  ngOnDestroy(): void {
    this.resizeContainer.stopListener();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.<%= camelize(principalModelKey) %>) {
      this.showDetail();
    }
  }

  ngAfterViewInit(): void {
    this.resizeContainer = new ResizeContainer('drawerLeftListe<%= classify(secondModelName) %>', 'drawerRightListe<%= classify(secondModelName) %>', 8);
  }

  public showDetail(): void {
    if (this.selectedIndex <= 2 && this.previous<%= classify(principalModelKey) %> !== this.<%= camelize(principalModelKey) %>) {
      this.previous<%= classify(principalModelKey) %> = this.<%= camelize(principalModelKey) %>;

      if (this.selectedIndex !== 0) {
        this.isLoading = true;
      }

      this.liste<%= classify(principalModelName) %>Service
        .getDetail(this.user.context['idsite'], this.user.context['do'], this.<%= camelize(principalModelKey) %>)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (detail: <%= classify(principalModelName) %>) => {
            this.<%= camelize(principalModelName) %> = detail;
            this.isLoading = false;
          },
          () => (this.isLoading = false)
        );
    }
  }

  public closeDetailListe<%= classify(principalModelName) %>(): void {
    this.selectedIndex = 0;
    this.liste<%= classify(principalModelName) %>Service.selectedIndex = 0;
    this.liste<%= classify(principalModelName) %>Service.closeDetail$.next(true);
    this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
    this.liste<%= classify(secondModelName) %>Service.currentRowSelect = null;
    this.liste<%= classify(secondModelName) %>Service.currentListe<%= classify(secondModelName) %> = [];
    this.liste<%= classify(secondModelName) %>Service.detailLigne<%= classify(secondModelName) %>Open = false;
  }

  public selectedIndexChange(index: number): void {
    this.selectedIndex = index;
    this.liste<%= classify(principalModelName) %>Service.selectedIndex = index;
    if (this.liste<%= classify(principalModelName) %>Service.selectedIndex !== 0) {
      this.liste<%= classify(secondModelName) %>Service.current<%= classify(secondModelKey) %> = null;
      this.liste<%= classify(secondModelName) %>Service.currentRowSelect = null;
      this.liste<%= classify(secondModelName) %>Service.currentListe<%= classify(secondModelName) %> = [];
    }

    this.showDetail();
  }

  public export(): void {
    if (this.selectedIndex === 0) {
      this.liste<%= classify(secondModelName) %>Service.exportLignes<%= classify(secondModelName) %>$.next();
    }
  }

  public showHideColumn(): void {
    if (this.selectedIndex === 0) {
      this.liste<%= classify(secondModelName) %>Service.showHideColumnLignes<%= classify(secondModelName) %>$.next();
    }
  }

  public showDetailListe<%= classify(secondModelName) %>(uniqId<%= classify(secondModelName) %>: string): void {
    this.resizeContainer.startListener();
    this.modeDetail<%= classify(secondModelName) %> = true;
    this.uniqId<%= classify(secondModelName) %> = uniqId<%= classify(secondModelName) %>;
    this.tabList.forEach(element => {
      if (element.order > 1) {
        element['disabled'] = true;
      }
    });
  }

  public closeListe<%= classify(secondModelName) %>(): void {
    this.liste<%= classify(secondModelName) %>Closed = true;
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Close$.next();
  }

  public openListe<%= classify(secondModelName) %>(): void {
    this.liste<%= classify(secondModelName) %>Closed = false;
    this.liste<%= classify(secondModelName) %>Service.ligne<%= classify(secondModelName) %>Open$.next();
  }

  public closeDetailListe<%= classify(secondModelName) %>(): void {
    this.modeDetail<%= classify(secondModelName) %> = false;
    this.liste<%= classify(secondModelName) %>Closed = false;
    this.tabList.forEach(element => (element['disabled'] = false));
  }
}
