import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { SQLite } from 'ionic-native';
import 'rxjs/add/operator/map';

/*
  Generated class for the LocalDataService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class LocalDataService {
  db: SQLite = null;
  hayUsuario: any[] = [];
  hayViajes: any[] = [];

  constructor(public http: Http) {
    console.log('Hello LocalDataService Provider');
    this.db = new SQLite();
  }

  openDatabase() {
    return this.db.openDatabase({
      name: 'sodisa.db',
      location: 'default' // the location field is required      
    });
  }

  createTables() {
    let sql = 'CREATE TABLE IF NOT EXISTS Usuario(idUsuario INTEGER PRIMARY KEY AUTOINCREMENT, nombreCompleto TEXT, imei TEXT, userName TEXT, password TEXT, estatus INTEGER); ' +
      'CREATE TABLE IF NOT EXISTS Viaje(idViaje INTEGER PRIMARY KEY AUTOINCREMENT, idOrigen INTEGER, origenNombre TEXT, idConcentrado TEXT, tipoViaje INTEGER, economico TEXT, odometro INTEGER); ' +
      'CREATE TABLE IF NOT EXISTS ViajeDetalle(idViajeDetalle INTEGER PRIMARY KEY AUTOINCREMENT, idViaje INTEGER, idDestino INTEGER, imei TEXT, destinoNombre TEXT, idEstatus INTEGER, idDocumento TEXT); ';
    return this.db.executeSql(sql, []);
  }

  getAll() {
    let sql = 'SELECT * FROM Usuario';
    return this.db.executeSql(sql, [])
      .then(response => {
        let tasks = [];
        for (let index = 0; index < response.rows.length; index++) {
          tasks.push(response.rows.item(index));
        }
        return Promise.resolve(tasks);
      })
  }

  create(task: any) {
    let sql = 'INSERT INTO tasks(title, completed) VALUES(?,?)';
    return this.db.executeSql(sql, [task.title, task.completed]);
  }

  checkUsuario(usuario) {
    let sql = 'SELECT * FROM Usuario WHERE userName = ?';
    return this.db.executeSql(sql, [usuario])
      .then(response => {
        let hayUsuario = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayUsuario.push(response.rows.item(index));
        }
        return Promise.resolve(hayUsuario);
      })
  }

  checkViajesAsignados() {
    let sql = 'SELECT V.idViaje, VD.idViaje FROM Viaje AS V INNER JOIN ViajeDetalle AS VD ON VD.idViaje = V.idViaje';
    return this.db.executeSql(sql, [])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      })
  }
}
