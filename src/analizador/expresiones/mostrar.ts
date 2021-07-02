import * as _ from 'lodash';
import { Entorno } from '../interfaces/entorno';
import { Instruccion } from '../interfaces/instruccion';

export class Mostrar extends Instruccion{

  instrucciones : Instruccion;

  constructor(linea: string, instrucciones: Instruccion){
    super(linea);
    Object.assign(this, {instrucciones});
  }

  ejecutar(e: Entorno) {
    if(!this.instrucciones){
      return null;
    }
    //this.instrucciones.forEach(inst => {
      let res = this.instrucciones.ejecutar(e);
      res = _.cloneDeep(res);
      const salida = res ?? 'null';
      console.log(salida);
      //Salida.getInstance().push(salida);
    //});
  }

}