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
  sqlQuery: string;

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

  createTableUsuario() {
    let sql = 'CREATE TABLE IF NOT EXISTS Usuario(idUsuario INTEGER PRIMARY KEY AUTOINCREMENT, nombreCompleto TEXT, imei TEXT, userName TEXT, password TEXT, estatus INTEGER); ';
    return this.db.executeSql(sql, []);
  }

  createTableViaje() {
    let sql = 'CREATE TABLE IF NOT EXISTS Viaje(idViaje INTEGER PRIMARY KEY AUTOINCREMENT, idOrigen INTEGER, origenNombre TEXT, idConcentrado TEXT, tipoViaje INTEGER, economico TEXT, odometro INTEGER, idEstatus INTEGER, idUsuario INTEGER, idRechazo INTEGER, geolocalizacion TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableViajeDetalle() {
    let sql = 'CREATE TABLE IF NOT EXISTS ViajeDetalle(idViajeDetalle INTEGER PRIMARY KEY AUTOINCREMENT, idViaje INTEGER, idDestino INTEGER, destinoNombre TEXT, idEstatus INTEGER, idDocumento TEXT, fechaDocumento TEXT, geolocalizacion TEXT); ';
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
    let sql = 'SELECT * FROM Viaje WHERE Viaje.idEstatus IN (2, 3, 5)';
    return this.db.executeSql(sql, [])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      });
  }

  insertaViajesAsignados(travels) {
    for (let x = 0; x < travels.length; x++) {
      this.sqlQuery = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus, idUsuario, idRechazo, geolocalizacion) VALUES (" +
        travels[x].pIdOrigen + ", '" +
        travels[x].pOrigenNombre + "', '" +
        travels[x].pIdConcentradoVc + "', " +
        travels[x].pIdTipoViaje + ", '" +
        travels[x].pNumeroEconomicoRemolque + "', " +
        travels[x].pOdometro + ", " +
        travels[x].pIdEstatus + ", 1, 0, '" +
        travels[x].pGeoLocalizacionOrigen + "'); ";

      this.db.executeSql(this.sqlQuery, []);
    }
    // let sql = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus) VALUES (1, 'Aguscalientes', 'CON1', 1, 'ECO-1', 20, 2); ";
    // return this.db.executeSql(sql, []);
  }

  actualizaViajeLocal(idEstatus, idRechazo, idViaje){
    let sql = "UPDATE Viaje SET idEstatus = " + idEstatus + ", idRechazo = " + idRechazo + " WHERE idViaje = ?";
    return this.db.executeSql(sql, [idViaje]);
  }

  insertViajeAsignadoDummy() {
    let sql = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus) VALUES (1, 'Aguscalientes's, 'CON1', 1, 'ECO-1', 20, 2); ";
    this.db.executeSql(sql, []);

    sql = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus) VALUES (2, 'Baja California Norte', 'CON2', 2, 'ECO-2', 20, 3); ";
    this.db.executeSql(sql, []);

    sql = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus) VALUES (3, 'Colima', 'CON3', 1, 'ECO-3', 20, 5); ";
    this.db.executeSql(sql, []);

    sql = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus) VALUES (4, 'Durango', 'CON4', 2, 'ECO-4', 20, 4); ";
    this.db.executeSql(sql, []);
  }
}
