import { Component } from '@angular/core';
import { ViajeAsignadoPage } from '../viaje-asignado/viaje-asignado';
import { ViajePage } from '../viaje/viaje';

/*
  Generated class for the Home page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  tab1Root: any = ViajeAsignadoPage;
  tab2Root: any = ViajePage;

  constructor() { }

  ionViewDidLoad() {
    console.log('Hello HomePage Page');
  }

}
