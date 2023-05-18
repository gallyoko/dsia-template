import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Criteria, CriteriaFormControl } from '@dsia/criteria';
import { DsiaInputsService } from '@dsia/inputs';
import { MenuItem, MenuNavigationService } from '@dsia/menu-navigation';
import { NavigationRetourService } from '@dsia/navigation-retour';
import { Level, NotificationsService, Type } from '@dsia/notifications';
import { ContextService, Header, Tab, TypeContext } from '@dsia/wms-common';
import { User, UserService } from '@lap';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ResizeContainer } from '../../../../services/resize-container';
import { FONCTION_GENERIC, TIMER_NOTIFICATION } from '../../../../shared/const';
import { ListeProduitService } from '../../services/liste-produit.service';
import { ListeSupportService } from '../../services/liste-support.service';
import { FicheProduitService } from '../../services/fiche-produit.service';
import { ListeAideService } from './../../../../services/liste-aide.service';

@Component({
  selector: 'lib-main-fiche-produit',
  templateUrl: './main-fiche-produit.component.html',
  styleUrls: [
    '../../../../../assets/style/main.component.scss',
    './main-fiche-produit.component.scss',
  ],
})
export class MainFicheProduitComponent implements OnInit, OnDestroy {
  
  

  private readonly destroy$: Subject<void> = new Subject();
  private user: User;
  private resizeContainer: ResizeContainer;

  public isLoading = false;
  public messageNotification = '';
  public isCriteriaLoaded = false;

  public canBeLoaded = false;
  public criteria: Array<Criteria> = new Array<Criteria>();
  public requiredCriteria: Array<Criteria> = new Array<Criteria>();
  public advancedCriteria: Array<Criteria> = new Array<Criteria>();
  public criteriaControls: Array<CriteriaFormControl> = new Array<CriteriaFormControl>();

  public arrayHeader: Header[] = [];
  public tabs: Tab[] = [];
  public codeProduit: string;

  public modeDetail = false;
  public listeProduitClosed = false;

  
    public fromLinkLevel1 = false;
    public fromLinkLevel2 = false;
  
  public criteriaDisabled = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationsService,
    private readonly translate: TranslateService,
    private readonly contextService: ContextService,
    private readonly userService: UserService,
    private readonly ficheProduitService: FicheProduitService,
    private readonly listeAideService: ListeAideService,
    private readonly inputsService: DsiaInputsService,
    private readonly listeProduitService: ListeProduitService,
    private readonly listeSupportService: ListeSupportService,
    private readonly menuNavigationService: MenuNavigationService,
    private readonly navigationRetourService: NavigationRetourService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.initComponent();

