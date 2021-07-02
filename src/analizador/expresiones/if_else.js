"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.If_Else = void 0;
const entorno_1 = require("../interfaces/entorno");
const instruccion_1 = require("../interfaces/instruccion");
const retorno_1 = require("./retorno");
class If_Else extends instruccion_1.Instruccion {
    constructor(linea, condicionIF, instruccionIF, instruccionELSE, condicionELSEIF, instruccionELSEIF) {
        super(linea);
        Object.assign(this, { condicionIF, instruccionIF, instruccionELSE, condicionELSEIF, instruccionELSEIF });
    }
    ejecutar(e) {
        if (this.condicionELSEIF) {
            if (this.condicionIF.ejecutar(e)) {
                const entorno = new entorno_1.Entorno(e);
                const resp = this.instruccionIF.ejecutar(entorno);
                if (this.instruccionIF instanceof retorno_1.Retorno) {
                    return this.instruccionIF;
                }
                //return;
            }
            else if (this.condicionELSEIF.ejecutar(e)) {
                const entorno = new entorno_1.Entorno(e);
                const resp = this.instruccionELSEIF.ejecutar(entorno);
                if (this.instruccionELSEIF instanceof retorno_1.Retorno) {
                    return this.instruccionELSEIF;
                }
                //return;
            }
            else {
                const entorno = new entorno_1.Entorno(e);
                const resp = this.instruccionELSE.ejecutar(entorno);
                if (this.instruccionELSE instanceof retorno_1.Retorno) {
                    return this.instruccionELSE;
                }
                //return;
            }
        }
        if (this.condicionIF.ejecutar(e)) {
            const entorno = new entorno_1.Entorno(e);
            const resp = this.instruccionIF.ejecutar(entorno);
            if (this.instruccionIF instanceof retorno_1.Retorno) {
                //console.log(this.instruccionIF)
                return this.instruccionIF;
            }
            //return resp;
        }
        else {
            const entorno = new entorno_1.Entorno(e);
            const resp = this.instruccionELSE.ejecutar(entorno);
            if (this.instruccionELSE instanceof retorno_1.Retorno) {
                return this.instruccionELSE;
            }
            //return resp;
        }
    }
}
exports.If_Else = If_Else;
