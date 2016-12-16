import { Component } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { SodisaService } from '../../servicios/servicios';
import { Device } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../../pages/login/login';
import { Page1 } from '../../pages/page1/page1';

/*
  Generated class for the ViajeAsignado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-asignado',
  templateUrl: 'viaje-asignado.html',
  providers: [SodisaService, Storage]
})
export class ViajeAsignadoPage {
  username: string;
  imei: string;
  viajes: any;
  respuesta: any;
  pIdDispositivo: string;
  pIdOperador: string;
  pIdOperadorArea: string;
  pListaViajeMovil: Array<any>;
  pMessage: string;
  pNumeroEconomicoTractocamion: string;
  pOperadorAreaNombre: string;
  pOperadorNombre: string;
  pPasswordOperador: string;
  pResponseCode: string;
  pTiempoSesionMovilEnHoras: string;
  pTipoViajeNombre: string;
  pIdOrigen: string;


  constructor(public navCtrl: NavController, private platform: Platform, public sodisaService: SodisaService, public storage: Storage, public toastCtrl: ToastController) {
    console.log('Inicia Viajes Asignados');
    this.obtieneViajesAsignados();
  }

  ionViewDidLoad() {
    //this.AceptaViaje();
  }

  obtieneViajesAsignados() {
    this.imei = Device.device.uuid;

    this.sodisaService.viajesAsignados('C55163', '6f90d4bebfae4934')
      .then(data => {
        this.viajes = data;
        if (this.viajes.pResponseCode == 1) {
          this.asignaVariables();
        }
        else {
          let toast = this.toastCtrl.create({
            message: this.viajes.pMessage,
            duration: 2000,
            position: 'middle'
          });
          toast.present();
          if (this.viajes.pResponseCode == -5) {
            this.navCtrl.push(LoginPage);
          }
        }
      });
  }

  asignaVariables() {
    this.pIdDispositivo = this.viajes.pIdDispositivo;
    this.pIdOperador = this.viajes.pIdOperador;
    this.pIdOperadorArea = this.viajes.pIdOperadorArea;
    this.pListaViajeMovil = this.viajes.pListaViajeMovil;
    this.pMessage = this.viajes.pMessage;
    this.pNumeroEconomicoTractocamion = this.viajes.pNumeroEconomicoTractocamion;
    this.pOperadorAreaNombre = this.viajes.pOperadorAreaNombre;
    this.pOperadorNombre = this.viajes.pOperadorNombre;
    this.pPasswordOperador = this.viajes.pPasswordOperador;
    this.pResponseCode = this.viajes.pResponseCode;
    this.pTiempoSesionMovilEnHoras = this.viajes.pTiempoSesionMovilEnHoras;
    this.pTipoViajeNombre = this.viajes.pTipoViajeNombre;
    this.pIdOrigen = this.viajes.pIdOrigen;
  }

  AceptaViaje() {
    this.navCtrl.push(Page1);
    // alert('Pulsa Aceptar');
    // let invocaServicio = new this.sodisaService();
    // this.sodisaService.aceptaRechazaViaje2()
    //   .then(otro => {
    //     this.respuesta = otro;
    //     alert(JSON.stringify(this.respuesta));
    //   });
  }

  RechazaViaje(idViaje) {

  }
}
