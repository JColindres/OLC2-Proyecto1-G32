import { Funcion } from '../expresiones/funcion';
import { Variable } from '../expresiones/variable';
import * as _ from 'lodash';

export class Entorno {
  variables: Map<String, Variable>;
  padre: Entorno;
  funciones: Map<String, Funcion>;

  constructor(padre?: Entorno) {
    this.padre = padre != null ? padre : null;
    this.variables = new Map();
    this.funciones = new Map();
  }

  setVariable(variable: Variable): void {
    this.variables.set(variable.id, variable);
  }

  getVariable(id: string): Variable {
    for (let e: Entorno = this; e != null; e = e.padre) {
      let variable = e.variables.get(id);
      if (variable != null) return variable;
    }
    return null;
  }

  hasVariable(id: string): boolean {
    for (let e: Entorno = this; e != null; e = e.padre) {
      if (e.variables.has(id)) {
        return true;
      }
    }
    return false;
  }

  updateValorVariable(id: string, valor: any) {
    const variable = this.getVariable(id);
    if (variable) {
      variable.valor = valor;
    }
  }


  setFuncion(funcion: Funcion) {
    this.funciones.set(funcion.id, funcion);
  }

  hasFuncion(id: string): boolean {
    for (let e: Entorno = this; e != null; e = e.padre) {
      if (e.funciones.has(id)) {
        return true;
      }
    }
    return false;
  }

  getFuncion(id: string): Funcion {
    for (let e: Entorno = this; e != null; e = e.padre) {
      if (e.funciones.has(id)) {
        return e.funciones.get(id);
      }
    }
    return null;
  }

  //Utilizado para saber si debo ir a una funcion a buscar la variable
  deboBuscarEnFunciones(id: string): boolean {
    const ids = id.split("_");
    if (ids.length < 3) return false;
    if (ids[0] != 'nv') return false;
    return true;
  }

  //Utilizado para obtener el id de la funcion en la cual debo ir a buscar
  getIdFuncionABuscar(id: string): string {
    const ids = id.split("_", 2);
    return ids[1] ?? '';
  }

  getEntornoGlobal(): Entorno {
    for (let e: Entorno = this; e != null; e = e.padre) {
      if (e.padre == null) return e;
    }
  }

  public toString(): string {
    let salida = `*** VARIABLES ****\n`;
    for (let variable of Array.from(this.variables.values())) {
      salida += variable.toString() + '\n';
    }
    return salida;
  }

  getVariables() : Array<Variable>{
    return Array.from(this.variables.values());
  }

}
