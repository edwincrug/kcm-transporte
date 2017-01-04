import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { LoginPage } from '../pages/login/login';
import { ViajeAsignadoPage } from '../pages/viaje-asignado/viaje-asignado';
import { HomePage } from '../pages/home/home';
import { ViajePage } from '../pages/viaje/viaje';

import { LocalDataService } from '../providers/local-data-service';
import { SodisaService } from '../servicios/servicios';

@NgModule({
  declarations: [
    MyApp,
    Page1,
    LoginPage,
    ViajeAsignadoPage,
    HomePage,
    ViajePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Page1,
    LoginPage,
    ViajeAsignadoPage,
    HomePage,
    ViajePage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }, Storage, LocalDataService, SodisaService]
})
export class AppModule { }