    this.listeProduitService.closeDetail$.pipe(takeUntil(this.destroy$)).subscribe(() => this.closeDetail());
    this.listeProduitService.detailLigneProduitClose$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.listeProduitClosed = true));
    this.listeProduitService.detailLigneProduitOpen$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.listeProduitClosed = false));
    this.ficheProduitService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading: boolean) => (this.isLoading = isLoading));

    /* clic sur le menu de la fonction pour réinitialiser l'écran */
    this.menuNavigationService.beforeNavigateToSource.pipe(takeUntil(this.destroy$)).subscribe((menuItem: MenuItem) => {
      this.navigationRetourService.clearPileNavigationList();
      if (this.router.url.startsWith(menuItem.link)) {
        this.initComponent(true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.resizeContainer) {
      this.resizeContainer.stopListener();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  private initComponent(clear = false): void {
    
    this.fromLinkLevel1 = false;
    this.fromLinkLevel2 = false;
    
    this.isCriteriaLoaded = false;
    this.canBeLoaded = false;
    this.criteriaDisabled = false;
    this.modeDetail = false;
    this.criteriaControls = new Array<CriteriaFormControl>();
    
    this.navigationRetourService.initPileNavigation(FONCTION_GENERIC);
    
    this.route.queryParams.pipe(take(1)).subscribe((params: Params) => {
      
      if (!clear) {
        this.fromLinkLevel1 = !!params['fromLinkLevel1'];
        this.fromLinkLevel2 = !!params['fromLinkLevel2'];
        this.codeProduit = params['codeProduit'] || '';
      }
      
      this.messageNotification = 'GENERIC.TEMPLATE.NOTIFICATION.CURRENT_LOADING';
      this.isLoading = true;
      this.userService.getUserConnected().then((user: User) => {
        this.user = user;
        this.initList();
      });
    });
  }

  /* Initialisation des différentes listes de la fonction */
  private initList(): void {
    this.ficheProduitService
      .getInitData(this.user.context['idsite'], this.user.context['do'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => this.initContextualisation(),
        () => {
          this.isLoading = false;
          this.notificationService.push(
            '',
            this.translate.instant('GENERIC.TEMPLATE.NOTIFICATION.ERROR_INIT_DATA'),
            Level.ERROR,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        }
      );
  }

  /* Chargement des critères, des entêtes de colonne et des onglets
     depuis les fichiers de contexte  */
  private initContextualisation(): void {
    this.contextService
      .getContext({
        userSite: this.user.context['idsite'],
        userDo: this.user.context['do'],
        contextPath: 'projects/generic/src/assets/context',
        screen: 'listeN1',
      })
      .then((context: TypeContext) => this.afterGetContext(context));

    this.contextService
      .getContext({
        userSite: this.user.context['idsite'],
        userDo: this.user.context['do'],
        contextPath: 'projects/generic/src/assets/context',
        screen: 'listeN2',
      })
      .then((context: TypeContext) => (this.listeSupportService.context = context));
  }

  private afterGetContext(context: TypeContext): void {
    this.initData(context);
    this.cdr.detectChanges();
  }

  /* Initialisation des critères, des entêtes de colonne et des onglets
     à partir de la contextualisation  */
  private initData(response: TypeContext): void {
    if (response && response.criteriaField?.length) {
      this.criteria = response.criteriaField;

      this.requiredCriteria = this.criteria.filter((criteria: Criteria) => !criteria.advanced);
      this.advancedCriteria = this.criteria.filter((criteria: Criteria) => criteria.advanced);

      if (this.navigationRetourService.getCriteriaPileNavigation().length) {
        this.initPreviousCriteria();
      } else {
        this.initDefautValue();
      }
    }

    if (response && response.tabs?.length) {
      const arrayTab = cloneDeep(response.tabs);
      this.tabs = arrayTab.sort((a, b) => a.order - b.order);
    }

    if (response && response.arrayHeader?.length) {
      const arrayHeader = cloneDeep(response.arrayHeader);
      this.arrayHeader = arrayHeader.sort((a, b) => a.order - b.order);
    }

    this.canBeLoaded = true;
    this.isLoading = false;

    this.initDataList();

    window.setTimeout(function () {
      const firstElement = document.getElementById('codeProduitCriteria');
      if (firstElement) {
        firstElement.focus();
      }
    }, 0);

    
    if (this.navigationRetourService.getCriteriaPileNavigation().length || this.fromLinkLevel1) {
      this.search();
    }
    
    this.cdr.detectChanges();
  }

  
  private initPreviousCriteria(): void {
    this.navigationRetourService.getCriteriaPileNavigation().forEach(crit => {
      if (crit.value !== '' || crit.value.length) {
        this.setInputValue(crit.fieldId, crit.value);
      }
    });

    this.criteriaDisabled = this.fromLinkLevel1 || this.fromLinkLevel2;
  }
  
  /* Chargements des datas dans le différentes listes  */
  private initDataList(): void {
    this.setCriteriaDataList(this.ficheProduitService.listeMono, 'codeMono');
    this.setCriteriaDataList(this.ficheProduitService.listeMulti, 'codeMulti');

    this.cdr.detectChanges();
  }

  private setCriteriaDataList(dataList: any[], fieldId: string): void {
    const criteria = this.criteria.filter((element: Criteria) => element.fieldId === fieldId);
    if (criteria.length) {
      criteria[0].listOptions.data = dataList;
    }
  }

  /* Critères : initialisation des valeurs par défaut*/
  private initDefautValue(): void {
    
    if (this.fromLinkLevel1 || this.fromLinkLevel2) {
      this.criteriaControls = [];
      if (this.codeProduit) {
        this.setInputValue('codeProduit', this.codeProduit);
      }
      this.criteriaDisabled = true;
    } else {
      this.setInputValue('dateDebut', new Date());

      const defautValue = this.ficheProduitService.listeMono.find(mono => mono.default === true);
      if (defautValue) {
        this.setInputValue('codeMono', defautValue.codeMono);
      }
    }
  }

  /* Reset du formulaire de critère : on remet les valeurs par défaut*/
  public onFormReset(): void {
    this.cdr.detectChanges();
    this.updateDefautValue('dateDebut', new Date());

    const defautValue = this.ficheProduitService.listeMono.find(mono => mono.default === true);
    if (defautValue) {
      this.updateDefautValue('codeMono', defautValue.codeMono);
    }
  }

  private setInputValue(fieldId: string, value: any): void {
    const criteria = this.criteria.filter((crit: Criteria) => crit.fieldId === fieldId);

    if (criteria.length) {
      this.criteriaControls.push({
        criteria: criteria[0],
        value: value,
      });
    }
  }

  private updateDefautValue(fieldId: string, value: any): void {
    const criteria = this.criteriaControls.find(control => control.criteria.fieldId === fieldId);

    if (criteria) {
      criteria.value = value;
    }
  }

  /*  Action suite au clic sur le bouton de recherche*/
  public onSearch(): void {
    
    this.navigationRetourService.setCriteriaPileNavigation([]);
    this.navigationRetourService.removeLevelInfoListPileNavigation(1);
    this.navigationRetourService.removeLevelInfoListPileNavigation(2);
    
    this.search();
  }

  private search(): void {
    this.listeSupportService.detailLigneSupportOpen = false;
    this.listeProduitClosed = false;
    this.listeSupportService.detailLigneSupportClose$.next();
    this.listeProduitService.selectedIndex = 0;
    this.listeSupportService.selectedIndex = 0;
    this.listeProduitService.closeDetail$.next(false);
    this.ficheProduitService.callSearch$.next();
  }

  /*  Action suite au clic sur un critère de type liste popin */
  public onDialogSearch(event): void {
    let service = null;
    if (event.fieldId === 'codePopinMono') {
      service = this.listeAideService.getPopinMono(this.user.context['idsite'], this.user.context['do']);
    }

    if (event.fieldId === 'codePopinMulti') {
      service = this.listeAideService.getPopinMulti(this.user.context['idsite'], this.user.context['do']);
    }

    this.callServiceList(service, event.fieldId);
  }

  /*  Appel du service correspondant au critère de type liste popin */
  private callServiceList(service: Observable<any>, fieldId: string): void {
    if (service) {
      service.pipe(takeUntil(this.destroy$)).subscribe(
        res => {
          this.setCriteriaDataList(res, fieldId);
          this.inputsService.isListDataLoaded.emit({ fieldId: fieldId, data: res as any });
        },
        () => {
          this.inputsService.isListDataLoaded.emit({ fieldId: fieldId, data: [] });
          this.notificationService.push(
            '',
            this.translate.instant('GENERIC.TEMPLATE.NOTIFICATION.ERROR_LOAD_LIST'),
            Level.ERROR,
            Type.FOOTER,
            null,
            TIMER_NOTIFICATION
          );
        }
      );
    }
  }

  /*  Evènement Suite à un changement de valeur d'un des critère  */
  public onCriteriaControlsChange(): void {
    // action à ajouter
  }

  /*  Affichage du détail N1 d'une ligne  */
  public showDetail(codeProduit: string): void {
    this.codeProduit = codeProduit;
    this.modeDetail = true;
    this.listeProduitClosed = false;
    this.resizeContainer = new ResizeContainer('drawerLeftListeN1', 'drawerRightDetailListeN1');
    this.resizeContainer.startListener();
  }

  /*  Fermeture du détail N1  */
  private closeDetail(): void {
    this.modeDetail = false;
    this.listeProduitClosed = false;
  }
}
