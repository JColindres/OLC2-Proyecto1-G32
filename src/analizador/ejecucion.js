"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ejecucion = void 0;
class Ejecucion {
    constructor(prologo, cuerpo, cadena) {
        this.prologoXml = prologo;
        this.cuerpoXml = cuerpo;
        this.cadena = cadena;
    }
    verObjetos() {
        this.cuerpoXml.forEach(element => {
            console.log(element);
        });
    }
}
exports.Ejecucion = Ejecucion;
