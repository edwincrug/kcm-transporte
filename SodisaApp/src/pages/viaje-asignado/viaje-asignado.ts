import { Component } from '@angular/core';
import { NavController, Platform, ToastController, NavParams } from 'ionic-angular';
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
  llamada: any;
  private mensaje: string;


  constructor(public navCtrl: NavController, private platform: Platform, public sodisaService: SodisaService, public storage: Storage,
    public toastCtrl: ToastController, private navParams: NavParams) {
    console.log('Inicia Viajes Asignados');
    this.obtieneViajesAsignados();
    this.imei = Device.device.uuid;
  }

  ionViewDidLoad() {
    let viajeSeleccionado = this.navParams.data;

  }

  obtieneViajesAsignados() {
    this.imei = Device.device.uuid;

    this.sodisaService.viajesAsignados('C55163', this.imei)
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

  AceptaViaje(idOrigen, idConcentrado) {
    this.imei = Device.device.uuid;

    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.pIdOperador, 0, 3, this.imei).subscribe(data => {
      this.llamada = data;

      if (this.llamada.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Aceptado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();
      }
      else {
        this.interpretaRespuesta(this.llamada);
      }
    });
  }

  RechazaViaje(idOrigen, idConcentrado) {
    this.imei = Device.device.uuid;

    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.pIdOperador, 1, 4, this.imei).subscribe(data => {
      this.llamada = data;
      if (this.llamada.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Rechazado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();
      }
      else {
        this.interpretaRespuesta(this.llamada);
      }

    });
  }

  IniciarViaje(idOrigen, idConcentrado) {
    this.imei = Device.device.uuid;

    this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.pIdOperador, 0, 5, this.imei).subscribe(data => {
      this.llamada = data;
      if (this.llamada.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Iniciado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();
      }
      else {
        this.interpretaRespuesta(this.llamada);
      }

    });
  }

  TerminarViaje(idOrigen, idConcentrado) {
    this.imei = Device.device.uuid;

    this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.pIdOperador, 0, 6, this.imei).subscribe(data => {
      this.llamada = data;
      if (this.llamada.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Terminado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();
      }
      else {
        this.interpretaRespuesta(this.llamada);
      }
    });
  }

  EnviaMapa() {
    this.navCtrl.push(Page1);
  }

  interpretaRespuesta(codigoRespuesta) {
    switch (codigoRespuesta.pResponseCode) {
      case -1:
        this.mensaje = "Usuario no registrado";
        break;
      case -2:
        this.mensaje = "Más de un dispositivo asignado";
        break;
      case -3:
        this.mensaje = "Credenciales incorrectas";
        break;
      case -4:
        this.mensaje = "Dispositivo no asignado";
        break;
      case -5:
        this.mensaje = "La sesión expiro";
        break;
    }

    let toast = this.toastCtrl.create({
      message: this.mensaje,
      duration: 2000,
      position: 'middle'
    });
    toast.present();

    if (codigoRespuesta.pResponseCode == 1) {
      this.navCtrl.push(ViajeAsignadoPage);
    }
    else if (codigoRespuesta.pResponseCode == 5) {
      this.navCtrl.push(LoginPage);
    }
  }
}
