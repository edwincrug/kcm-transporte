import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class SodisaService {
    private url: string = 'http://dev1.sodisamovil.kcm.com.mx/_WebAPI/Operador/';
    data: any;
    parametros: any;

    constructor(public http: Http) {
        console.log('Inicia SodisaService');
    }

    login(pIdOperador, pPasswordOperador, pIMEI): Observable<any> {
        return this.http.get(this.url + 'Login/?strIdOperador=' + pIdOperador + '&strPasswordOperador=' + pPasswordOperador + '&strIdDispositivo=' + pIMEI)
            .map((res: Response) => {
                this.data = res.json();
                return this.data;
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

    aceptaRechazaViaje(idOrigen, idConcentrado, idOperador, idMotivoRechazo, idEstautsViaje, idDispositivo): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        let body = "{ intIdOrigenIn: " + idOrigen + ", strIdConcentradoVc: '" + idConcentrado + "', strIdOperadorVc: '" + idOperador 
            + "', intIdMotivoRechazoIn: " + idMotivoRechazo + ", intIdEstatusViajeIn: " + idEstautsViaje + ", strIdDispositivo: '" + idDispositivo + "' }";

        return this.http.post(this.url + 'aceptaRechazaViaje', body, options)
            .map((res: Response) => {
                this.data = res.json();
                return this.data;
            });
    }

    actualizaViaje(idOrigen, idConcentrado, idOperador, idDocumento, idEstatusViaje, idDispositivo, fecha, coordenadas): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        let body = "{ intIdOrigenIn: " + idOrigen + ", strIdConcentradoVc: '" + idConcentrado + "', strIdOperadorVc: '" + idOperador
            + "', strIdDocumentoVc: " + idDocumento + ", intIdEstatusViajeIn: " + idEstatusViaje + ", strIdDispositivo: '" + idDispositivo 
            + "', datFechaEventoDt: '" + fecha + "', strGeoLocalizacionEventoVc: '" +  coordenadas + "' }";

        return this.http.post(this.url + 'actualizaEstatusViaje', body, options)
            .map((res: Response) => {
                this.data = res.json();
                return this.data;
            });
    }

    // actualizaViaje(){
    //     if (this.data) {
    //         // already loaded data
    //         return Promise.resolve(this.data);
    //     }

    //     // don't have the data yet
    //     return new Promise(resolve => {
    //         let headers = new Headers({ 'Content-Type': 'application/json' });
    //         let options = new RequestOptions({ headers: headers });            
    //         let body = "{ intIdOrigenIn: 4, strIdConcentradoVc: '8906', strIdOperadorVc: 'C55163', strIdDocumentoVc:0, intIdEstatusViajeIn:6, strIdDispositivo: '6f90d4bebfae4934' }";

    //         this.http.post(this.url + 'actualizaEstatusViaje', body, options)
    //             .map(res => res.json())
    //             .subscribe(data => {
    //                 this.data = data;
    //                 resolve(this.data);
    //             });
    //     });
    // }

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