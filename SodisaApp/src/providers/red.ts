import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Network } from 'ionic-native';

import 'rxjs/add/operator/map';

/*
  Generated class for the Red provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Red {

  constructor(public http: Http) {
    console.log('Hello Red Provider');
  }

  noConnection() {
    return (Network.connection === 'none');
  }

}
