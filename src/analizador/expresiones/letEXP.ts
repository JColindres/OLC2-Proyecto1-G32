import { Error } from "../arbol/error";
import { Errores } from "../arbol/errores";
import { Entorno } from "../interfaces/entorno";
import { Instruccion } from "../interfaces/instruccion";
import { getTipo } from "../expresiones/tipo";
import { Variable } from "../expresiones/variable";
import * as _ from 'lodash';
import { entFunc } from "../interfaces/entFunc";

export class letEXP extends Instruccion{
  id: string;
  exp: Instruccion;

  constructor(linea: string, id: string, exp: Instruccion){
    super(linea);
    Object.assign(this, {id, exp});
  }

  ejecutar(e: Entorno) {
    //Validacion de variable existente
    let variable = e.getVariable(this.id);
    if(variable && !entFunc.getInstance().ejecFuncion()){
      Errores.getInstance().push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una variable declarada con el id ${this.id}`}));
      return ;
    }

    //Creacion de variable en el entorno
    let valor = this.exp.ejecutar(e);
    valor = _.cloneDeep(valor);

    const tipo_asignado = getTipo(valor);
    variable = new Variable({id: this.id, tipo_asignado, valor});
    e.setVariable(variable);
  }

}