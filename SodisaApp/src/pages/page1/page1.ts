import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ToastController, AlertController } from 'ionic-angular';
import { SodisaService } from '../../servicios/servicios';
import { LoginPage } from '../../pages/login/login';
import { ViajeAsignadoPage } from '../../pages/viaje-asignado/viaje-asignado';

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html',
  providers: [SodisaService]
})
export class Page1 {
  latLng: any;
  origen: any;
  concentrado: any;
  operador: any;
  private mensaje: string;
  lat: any;
  lng: any;
  iconName: string = 'play';
  tracto: string;

  constructor(public navCtrl: NavController) {

  }

}
