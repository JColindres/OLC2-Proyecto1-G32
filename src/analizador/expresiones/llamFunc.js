"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llamfuc = void 0;
const _ = require("lodash");
const error_1 = require("../arbol/error");
const errores_1 = require("../arbol/errores");
const entFunc_1 = require("../interfaces/entFunc");
const entorno_1 = require("../interfaces/entorno");
const instruccion_1 = require("../interfaces/instruccion");
const retorno_1 = require("./retorno");
const tipo_1 = require("./tipo");
class llamfuc extends instruccion_1.Instruccion {
    constructor(linea, id, lista_parametros = null) {
        super(linea);
        Object.assign(this, { id, lista_parametros });
    }
    ejecutar(e) {
        const entorno_aux = new entorno_1.Entorno();
        const entorno_local = new entorno_1.Entorno(e);
        const funcion = _.cloneDeep(e.getFuncion(this.id));
        //Validacion de funcion existente
        if (!funcion) {
            errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna funcion con el nombre ${this.id}` }));
            return;
        }
        //Si la llamada  de la funcion trae parametros
        if (this.lista_parametros) {
            //Si la funcion no tiene parametros
            if (!funcion.hasParametros()) {
                errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} no recibe parametros` }));
                return;
            }
            //Si la funcion tiene parametros debe ser la misma cantidad
            if (this.lista_parametros.length != funcion.lista_parametros.length) {
                errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La cantidad de parametros no coincide ${this.id}` }));
                return;
            }
            //Declaro los parametros
            for (let i = 0; i < this.lista_parametros.length; i++) {
                const exp = this.lista_parametros[i];
                const variable = funcion.lista_parametros[i];
                const valor = exp.ejecutar(entorno_local);
                //Validacion de tipo a asignar
                if (valor != null && variable.hasTipoAsignado() && variable.tipo_asignado != tipo_1.getTipo(valor)) {
                    errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El parametro ${variable.id} de la funcion ${this.id} no es del tipo enviado en la llamada de la funcion` }));
                    return;
                }
                variable.valor = valor;
                entorno_aux.setVariable(variable);
            }
        }
        //Si la llamada de la funcion no trae parametros
        else {
            //Es un error solo si la funcion tiene paremetros
            if (funcion.hasParametros()) {
                errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe recibir ${funcion.getParametrosSize()} parametros` }));
                return;
            }
        }
        entorno_local.variables = entorno_aux.variables;
        //Si es una funcion anidada que estoy ejecutando y estoy dentro de una funcion
        if (entFunc_1.entFunc.getInstance().ejecFuncion() && this.id.endsWith('_')) {
            //No debo cambiar el entorno padre, lo dejo aqui por si acaso :D
        }
        else {
            entorno_local.padre = e.getEntornoGlobal();
        }
        entFunc_1.entFunc.getInstance().iFuncion();
        //Ejecuto las instrucciones
        for (let instruccion of funcion.instrucciones) {
            const resp = instruccion.ejecutar(entorno_local);
            //console.log(resp);
            //Validacion Return
            if (resp instanceof retorno_1.Retorno) {
                //Validacion de retorno en funcion
                if (funcion.hasReturn() && resp.has_value) {
                    //Valido el tipo del retorno
                    let val = resp.value;
                    //console.log(resp, val, instruccion)
                    //console.log('eeee', val.ejecutar(e))
                    entFunc_1.entFunc.getInstance().fFuncion();
                    return val.ejecutar(entorno_local);
                }
                //Si la funcion tiene return pero el return no trae valor
                /*if (funcion.hasReturn() && !resp.hasValue()) {
                  Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe retornar un valor` }));
                  entFunc.getInstance().fFuncion();
                  return;
                }
                //Si la funcion no debe tener return y el return trae un valor
                if(!funcion.hasReturn() && resp.hasValue()){
                  Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} no debe retornar un valor` }));
                  entFunc.getInstance().fFuncion();
                  return;
                }*/
                //Si solo es un return
                entFunc_1.entFunc.getInstance().fFuncion();
                return;
            }
        }
        //Valido si la funcion debia retornar algo
        if (funcion.hasReturn()) {
            errores_1.Errores.getInstance().push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe retornar un valor` }));
            entFunc_1.entFunc.getInstance().fFuncion();
            return;
        }
        entFunc_1.entFunc.getInstance().fFuncion();
    }
}
exports.llamfuc = llamfuc;
