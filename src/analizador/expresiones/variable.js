"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
const arreglo_1 = require("./arreglo");
class Variable {
    constructor({ id, tipo_asignado = null, valor = null, dimensiones = 0 }) {
        Object.assign(this, { id, tipo_asignado, valor, dimensiones });
    }
    isArray() {
        // return this.dimensiones > 0;
        return this.tipo_asignado == 8 /* ARRAY */ || this.valor instanceof arreglo_1.Arreglo;
    }
    isNumber() {
        return this.tipo_asignado == 1 /* INT */ || typeof this.valor == 'number';
    }
    hasTipoAsignado() {
        return this.tipo_asignado != null;
    }
    getValor() {
        return this.valor;
    }
    toString() {
        let salida = `Variable: ${this.id} - Valor: ${this.valor}`;
        return salida;
    }
}
exports.Variable = Variable;
