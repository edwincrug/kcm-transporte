import { Component } from '@angular/core';
import { NavController, Platform, ToastController, NavParams, AlertController } from 'ionic-angular';
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
  listaViajesAsignados: any[] = [];
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
  mensaje: string;
  muestraRechazo: boolean = false;
  testRadioOpen: boolean;
  idRechazoSelected;
  nombre: string;


  constructor(public navCtrl: NavController, private platform: Platform, public sodisaService: SodisaService, public storage: Storage,
    public toastCtrl: ToastController, private navParams: NavParams, public alertCtrl: AlertController) {
    console.log('Inicia Viajes Asignados');

    this.username = navParams.get('usuario');
    this.nombre = navParams.get('nombre');
    this.obtieneViajesAsignados();
  }

  ionViewDidLoad() {
    let viajeSeleccionado = this.navParams.data;

  }

  obtieneViajesAsignados() {
    this.imei = Device.device.uuid;

    // this.sodisaService.viajesAsignados('C55163', 'aa1add0d87db4099')
    this.sodisaService.viajesAsignados(this.username, Device.device.uuid)
      .then(data => {
        this.viajes = data;
        this.listaViajesAsignados = data.pListaViajeMovil;
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
          if (this.viajes[0].pResponseCode == -5) {
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

  AceptaViaje(idOrigen, idConcentrado, indice) {
    this.imei = Device.device.uuid;

    // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', 0, 3, 'aa1add0d87db4099').subscribe(data => {
    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, 0, 3, this.imei).subscribe(data => {
      this.llamada = data;

      if (this.llamada.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Aceptado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();

        this.listaViajesAsignados.splice(indice, 1);

        this.navCtrl.push(Page1, {
          origen: idOrigen,
          concentrado: idConcentrado,
          operador: this.username,
          tracto: this.pNumeroEconomicoTractocamion
        });
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

  muestraMotivos(idOrigen, idConcentrado, indice) {
    this.imei = Device.device.uuid;
    let alert = this.alertCtrl.create();
    alert.setTitle('Motivos de Rechazo');

    alert.addInput({
      type: 'radio',
      label: 'Salud del operador',
      value: '1',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Día de descanso',
      value: '2',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Negativa del Operador',
      value: '3',
      checked: false
    });

    alert.addButton('Cerrar');
    alert.addButton({
      text: 'Aceptar',
      handler: data => {
        this.testRadioOpen = false;
        this.idRechazoSelected = data;

        if (this.idRechazoSelected != null) {
          this.RechazaViaje(idOrigen, idConcentrado, indice);
        }

      }
    });

    alert.present();


  }

  RechazaViaje(idOrigen, idConcentrado, indice) {
    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.pIdOperador, this.idRechazoSelected, 4, Device.device.uuid).subscribe(data => {
      // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', this.idRechazoSelected, 4, 'aa1add0d87db4099').subscribe(data => {
      if (data.pResponseCode == 1) {
        let toast = this.toastCtrl.create({
          message: 'Viaje Rechazado',
          duration: 2000,
          position: 'middle'
        });
        toast.present();

        this.listaViajesAsignados.splice(indice, 1);
      }
      else {
        this.interpretaRespuesta(data);
      }

    });
  }
}
