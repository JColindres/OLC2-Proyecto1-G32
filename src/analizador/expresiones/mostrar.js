"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mostrar = void 0;
const _ = require("lodash");
const instruccion_1 = require("../interfaces/instruccion");
class Mostrar extends instruccion_1.Instruccion {
    constructor(linea, instrucciones) {
        super(linea);
        Object.assign(this, { instrucciones });
    }
    ejecutar(e) {
        if (!this.instrucciones) {
            return null;
        }
        //this.instrucciones.forEach(inst => {
        let res = this.instrucciones.ejecutar(e);
        res = _.cloneDeep(res);
        const salida = res !== null && res !== void 0 ? res : 'null';
        console.log(salida);
        //Salida.getInstance().push(salida);
        //});
    }
}
exports.Mostrar = Mostrar;
