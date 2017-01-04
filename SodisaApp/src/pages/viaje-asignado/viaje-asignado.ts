import { Component } from '@angular/core';
import { NavController, Platform, ToastController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { SodisaService } from '../../servicios/servicios';
import { Geolocation, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker, Toast, Device } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../../pages/login/login';
import { Page1 } from '../../pages/page1/page1';
import { ViajePage } from '../../pages/viaje/viaje';

import { LocalDataService } from '../../providers/local-data-service';
import { Red } from '../../providers/red';

/*
  Generated class for the ViajeAsignado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-asignado',
  templateUrl: 'viaje-asignado.html',
  providers: [SodisaService, Storage, LocalDataService, Red]
})
export class ViajeAsignadoPage {
  username: string;
  imei: string;
  viajes: any;
  listaViajesAsignados: any[] = [];
  respuesta: any;
  pListaViajeMovil: Array<any>;
  pOperadorAreaNombre: string;
  pOperadorNombre: string;
  pPasswordOperador: string;
  pResponseCode: string;
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
    private loadingCtrl: LoadingController, public networkService: Red) {
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

    this.SincronizaInformacion();
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Obteniendo información...'
    });

    loading.present();

    setTimeout(() => {
      this.obtieneViajesInternos();
      loading.dismiss();
    }, 2000);
  }

  obtieneViajesAsignados(refresher) {
    this.imei = Device.device.uuid;
    setTimeout(() => {
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
              let alert = this.alertCtrl.create({
                subTitle: 'Sin viajes asignados',
                buttons: ['OK']
              });
              alert.present();
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
      refresher.complete();
    }, 2000);
  }

  AceptaViaje(idViaje, idOrigen, idConcentrado, indice) {
    this.imei = Device.device.uuid;

    // let loading = this.loadingCtrl.create({
    //   content: 'Espere por favor ...'
    // });    

    if (this.networkService.noConnection()) {
      // loading.present();
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 3, this.imei).then(() => {
        // loading.dismiss();
        this.dataServices.actualizaViajeLocal(3, 0, idViaje).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje Aceptado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      }).catch(error => {
        // loading.dismiss();
      });
    }
    else {
      // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', 0, 3, 'aa1add0d87db4099').subscribe(data => {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, 0, 3, this.imei).subscribe(data => {
        // loading.dismiss();
        this.llamada = data;
        if (this.llamada.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(3, 0, idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje Aceptado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(this.llamada);

          if (this.llamada.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
        }
      });
    }
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
      case -8:
        this.mensaje = "Este viaje fue desasignado";
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

    //  let loading = this.loadingCtrl.create({
    //     content: 'Espere por favor ...'
    //   });

    //   loading.present();

    if (this.networkService.noConnection()) {
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, this.idRechazoSelected, 4, Device.device.uuid).then(() => {
        this.dataServices.actualizaViajeLocal(4, this.idRechazoSelected, idViaje).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje Rechazado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      });
    }
    else {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, this.idRechazoSelected, 4, Device.device.uuid).subscribe(data => {
        // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', this.idRechazoSelected, 4, 'aa1add0d87db4099').subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje Rechazado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (this.llamada.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }
          this.obtieneViajesInternos();
        }

      });
    }
  }

  obtieneViajesInternos() {
    this.dataServices.openDatabase()
      .then(() => this.dataServices.checkViajesAsignados().then(response => {
        if (response.length > 0) {
          this.listaViajesLocales = response;
        }
        else {
          this.listaViajesLocales = [];
        }
      }));
  }

  IniciarViaje(idViaje, idOrigen, idConcentrado, noEconomico) {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    this.showPrompt(noEconomico);

    // let fecha = new Date();
    // let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    // let coordenadas = this.lat + ',' + this.lng;

    // if (this.lat == null || this.lng == null) { coordenadas = 'Sin Cobertura'; }

    // if (this.networkService.noConnection()) {
    //   this.dataServices.insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 5, Device.device.uuid, coordenadas, fechaEnviada).then(() => {
    //     this.dataServices.actualizaViajeLocal(5, 0, idViaje).then(response => {
    //       let alert = this.alertCtrl.create({
    //         subTitle: 'Viaje Iniciado',
    //         buttons: ['OK']
    //       });
    //       alert.present();

    //       this.obtieneViajesInternos();
    //     });
    //   });
    // }
    // else {
    //   this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 5, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
    //     // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 5, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
    //     if (data.pResponseCode == 1) {
    //       this.dataServices.openDatabase()
    //         .then(() => this.dataServices.actualizaViajeLocal(5, 0, idViaje).then(response => {
    //           let alert = this.alertCtrl.create({
    //             subTitle: 'Viaje Iniciado',
    //             buttons: ['OK']
    //           });
    //           alert.present();

    //           this.obtieneViajesInternos();
    //         }));
    //     }
    //     else {
    //       this.interpretaRespuesta(data);

    //       if (data.pResponseCode == -8) {
    //         this.EliminaViajeDesasociado(idViaje, 0);
    //       }

    //       this.obtieneViajesInternos();
    //     }

    //   });
    // }
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

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin Cobertura'; }

    if (this.networkService.noConnection()) {
      this.dataServices.insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 6, Device.device.uuid, coordenadas, fechaEnviada).then(() => {
        this.dataServices.actualizaViajeLocal(6, 0, idViaje).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje Terminado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      });
    }
    else {
      this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 6, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
        // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 6, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje Terminado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (this.llamada.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
        }
      });
    }
  }

  SincronizaInformacion() {
    this.dataServices.openDatabase()
      .then(() => {
        this.dataServices.viajesPorSincronizar().then(result => {
          // alert('Viajes por sincronizar: ' + result.length);

          if (result.length > 0) {
            for (let x = 0; x < result.length; x++) {
              // alert('idOrigen: ' + result[x].idOrigen);
              // alert('concentrado: ' + result[x].idConcentrado);
              // alert('operador: ' + result[x].idOperador);
              // alert('motivo: ' + result[x].idMotivoRechazo);
              // alert('estatus: ' + result[x].idEstatus);
              // alert('dispositivo: ' + result[x].idDispositivo);
              // alert('idViaje: ' + result[x].idViaje);
              // alert('fecha: ' + result[x].fecha);
              // alert('geolocalizacion: ' + result[x].geolocalizacion);

              if (result[x].idEstatus == 3 || result[x].idEstatus == 4) {
                this.sodisaService.aceptaRechazaViaje(result[x].idOrigen, result[x].idConcentrado, result[x].idOperador, result[x].idMotivoRechazo, result[x].idEstatus, result[x].idDispositivo).subscribe(resp => {
                  if (resp.pResponseCode == 1) {
                    // alert('Server actualizado');
                    this.dataServices.eliminaViajeSync(result[x].idViajeSync).then(() => {
                      if (result[x].idEstatus == 4) {
                        this.dataServices.eliminaViajeLocal(result[x].idViaje).then(() => {
                          // alert('Eliminado Local');
                        });
                      }
                    }).catch(() => {
                      // alert('Local no eliminado');
                    });
                  }
                  else {
                    this.interpretaRespuesta(resp);
                    if (resp.pResponseCode == -8) {
                      this.EliminaViajeDesasociado(result[x].idViaje, result[x].idViajeSync);
                    }
                  }
                });
              }
              else if (result[x].idEstatus == 5 || result[x].idEstatus == 6) {
                this.sodisaService.actualizaViaje(result[x].idOrigen, result[x].idConcentrado, result[x].idOperador, 0, result[x].idEstatus, result[x].idDispositivo, result[x].fecha, result[x].geolocalizacion).subscribe(resp => {
                  if (resp.pResponseCode == 1) {
                    // alert('Server actualizado');
                    this.dataServices.eliminaViajeSync(result[x].idViajeSync).then(() => {
                      if (result[x].idEstatus == 6) {
                        this.dataServices.eliminaViajeLocal(result[x].idViaje).then(() => {
                          // alert('Eliminado Local');
                        });
                      }
                    }).catch(() => {
                      // alert('Local no eliminado');
                    });
                  }
                  else {
                    this.interpretaRespuesta(resp);
                    if (resp.pResponseCode == -8) {
                      this.EliminaViajeDesasociado(result[x].idViaje, result[x].idViajeSync);
                    }
                  }
                });
              }
            }
          }

        });
      });
  }

  EliminaViajeDesasociado(idViaje, idViajeSync) {
    this.dataServices.openDatabase()
      .then(() => {

        this.dataServices.eliminaViajeLocal(idViaje).then(() => {
          // alert('Eliminado Local');
        });

        this.dataServices.eliminaViajeSync(idViajeSync).then(() => {
          //alert('Eliminado sync');
        });
      });
  }

  showPrompt(noEconomico) {
    let prompt = this.alertCtrl.create({
      subTitle: 'Iniciar Viaje',
      message: "",
      inputs: [
        {
          name: 'odometro',
          placeholder: 'Odómetro'
        },
        {
          name: 'remolque',
          placeholder: 'Remolque',
          value: noEconomico
        },
      ],
      buttons: [
        {
          text: 'Iniciar Viaje',
          cssClass: 'customButton',
          handler: data => {
            let respMsg = this.validarDatos(data.odometro, data.remolque);
            if (respMsg != 'OK') {
              let toast = this.toastCtrl.create({
                message: respMsg,
                duration: 2000,
                position: 'middle'
              });
              toast.present();
            }
          }
        }
      ]
    });
    prompt.present();
  }

  validarDatos(km, remolque) {
    let respuesta = '';

    if ((km == null || km.trim() == '') && (remolque == null || remolque.trim() == '')) {
      return 'Los campos Odómetro y Remolque son obligatorios';
    }
    else if (km == null || km.trim() == '') {
      return 'El campo Odómetro es obligatorio';
    }
    else if (remolque == null || remolque.trim() == '') {
      return 'El campo Remolque es obligatorio';
    }
    else if (!/^([0-9])*$/.test(km)) {
      return 'El campo Odómetro sólo permite números';
    }
    else {
      return 'OK';
    }
  }

  redirectViaje(idViaje) {
    this.navCtrl.push(ViajePage);
  }

}


