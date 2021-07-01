import { Instruccion } from "../interfaces/instruccion";
import { Tipo } from "../expresiones/tipo";
import { Variable } from "./variable";

export class Funcion{
  id: string;
  instrucciones: Array<Instruccion>;
  tipo_return: Tipo;
  lista_parametros: Array<Variable>;

  constructor(id: string, instrucciones: Array<Instruccion>, tipo_return: Tipo = Tipo.VOID, lista_parametros: Array<Variable> = null){
    Object.assign(this, {id, instrucciones, tipo_return, lista_parametros});
  }

  hasReturn() : boolean{
    return this.tipo_return != Tipo.VOID;
  }

  hasParametros() : boolean{
    return this.lista_parametros != null;
  }

  getParametrosSize() : number{
    return this.hasParametros() ? this.lista_parametros.length : 0;
  }

  public toString() : string{
    const parametros = this.lista_parametros != null ? this.lista_parametros.length : 0;
    let salida = `Funcion: ${this.id} - Parametros: ${parametros} - Return Asignado: ${this.hasReturn()?'Si':'No'}`;
    return salida;
  }
}
