import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SodisaService {
    url: string = 'http://dev1.sodisamovil.kcm.com.mx/_WebAPI/Operador/';
    data: any;
    parametros: any;

    constructor(public http: Http) {
        console.log('Inicia SodisaService');
    }

    login(pIdOperador, pPasswordOperador, pIMEI) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            this.http.get(this.url + 'Login/?strIdOperador=' + pIdOperador + '&strPasswordOperador=' + pPasswordOperador + '&strIdDispositivo=' + pIMEI)
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    viajesAsignados(pIdOperador, pIMEI) {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            this.http.get(this.url + 'viajeAsignado/?strIdOperador=' + pIdOperador + '&strIdDispositivo=' + pIMEI)
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    aceptaRechazaViaje2() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }

        // don't have the data yet
        return new Promise(resolve => {
            let headers = new Headers({ 'Content-Type': 'application/json' });
            let options = new RequestOptions({ headers: headers });
            //let body2 = 'intIdOrigenIn=' + idOrigen + '&strIdConcentradoVc=' + idConcentrado + '&strIdOperadorVc=' + idOperador + '&intIdMotivoRechazoIn=' + idMotivo + '&intIdEstatusViajeIn=' + idEstatusViaje + '&strIdDispositivo=' + IMEI;
            let body = "{ intIdOrigenIn: 4, strIdConcentradoVc: '8906', strIdOperadorVc: 'C55163', intIdMotivoRechazoIn: 1, intIdEstatusViajeIn: 3, strIdDispositivo: '6f90d4bebfae4934' }";

            this.http.post(this.url + 'aceptaRechazaViaje', body, options)
                .map(res => res.json())
                .subscribe(data => {
                    this.data = data;
                    resolve(this.data);
                });
        });
    }

    // aceptaRechazaViaje(){
    //     if (this.data) {
    //         // already loaded data
    //         return Promise.resolve(this.data);
    //     }

    //     // don't have the data yet  
    //     return new Promise(resolve => {
    //         this.http.post(this.url + 'aceptaRechazaViaje/?strIdOperador=' + pIdOperador + '&strIdDispositivo=' + pIMEI)
    //             .map(res => res.json())
    //             .subscribe(data => {
    //                 this.data = data;
    //                 resolve(this.data);
    //             });
    //     });
    // }


}