"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.letEXP = void 0;
const error_1 = require("../arbol/error");
const errores_1 = require("../arbol/errores");
const instruccion_1 = require("../interfaces/instruccion");
const tipo_1 = require("../expresiones/tipo");
const variable_1 = require("../expresiones/variable");
const _ = require("lodash");
const entFunc_1 = require("../interfaces/entFunc");
class letEXP extends instruccion_1.Instruccion {
    constructor(linea, id, exp) {
        super(linea);
        Object.assign(this, { id, exp });
    }
    ejecutar(e) {
        //Validacion de variable existente
        let variable = e.getVariable(this.id);
        if (variable && !entFunc_1.entFunc.getInstance().ejecFuncion()) {
            errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una variable declarada con el id ${this.id}` }));
            return;
        }
        //Creacion de variable en el entorno
        let valor = this.exp.ejecutar(e);
        valor = _.cloneDeep(valor);
        const tipo_asignado = tipo_1.getTipo(valor);
        variable = new variable_1.Variable({ id: this.id, tipo_asignado, valor });
        e.setVariable(variable);
    }
}
exports.letEXP = letEXP;
