"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identificador = void 0;
const error_1 = require("../arbol/error");
const errores_1 = require("../arbol/errores");
const instruccion_1 = require("../interfaces/instruccion");
class identificador extends instruccion_1.Instruccion {
    constructor(linea, id) {
        super(linea);
        Object.assign(this, { id, linea });
    }
    ejecutar(e) {
        //Busco el id en el entorno
        const variable = e.getVariable(this.id);
        if (variable) {
            return variable.getValor();
        }
        //Error
        errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, 'descripcion': `No en contró ninguna variable con el id: ${this.id}` }));
        return null;
    }
}
exports.identificador = identificador;
