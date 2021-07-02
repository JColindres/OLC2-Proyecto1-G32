"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Retorno = void 0;
const instruccion_1 = require("../interfaces/instruccion");
const ejeReturn_1 = require("./ejeReturn");
class Retorno extends instruccion_1.Instruccion {
    constructor(linea, has_value, value = null) {
        super(linea);
        Object.assign(this, { has_value, value });
    }
    ejecutar(e) {
        if (this.has_value && this.value != null) {
            const valor = this.value.ejecutar(e);
            console.log(valor);
            return new ejeReturn_1.Retorno(this.has_value, valor);
        }
        else {
            return new ejeReturn_1.Retorno(this.has_value);
        }
    }
}
exports.Retorno = Retorno;
