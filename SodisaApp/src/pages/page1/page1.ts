import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Geolocation, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker, Toast, Device } from 'ionic-native';
import { SodisaService } from '../../servicios/servicios';
import { LoginPage } from '../../pages/login/login';

@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html',
  providers: [SodisaService]
})
export class Page1 {
  map: GoogleMap;
  latLng: any;
  origen: any;
  concentrado: any;
  operador: any;
  private mensaje: string;
  lat: any;
  lng: any;
  iconName: string = 'play';

  constructor(public navCtrl: NavController, private platform: Platform, private navParams: NavParams,
    public sodisaService: SodisaService, public toastCtrl: ToastController, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      this.origen = navParams.get('origen');
      this.concentrado = navParams.get('concentrado');
      this.operador = navParams.get('operador');

      this.getCurrentPosition();
    });
  }

  getCurrentPosition() {
    Geolocation.getCurrentPosition()
      .then(position => {

        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        this.latLng = new GoogleMapsLatLng(this.lat, this.lng)

        this.loadMap();
      });
  }

  loadMap() {
    this.map = new GoogleMap('map', {
      'backgroundColor': 'white',
      'controls': {
        'compass': true,
        'myLocationButton': false,
        'indoorPicker': true,
        'zoom': true,
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      },
      'camera': {
        'latLng': this.latLng,
        'tilt': 30,
        'zoom': 15,
        'bearing': 50
      }
    });

    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
      console.log('Map is ready!');
      this.setMarker();
    });
  }

  setMarker() {
    //primero validamos que tengamos los datos de la localización
    if (this.latLng) {

      //De esta forma estamos colocando el marker en la posicion de nuestra ubicación, con el titulo ‘Mi posición’
      let markerOptions: GoogleMapsMarkerOptions = {
        position: this.latLng,
        title: 'Mi posición'
      };

      //Luego lo agregamos al mapa, y una vez agregado llamamos la función showInfoWindow() para mostrar el título señalado anteriormente.
      this.map.addMarker(markerOptions)
        .then((marker: GoogleMapsMarker) => {
          marker.showInfoWindow();
        });
    } else {

      //En caso de no obtener la ubicación es bueno señalar al usuario porque no se mostró el marker
      Toast.show("No se ha podido obtener su ubicación", '5000', 'bottom').subscribe(
        toast => {
          console.log(toast);
        }
      );
    }
  }

  IniciarViaje() {
    Geolocation.getCurrentPosition()
      .then(position => {

        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    this.sodisaService.actualizaViaje(this.origen, this.concentrado, this.operador, 0, 5, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
      if (data.pResponseCode == 1) {
        // this.iconName = 'pause';
        let alert = this.alertCtrl.create({
          subTitle: 'Viaje Iniciado!',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.interpretaRespuesta(data);
      }

    });
  }

  TerminarViaje() {
    Geolocation.getCurrentPosition()
      .then(position => {

        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    this.sodisaService.actualizaViaje(this.origen, this.concentrado, this.operador, 0, 6, Device.device.uuid, fechaEnviada, coordenadas).subscribe(data => {
      if (data.pResponseCode == 1) {
        let alert = this.alertCtrl.create({
          subTitle: 'Viaje Terminado!',
          buttons: ['OK']
        });
        alert.present();
      }
      else {
        this.interpretaRespuesta(data);
      }
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
    }

    let toast = this.toastCtrl.create({
      message: this.mensaje,
      duration: 2000,
      position: 'middle'
    });
    toast.present();

    if (codigoRespuesta.pResponseCode == 5) {
      this.navCtrl.push(LoginPage);
    }
  }

  CambiaIcono() {
    let alert = this.alertCtrl.create();
    if (this.iconName == 'play') {
      this.iconName = 'pause';
      alert.setTitle('Viaje Pausado');
    }
    else {
      this.iconName = 'play';
      alert.setTitle('Viaje Iniciado');
    }

    alert.addButton('OK');
    alert.present();
  }

  showDataStartTravel() {
    let prompt = this.alertCtrl.create({
      title: 'Iniciar Viaje',
      message: "Ingrese los siguientes datos: ",
      cssClass: 'encima',
      inputs: [
        {
          name: 'Odómetro',
          placeholder: 'Odómetro'
        },
        {
          name: 'Remolque',
          placeholder: 'Remolque'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Iniciar',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }
}
