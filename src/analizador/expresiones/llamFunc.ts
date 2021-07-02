import _ = require("lodash");
import { Error } from "../arbol/error";
import { Errores } from "../arbol/errores";
import { entFunc } from "../interfaces/entFunc";
import { Entorno } from "../interfaces/entorno";
import { Instruccion } from "../interfaces/instruccion";
import { Retorno as ejeReturn } from "./ejeReturn";
import { Retorno } from "./retorno";
import { getTipo } from "./tipo";

export class llamfuc extends Instruccion {
  id: string;
  lista_parametros: Array<Instruccion>;

  constructor(linea: string, id: string, lista_parametros: Array<Instruccion> = null) {
    super(linea);
    Object.assign(this, { id, lista_parametros });
  }

  ejecutar(e: Entorno) {
    let entorno_aux = new Entorno();
    let entorno_local = new Entorno(e);

    const funcion = _.cloneDeep(e.getFuncion(this.id));

    //Validacion de funcion existente
    if (!funcion) {
      Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna funcion con el nombre ${this.id}` }));
      return;
    }

    //Si la llamada  de la funcion trae parametros
    if (this.lista_parametros) {
      //Si la funcion no tiene parametros
      if (!funcion.hasParametros()) {
        Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} no recibe parametros` }));
        return;
      }
      //Si la funcion tiene parametros debe ser la misma cantidad
      if (this.lista_parametros.length != funcion.lista_parametros.length) {
        Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La cantidad de parametros no coincide ${this.id}` }));
        return;
      }
      //Declaro los parametros
      for (let i = 0; i < this.lista_parametros.length; i++) {
        const exp = this.lista_parametros[i];
        const variable = funcion.lista_parametros[i];

        const valor = exp.ejecutar(entorno_local);

        //Validacion de tipo a asignar
        if (valor != null && variable.hasTipoAsignado() && variable.tipo_asignado != getTipo(valor)) {
          Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El parametro ${variable.id} de la funcion ${this.id} no es del tipo enviado en la llamada de la funcion` }));
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
        Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe recibir ${funcion.getParametrosSize()} parametros` }));
        return;
      }
    }

    entorno_local.variables = entorno_aux.variables;
    //Si es una funcion anidada que estoy ejecutando y estoy dentro de una funcion
    if (entFunc.getInstance().ejecFuncion() && this.id.endsWith('_')) {
      //No debo cambiar el entorno padre, lo dejo aqui por si acaso :D
    }
    else {
      entorno_local.padre = e.getEntornoGlobal();
    }

    entFunc.getInstance().iFuncion();
    
    //Ejecuto las instrucciones
    for (let instruccion of funcion.instrucciones) {
      const resp = instruccion.ejecutar(entorno_local);
      //Validacion Return
      if (resp instanceof ejeReturn) {
        //Validacion de retorno en funcion
        if (funcion.hasReturn() && resp.hasValue()) {
          //Valido el tipo del retorno
          let val = resp.getValue();
          if(val != null && getTipo(val) != funcion.tipo_return){
            Errores.getInstance().push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} esta retornando un tipo distinto al declarado`}));
            entFunc.getInstance().fFuncion();
            return;
          }
          entFunc.getInstance().fFuncion();
          return val;
        }
        //Si la funcion tiene return pero el return no trae valor
        if (funcion.hasReturn() && !resp.hasValue()) {
          Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe retornar un valor` }));
          entFunc.getInstance().fFuncion();
          return;
        }
        //Si la funcion no debe tener return y el return trae un valor
        if(!funcion.hasReturn() && resp.hasValue()){
          Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} no debe retornar un valor` }));
          entFunc.getInstance().fFuncion();
          return;
        }
        //Si solo es un return
        entFunc.getInstance().fFuncion();
        return;
      }
    }

    //Valido si la funcion debia retornar algo
    if (funcion.hasReturn()) {
      Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La funcion ${this.id} debe retornar un valor` }));
      entFunc.getInstance().fFuncion();
      return;
    }

    entFunc.getInstance().fFuncion();
  }

}