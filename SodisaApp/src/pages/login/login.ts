import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Device } from 'ionic-native';
import { Storage } from '@ionic/storage';

import { SodisaService } from '../../servicios/servicios';
import { Page1 } from '../../pages/page1/page1';
import { Page2 } from '../../pages/page2/page2';
import { ViajeAsignadoPage } from '../../pages/viaje-asignado/viaje-asignado';
import { LocalDataService } from '../../providers/local-data-service';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [SodisaService, LocalDataService]
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
        public storage: Storage, public dataServices: LocalDataService) { }

    ionViewDidLoad() {
        console.log('Hello LoginPage Page');
    }

    validaCredenciales() {
        this.imei = Device.device.uuid;
        // this.sodisaService.login('C55163', 'C55163', 'aa1add0d87db4099').subscribe(data => {
        this.sodisaService.login(this.username, this.password, this.imei).subscribe(data => {
            this.credenciales = data;
            this.interpretaRespuesta(this.credenciales);
        });
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
            duration: 2000,
            position: 'middle'
        });
        toast.present();

        if (codigoRespuesta.pResponseCode == 1) {

            this.dataServices.openDatabase()
                .then(() => this.dataServices.checkViajesAsignados().then(response => {
                    alert('Viajes Asignados: ' + response.length);
                    // .then(() => this.dataServices.checkUsuario(codigoRespuesta.pIdOperador).then(response => {
                    //if(response.length == 0) --Registra en BD

                    this.navCtrl.push(ViajeAsignadoPage, {
                        usuario: codigoRespuesta.pIdOperador,
                        nombre: codigoRespuesta.pOperadorNombre
                    });


                }).catch(error => {
                    alert('Error: ' + error.ToString());
                }));




        }
    }
}
