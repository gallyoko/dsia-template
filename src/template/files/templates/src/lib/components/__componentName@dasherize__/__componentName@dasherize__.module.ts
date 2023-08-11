import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { DsiaCriteriaModule } from '@dsia/criteria';
import { DsiaInputsModule } from '@dsia/inputs';
import { DsiaMatDataTableModule, DsiaMatDataTableService } from '@dsia/mat-data-table';
import { NavigationRetourModule } from '@dsia/navigation-retour';
import { DsiaSpinnerModule } from '@dsia/spinner';
import { DsiaWmsCommonModule, GlobalVariableService } from '@dsia/wms-common';
import { LanguageModule, MaterialModule, UserPreferencesService } from '@lap';
import { TranslateModule } from '@ngx-translate/core';

import { Main<%= classify(componentName) %>Component } from './components/main-<%= dasherize(componentName) %>/main-<%= dasherize(componentName) %>.component';
import { Liste<%= classify(principalModelName) %>Component } from './components/liste-<%= dasherize(principalModelName) %>/liste-<%= dasherize(principalModelName) %>.component';
import { Detail<%= classify(principalModelName) %>Component } from './components/detail-<%= dasherize(principalModelName) %>/detail-<%= dasherize(principalModelName) %>.component';
import { Liste<%= classify(secondModelName) %>Component } from './components/liste-<%= dasherize(secondModelName) %>/liste-<%= dasherize(secondModelName) %>.component';
import { Detail<%= classify(secondModelName) %>Component } from './components/detail-<%= dasherize(secondModelName) %>/detail-<%= dasherize(secondModelName) %>.component';

import { <%= classify(componentName) %>Service } from './services/<%= dasherize(componentName) %>.service';
import { Liste<%= classify(componentName) %>Service } from './services/liste-<%= dasherize(componentName) %>.service';

const routes: Routes = [
    {
      path: '',
      data: { title: 'ONGLET.<%= touppercase(underscore(componentName)) %>' },
      component: Main<%= classify(componentName) %>Component,
    },
  ];

  
@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      TranslateModule.forChild(),
      DsiaSpinnerModule,
      MaterialModule,
      LanguageModule,
      DsiaCriteriaModule,
      DsiaInputsModule,
      FormsModule,
      ReactiveFormsModule,
      NavigationRetourModule,
      DsiaMatDataTableModule.forRoot(UserPreferencesService),
      DsiaWmsCommonModule,
    ],
    providers: [<%= classify(componentName) %>Service, Liste<%= classify(componentName) %>Service, UserPreferencesService, DsiaMatDataTableService, GlobalVariableService],
    declarations: [
        Main<%= classify(componentName) %>Component,
        Liste<%= classify(principalModelName) %>Component,
        Detail<%= classify(principalModelName) %>Component,
        Liste<%= classify(secondModelName) %>Component,
        Detail<%= classify(secondModelName) %>Component
    ],
    entryComponents: [],
  })
  export class <%= classify(componentName) %>Module {}