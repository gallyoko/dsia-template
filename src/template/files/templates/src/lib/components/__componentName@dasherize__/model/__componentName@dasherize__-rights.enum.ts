export enum <%= touppercase(underscore(componentName)) %>_RIGHTS {
    // Config
    ROLE_CONFIGURATOR = 'ROLE_CONFIGURATOR',
    // Droit bouton ajout
    CREATE_<%= touppercase(underscore(componentName)) %> = 'CREATE_<%= touppercase(underscore(moduleI18nName)) %>_<%= touppercase(underscore(componentName)) %>',
    // Droit bouton mise à jour
    UPDATE_<%= touppercase(underscore(componentName)) %> = 'UPDATE_<%= touppercase(underscore(moduleI18nName)) %>_<%= touppercase(underscore(componentName)) %>',
    // Droit bouton suppression 
    DELETE_<%= touppercase(underscore(componentName)) %> = 'DELETE_<%= touppercase(underscore(moduleI18nName)) %>_<%= touppercase(underscore(componentName)) %>',
  }
  