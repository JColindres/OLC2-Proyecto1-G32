import { Tipo } from '../expresiones/tipo';
import { Arreglo } from './arreglo';

export class Variable {
  id: string;
  tipo_asignado: Tipo;
  valor: any;
  dimensiones: number;

  constructor({ id, tipo_asignado = null, valor = null, dimensiones = 0}: { id: string, tipo_asignado?: Tipo, valor?: any, dimensiones?: number}) {
    Object.assign(this, { id, tipo_asignado, valor, dimensiones });
  }

  isArray(): boolean {
    // return this.dimensiones > 0;
    return this.tipo_asignado == Tipo.ARRAY || this.valor instanceof Arreglo;
  }

  isNumber(): boolean{
    return this.tipo_asignado == Tipo.INT || typeof this.valor == 'number';
  }

  hasTipoAsignado() : boolean{
    return this.tipo_asignado != null;
  }

  getValor() : any {
    return this.valor;
  }

  public toString() : string{
    let salida = `Variable: ${this.id} - Valor: ${this.valor}`;
    return salida;
  }

}
