import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import { LoginPage } from '../pages/login/login';
import { ViajeAsignadoPage } from '../pages/viaje-asignado/viaje-asignado';
import { PerfilPage } from '../pages/perfil/perfil';

import { LocalDataService } from '../providers/local-data-service';

@Component({
  templateUrl: 'app.html',
  providers: [LocalDataService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = null;

  pages: Array<{ title: string, component: any }>;

  tasks: any[] = [];

  constructor(public platform: Platform, public dataServices: LocalDataService) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Page One', component: Page1 },
      { title: 'Page Two', component: Page2 }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();

      this.dataServices.openDatabase()
        .then(() => this.dataServices.createTables())
        .then(() => {
          this.rootPage = LoginPage;
        });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

}
