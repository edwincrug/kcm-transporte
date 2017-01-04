import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation, GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarkerOptions, GoogleMapsMarker, Toast, Device } from 'ionic-native';

/*
  Generated class for the Viaje page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje',
  templateUrl: 'viaje.html'
})
export class ViajePage {
  lat: any;
  lng: any;
  latLng: any;
  map: GoogleMap;

  constructor(public navCtrl: NavController, private platform: Platform) {
    platform.ready().then(() => {
      this.getCurrentPosition();
    });
  }

  ionViewDidLoad() {
    console.log('Hello ViajePage Page');
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

}
