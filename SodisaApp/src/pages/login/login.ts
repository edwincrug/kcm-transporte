import { Component } from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Device } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { SodisaService } from '../../servicios/servicios';
import { Page1 } from '../../pages/page1/page1';
import { Page2 } from '../../pages/page2/page2';
import { ViajeAsignadoPage } from '../../pages/viaje-asignado/viaje-asignado';
import { LocalDataService } from '../../providers/local-data-service';
import { Red } from '../../providers/red';
import { HomePage } from '../../pages/home/home';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [SodisaService, LocalDataService, Red]
})
export class LoginPage {
    username: string;
    password: string;
    imei: string;
    mensaje: string;
    public credenciales: any;
    respuesta: any;
    usuarioExiste: any[] = [];

    constructor(public navCtrl: NavController, public sodisaService: SodisaService, public toastCtrl: ToastController,
        public storage: Storage, public dataServices: LocalDataService, public alertCtrl: AlertController, public networkService: Red,
        private loadingCtrl: LoadingController) { }

    ionViewDidLoad() {
        console.log('Hello LoginPage Page');
    }

    validaCredenciales() {
        this.imei = Device.device.uuid;

        let loading = this.loadingCtrl.create({
            content: 'Autenticando...',
            duration: 10000
        });

        if (this.networkService.noConnection()) {
            loading.present();

            this.dataServices.openDatabase()
                .then(() => this.dataServices.checkUsuario(this.username, this.password, this.imei).then(respuesta => {
                    loading.dismiss();

                    if (respuesta == 'KO') {
                        alert('Credenciales incorrectas');
                    }
                    else {
                        let toast = this.toastCtrl.create({
                            message: '¡Bienvenido ' + respuesta.Nombre + ' !',
                            duration: 1000,
                            position: 'middle'
                        });
                        toast.present();

                        this.navCtrl.push(HomePage, {
                            usuario: this.username,
                            nombre: respuesta.Nombre,
                            eco: respuesta.tracto
                        });
                    }
                }).catch(error => {
                    loading.dismiss();
                }));

        }
        else {
            loading.present();

            // this.sodisaService.login('C55163', 'C55163', 'aa1add0d87db4099').subscribe(data => {
            this.sodisaService.login(this.username, this.password, this.imei).subscribe(data => {
                loading.dismiss();
                this.credenciales = data;
                this.interpretaRespuesta(this.credenciales);
            });
        }
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
            case 1:
                this.mensaje = "¡Bienvenido " + codigoRespuesta.pOperadorNombre + ' !';
        }

        let toast = this.toastCtrl.create({
            message: this.mensaje,
            duration: 1000,
            position: 'middle'
        });
        toast.present();

        if (codigoRespuesta.pResponseCode == 1) {
            this.registraUsuario(codigoRespuesta.pIdOperador, this.password, codigoRespuesta.pNumeroEconomicoTractocamion, codigoRespuesta.pOperadorNombre, this.imei);

            this.registraViajesAsignados(codigoRespuesta.pListaViajeMovil);

            this.navCtrl.push(ViajeAsignadoPage, {
                usuario: codigoRespuesta.pIdOperador,
                nombre: codigoRespuesta.pOperadorNombre,
                eco: codigoRespuesta.pNumeroEconomicoTractocamion
            });

        }
    }

    registraViajesAsignados(ListaViajes) {
        if (ListaViajes.length > 0) {
            this.dataServices.openDatabase()
                .then(response => {
                    this.dataServices.insertaViajesAsignados(ListaViajes);
                });
        }
    }

    registraUsuario(userName, password, noTracto, nombreCompleto, imei) {
        this.dataServices.openDatabase()
            .then(response => {
                this.dataServices.insertaUsuario(userName, password, noTracto, nombreCompleto, imei);
            });
    }

}
