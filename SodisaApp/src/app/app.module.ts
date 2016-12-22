import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';
import { LoginPage } from '../pages/login/login';
import { ViajeAsignadoPage } from '../pages/viaje-asignado/viaje-asignado';
import { PerfilPage } from '../pages/perfil/perfil';
import { LocalDataService } from '../providers/local-data-service';

@NgModule({
  declarations: [
    MyApp,
    Page1,
    Page2,
    LoginPage,
    ViajeAsignadoPage,
    PerfilPage
  ],
  imports: [ 
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Page1,
    Page2,
    LoginPage, 
    ViajeAsignadoPage,
    PerfilPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage, LocalDataService]
})
export class AppModule {}
