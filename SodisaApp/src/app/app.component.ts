import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import { LoginPage } from '../pages/login/login';
import { ViajeAsignadoPage } from '../pages/viaje-asignado/viaje-asignado';
import { PerfilPage } from '../pages/perfil/perfil';

import { LocalDataService } from '../providers/local-data-service';
import { SodisaService } from '../servicios/servicios';

@Component({
  templateUrl: 'app.html',
  providers: [LocalDataService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = null;

  pages: Array<{ title: string, component: any }>;

  tasks: any[] = [];
  listaViajesPorSincronizar: any[] = [];

  constructor(public platform: Platform, public dataServices: LocalDataService, public sodisaService: SodisaService, public http: Http) {
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
        .then(() => this.dataServices.createTableUsuario())
        .then(() => this.dataServices.createTableViaje())
        .then(() => this.dataServices.createTableViajeDetalle())
        .then(() => this.dataServices.createTableViajeSync())
        .then(() => {
          this.rootPage = LoginPage;
        });

      let wsSodisa = new SodisaService(this.http);
      document.addEventListener("online", function () {
        let dbService = new LocalDataService();

        dbService.openDatabase()
          .then(() => {
            dbService.viajesPorSincronizar().then(result => {
              alert('Viajes por sincronizar: ' + result.length);

              if (result.length > 0) {
                for (let x = 0; x < result.length; x++) {
                  alert('idOrigen: ' + result[x].idOrigen);
                  alert('concentrado: ' + result[x].idConcentrado);
                  alert('operador: ' + result[x].idOperador);
                  alert('motivo: ' + result[x].idMotivoRechazo);
                  alert('estatus: ' + result[x].idEstatus);
                  alert('dispositivo: ' + result[x].idDispositivo);
                  alert('idViaje: ' + result[x].idViaje);

                  wsSodisa.aceptaRechazaViaje(result[x].idOrigen, result[x].idConcentrado, result[x].idOperador, result[x].idMotivoRechazo, result[x].idEstatus, result[x].idDispositivo).subscribe(resp => {
                    if (resp.pResponseCode == 1) {
                      alert('Server actualizado');
                      dbService.eliminaViajeSync(result[x].idViaje).then(() => {
                        alert('Eliminado local y sincronizado :)');
                      }).catch(() => {
                        alert('Local no eliminado');
                      });
                    }
                    else {
                      alert('No lo afecto pero hay comunicactión');
                    }
                  });
                }
              }

            });
          });

      }, false);

    });

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

}
