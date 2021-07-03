import * as _ from 'lodash';
import { Entorno } from '../interfaces/entorno';
import { Instruccion } from '../interfaces/instruccion';
import { Arreglo } from './ejeArreglo';
import { If_Else } from './if_else';

export class Mostrar extends Instruccion{

  impresion : Instruccion;

  constructor(linea: string, impresion: Instruccion){
    super(linea);
    Object.assign(this, {impresion});
  }

  ejecutar(e: Entorno): any {
    if(!this.impresion){
      return null;
    }
      let res = this.impresion.ejecutar(e);
      res = _.cloneDeep(res);
      if(res instanceof Arreglo){
        res = res.toString();
      }
      const salida = res ?? 'null';
      console.log(salida);
      return salida;
  }

}