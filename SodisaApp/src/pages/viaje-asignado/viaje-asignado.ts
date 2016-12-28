import { Component } from '@angular/core';
import { NavController, Platform, ToastController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { SodisaService } from '../../servicios/servicios';
import { Geolocation, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker, Toast, Device } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../../pages/login/login';
import { Page1 } from '../../pages/page1/page1';
import { LocalDataService } from '../../providers/local-data-service';

/*
  Generated class for the ViajeAsignado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-asignado',
  templateUrl: 'viaje-asignado.html',
  providers: [SodisaService, Storage, LocalDataService]
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
  economico: string;
  listaViajesLocales: any[] = [];
  lat: any;
  lng: any;

  constructor(public navCtrl: NavController, private platform: Platform, public sodisaService: SodisaService, public storage: Storage,
    public toastCtrl: ToastController, private navParams: NavParams, public alertCtrl: AlertController, public dataServices: LocalDataService,
    private loadingCtrl: LoadingController) {
    console.log('Inicia Viajes Asignados');

    this.username = navParams.get('usuario');
    this.nombre = navParams.get('nombre');
    this.economico = navParams.get('eco');

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
  }

  ionViewDidLoad() {
    let viajeSeleccionado = this.navParams.data;
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Obteniendo información...'
    });

    loading.present();

    setTimeout(() => {
      this.obtieneViajesInternos();
      loading.dismiss();
    }, 3000);
  }

  obtieneViajesAsignados() {
    this.imei = Device.device.uuid;

    // this.sodisaService.viajesAsignados('C55163', 'aa1add0d87db4099')
    this.sodisaService.viajesAsignados(this.username, Device.device.uuid)
      .then(data => {
        this.viajes = data;
        this.listaViajesAsignados = data.pListaViajeMovil;
        if (this.viajes.pResponseCode == 1) {
          if (data.pListaViajeMovil.length > 0) {
            this.dataServices.openDatabase()
              .then(() => this.dataServices.insertaViajesAsignados(data.pListaViajeMovil).then(result => {
                let loading = this.loadingCtrl.create({
                  content: 'Obteniendo información...'
                });

                loading.present();

                setTimeout(() => {
                  this.obtieneViajesInternos();
                  loading.dismiss();
                }, 3000);
              }));
          }
          else {
            let toast = this.toastCtrl.create({
              message: 'Sin viajes asignados',
              duration: 3000,
              position: 'middle'
            });
            toast.present();
          }
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

  AceptaViaje(idViaje, idOrigen, idConcentrado, indice) {
    this.imei = Device.device.uuid;

    let exito = "";

    // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', 0, 3, 'aa1add0d87db4099').subscribe(data => {
    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, 0, 3, this.imei).subscribe(data => {
      this.llamada = data;
      if (this.llamada.pResponseCode == 1) {
        this.dataServices.openDatabase()
          .then(() => this.dataServices.actualizaViajeLocal(3, 0, idViaje).then(response => {
            let toast = this.toastCtrl.create({
              message: 'Viaje Aceptado',
              duration: 2000,
              position: 'middle'
            });
            toast.present();

            this.obtieneViajesInternos();
          }));

        if (exito == "1") {

        }
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
    else if (codigoRespuesta.pResponseCode == -5) {
      this.navCtrl.push(LoginPage);
    }
  }

  muestraMotivos(idViaje, idOrigen, idConcentrado, indice) {
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
          this.RechazaViaje(idViaje, idOrigen, idConcentrado, indice);
        }

      }
    });

    alert.present();

  }

  RechazaViaje(idViaje, idOrigen, idConcentrado, indice) {
    let exitoRechazoViaje = "";

    this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, this.idRechazoSelected, 4, Device.device.uuid).subscribe(data => {
      // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', this.idRechazoSelected, 4, 'aa1add0d87db4099').subscribe(data => {
      if (data.pResponseCode == 1) {
        this.dataServices.openDatabase()
          .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
            let toast = this.toastCtrl.create({
              message: 'Viaje Rechazado',
              duration: 2000,
              position: 'middle'
            });
            toast.present();

            this.obtieneViajesInternos();
          }));  //.then(() => this.dataServices.actualizaViajeLocal(4, this.idRechazoSelected, idViaje).then(response => {

        if (exitoRechazoViaje == "1") {

        }
      }
      else {
        this.interpretaRespuesta(data);
      }

    });
  }

  obtieneViajesInternos() {
    this.dataServices.openDatabase()
      .then(() => this.dataServices.checkViajesAsignados().then(response => {
        let alert = this.alertCtrl.create({
          subTitle: 'Cantidad de viajes: ' + response.length,
          buttons: ['OK']
        });
        alert.present();

        if (response.length > 0) {
          this.listaViajesLocales = response;
        }
        else {
          this.listaViajesLocales = [];
        }
      }));
  }

  IniciarViaje(idViaje, idOrigen, idConcentrado, indice) {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    let exitoIniciaViaje = "";

    this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 5, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
      // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 5, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
      if (data.pResponseCode == 1) {
        this.dataServices.openDatabase()
          .then(() => this.dataServices.actualizaViajeLocal(5, 0, idViaje).then(response => {
            let alert = this.alertCtrl.create({
              subTitle: 'Viaje Iniciado!',
              buttons: ['OK']
            });
            alert.present();

            this.obtieneViajesInternos();
          }));

        if (exitoIniciaViaje == "1") {

        }
      }
      else {
        this.interpretaRespuesta(data);
      }

    });
  }

  TerminarViaje(idViaje, idOrigen, idConcentrado, indice) {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    let exitoTerminaViaje = "";

    this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 6, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
      // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 6, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
      if (data.pResponseCode == 1) {
        this.dataServices.openDatabase()
          .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
            let alert = this.alertCtrl.create({
              subTitle: 'Viaje Terminado!',
              buttons: ['OK']
            });
            alert.present();

            this.obtieneViajesInternos();
          }));

        if (exitoTerminaViaje == "1") {

        }
      }
      else {
        if (exitoTerminaViaje == "1") {
          let toast = this.toastCtrl.create({
            message: 'Viaje Terminado!',
            duration: 2000,
            position: 'middle'
          });
          toast.present();

          this.obtieneViajesInternos();

          this.interpretaRespuesta(data);
        }
        else {
          this.interpretaRespuesta(data);
        }
      }
    });
  }
}
