import { forEach } from "lodash";
import { Objeto } from "./abstractas/objeto";
import { XmlTS } from "./arbol/xmlTS";
import { Operacion, Operador } from "./expresiones/operacion";
import { Primitivo } from "./expresiones/primitivo";
import { Expresion } from "./Interfaces/Expresion";

export class Ejecucion {
  prologoXml: JSON;
  cuerpoXml: Array<Objeto>;
  cadena: string;

  version: string;
  encoding: string;

  esRaiz: boolean;
  descendiente: boolean;
  atributo: boolean;
  atributoTexto: string;
  atributoIdentificacion: any[];
  indiceValor: number;
  nodo_descendente : boolean; //  -> //*
  atributo_nodo: boolean;   // -> /@*
  ej_child: boolean;  //::child

  consultaXML: Array<Objeto>;
  ts: XmlTS;

  tildes: Array<String> = ['á', 'é', 'í', 'ó', 'ú'];

  raiz: Object;
  contador: number;
  dot: string;

  constructor(prologo: JSON, cuerpo: Array<Objeto>, cadena: string, raiz: Object) {
    this.prologoXml = prologo;
    this.cuerpoXml = cuerpo;
    this.cadena = cadena;
    Object.assign(this, { raiz, contador: 0, dot: '' });
  }

  verObjetos() {
    this.ts = new XmlTS();

    this.cuerpoXml.forEach((element, index) => {
      let etiqueta = "doble";
      if (!element.doble) {
        etiqueta = "única"
      }
      this.ts.agregar(element.identificador, element.texto, "Raiz", "Etiqueta " + etiqueta, element.linea, element.columna, null);
      if (element.listaAtributos.length > 0) {
        element.listaAtributos.forEach(atributos => {
          this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna, this.cuerpoXml[index]);
        });
      }
      if (element.listaObjetos.length > 0) {
        this.tablaRecursiva(element.listaObjetos, element.identificador, this.cuerpoXml, index);
      }
    });
    //console.log(this.ts);
  }

  tablaRecursiva(elemento: Array<Objeto>, entorno: string, padre: Array<Object>, indice: number) {
    elemento.forEach((element, index) => {
      let etiqueta = "doble";
      if (!element.doble) {
        etiqueta = "única"
      }
      let texto = ""
      for (var i = 0; i < element.texto.length; i++) {
        if (this.tildes.includes(element.texto[i])) {
          texto += element.texto[i];
        }
        else if (this.tildes.includes(element.texto[i - 1])) {
          texto += element.texto[i];
        }
        else {
          texto += " " + element.texto[i];
        }
      }
      this.ts.agregar(element.identificador, texto, entorno, "Etiqueta " + etiqueta, element.linea, element.columna, padre[indice]);
      if (element.listaAtributos.length > 0) {
        element.listaAtributos.forEach(atributos => {
          this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna, elemento[index]);
        });
      }
      if (element.listaObjetos.length > 0) {
        this.tablaRecursiva(element.listaObjetos, element.identificador, elemento, index);
      }
    });
  }

  getDot(): string {
    this.contador = 0;
    this.dot = "digraph G {\n";
    if (this.raiz != null) {
      this.generacionDot(this.raiz);
    }
    this.dot += "\n}";
    return this.dot;
  }

  generacionDot(nodo: any): void {
    if (nodo instanceof Object) {
      let idPadre = this.contador;
      this.dot += `node${idPadre}[label="${this.getStringValue(nodo.label)}"];\n`;
      if (nodo.hasOwnProperty("hijos")) {
        nodo.hijos.forEach((nodoHijo: any) => {
          let idHijo = ++this.contador;
          this.dot += `node${idPadre} -> node${idHijo};\n`;
          if (nodoHijo instanceof Object) {
            this.generacionDot(nodoHijo);
          } else {
            this.dot += `node${idHijo}[label="${this.getStringValue(nodoHijo)}"];`;
          }
        });
      }
    }
  }

  getStringValue(label: string): string {
    if (label.startsWith("\"") || label.startsWith("'") || label.startsWith("`")) {
      return label.substr(1, label.length - 2);
    }
    return label;
  }

  identificar(etiqueta: string, nodo: any): boolean {
    if (nodo == null || !(nodo instanceof Object)) {
      return false;
    }
    if (nodo.hasOwnProperty('label') && nodo.label != null) {
      return nodo.label === etiqueta;
    }
    return false;
  }

  recorrer(): string {
    if (this.raiz != null) {
      this.esRaiz = true;
      this.descendiente = false;
      this.atributo = false;
      this.atributoTexto = '';
      this.atributoIdentificacion = [];
      this.indiceValor = null;
      this.consultaXML = this.cuerpoXml;
      this.verObjetos();
      this.recorrido(this.raiz);
      //console.log(this.atributoIdentificacion);
      return this.traducir();
    }
    return 'no se pudo';
  }

  recorrido(nodo: any): void {
    if (nodo instanceof Object) {
      if (this.identificar('S', nodo)) {
        this.recorrido(nodo.hijos[0]);
        //console.log(this.consultaXML);
      }

      if (this.identificar('INSTRUCCIONES', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(element);
            if (element === '|') {
              this.consultaXML.forEach(element => {
                this.atributoIdentificacion.push({ cons: element, atributo: this.atributo, texto: this.atributoTexto })
              });
              this.esRaiz = true;
              this.descendiente = false;
              this.atributo = false;
              this.atributoTexto = '';
              this.indiceValor = null;
              this.consultaXML = this.cuerpoXml;
            }
            else if (!(element === '[') && !(element === ']')) {
              this.consultaXML = this.reducir(this.consultaXML, element, 'INSTRUCCIONES');
              //console.log(this.consultaXML);
            }
          }
        });
        this.consultaXML.forEach(element => {
          this.atributoIdentificacion.push({ cons: element, atributo: this.atributo, texto: this.atributoTexto })
        });
        this.atributoIdentificacion.sort((n1, n2) => {
          if (n1.cons.linea > n2.cons.linea) {
            return 1;
          }

          if (n1.cons.linea < n2.cons.linea) {
            return -1;
          }

          return 0;
        });
      }

      if (this.identificar('RAIZ', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(element);
            this.consultaXML = this.reducir(this.consultaXML, element, 'RAIZ');
          }
        });
      }

      if (this.identificar('DESCENDIENTES_NODO', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(element);
            this.consultaXML = this.reducir(this.consultaXML, element, 'DESCENDIENTES_NODO');
          }
        });
      }

      if (this.identificar('PADRE', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(element);
            this.consultaXML = this.reducir(this.consultaXML, element, 'PADRE');
          }
        });
      }

      if (this.identificar('ATRIBUTO_PREDICADO', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(element);
            this.consultaXML = this.reducir(this.consultaXML, element, 'ATRIBUTO_PREDICADO');
          }
        });
      }

      if (this.identificar('ORDEN', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string' && element === 'last') {
            let cons: Array<Objeto>;
            cons = [];
            this.consultaXML.forEach((element, index) => {
              if (index === this.consultaXML.length - 1) {
                cons.push(element);
              }
            });
            this.consultaXML = cons;
          }
        });
      }

      if (this.identificar('ARITMETICAS', nodo) || this.identificar('integer', nodo)) {
        if(this.identificar('integer', nodo)){
          this.consultaXML = this.reducir(this.consultaXML, nodo.hijos[0], 'INSTRUCCIONES');
        }
        else{
          let val:Expresion = null;
          val = this.calcular(nodo);
          this.consultaXML = this.reducir(this.consultaXML, val.getValorImplicito(val), 'INSTRUCCIONES');
        }
      }

      if (this.identificar('HIJOS', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            //console.log(this.consultaXML);
            this.consultaXML = this.reducir(this.consultaXML, element, 'HIJOS');
          }
        });
      }

      if (this.identificar('ATRIBUTO_NODO', nodo)) {
        nodo.hijos.forEach((element: any) => {
          if (element instanceof Object) {
            this.recorrido(element);
          }
          else if (typeof element === 'string') {
            this.consultaXML = this.reducir(this.consultaXML, element, 'ATRIBUTO_NODO');
          }
        });
      }

      if (this.identificar('EJES', nodo)) {
        //Se obtiene el tipo de eje y se activa el bool
        if(nodo.hijos[0] == 'child')
        {
          this.ej_child = true;
        }
      }
    }
  }

  reducir(consulta: Array<Objeto>, etiqueta: string, nodo: string): Array<Objeto> {
    if (nodo === 'RAIZ') {
      if (etiqueta === '/') {
        this.descendiente = false;
        return consulta;
      }
      else if (etiqueta === '@') {
        this.atributo = true;
        return consulta;
      }
      else if (this.atributo) {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          element.listaAtributos.forEach(atributo => {
            if (atributo.identificador === etiqueta) {
              this.atributoTexto = etiqueta;
              cons.push(element);
            }
          });
        });
        return cons;
      }
      else if (etiqueta === 'node()') {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          this.ts.tabla.forEach(padre => {
            if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
              if (element.listaObjetos.length > 0) {
                cons = cons.concat(element.listaObjetos);
              } else {
                //arreglar cuando solo viene texto 
              }
            }
          });
        });
        return cons;
      }
    }
    else if (nodo === 'DESCENDIENTES_NODO') {
      if (etiqueta === '//') {
        this.descendiente = true;
        this.esRaiz = false;
        return consulta;
      }
      else if (etiqueta === '@') {
        this.atributo = true;
        return consulta;
      }
      else if (this.atributo) {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          element.listaAtributos.forEach(atributo => {
            if (atributo.identificador === etiqueta) {
              this.atributoTexto = etiqueta;
              cons.push(element);
            }
          });
          if (element.listaObjetos.length > 0) {
            cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, true));
          }
        });
        return cons;
      }
      else if (etiqueta === '//*') {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          this.ts.tabla.forEach(padre => {
            if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
              if (element.listaObjetos.length > 0) {
                cons = cons.concat(element.listaObjetos);
              }
            }
          });
        });
        this.nodo_descendente = true;
        return cons;
      }
    }
    else if (nodo === 'INSTRUCCIONES') {
      let cons: Array<Objeto>;
      cons = [];
      if (Number.isInteger(parseInt(etiqueta))) {
        let indice = parseInt(etiqueta);
        //console.log(indice);
        consulta.forEach((element, index) => {
          if (index === indice - 1) {
            cons.push(element);
          }
        });
        return cons;
      }
      //Axes - ::child
      else if (this.ej_child) {
        //Si viene una ruta tipo -> //nodo::child
        if(this.descendiente) {
          consulta.forEach(element => {
            if (element.identificador === etiqueta) {
              cons.push(element);
            }
            if (element.listaObjetos.length > 0) {
              cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, false));
            }
          });
          this.ej_child = false;
          return cons;
        } else {
          //Si viene una ruta normal
          consulta.forEach(element => {
            if (element.listaObjetos.length > 0) {
              element.listaObjetos.forEach(elements => {
                if (elements.identificador === etiqueta) {
                  cons.push(elements);
                }
              });
            }
          });
          this.ej_child = false;
          return cons;
        }        
      }
      else if (!this.descendiente) {
        if (this.esRaiz) {
          consulta.forEach(element => {
            if (element.identificador === etiqueta) {
              cons.push(element);
            }
          });
          this.esRaiz = false;
          return cons;
        }
        else {
          consulta.forEach(element => {
            if (element.listaObjetos.length > 0) {
              element.listaObjetos.forEach(elements => {
                if (elements.identificador === etiqueta) {
                  cons.push(elements);
                }
              });
            }
          });
          return cons;
        }
      }
      else {
        consulta.forEach(element => {
          if (element.identificador === etiqueta) {
            cons.push(element);
          }
          if (element.listaObjetos.length > 0) {
            cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, false));
          }
        });
        return cons;
      }
    }
    else if (nodo === 'PADRE') {
      if (etiqueta === '/..') {
        if (this.atributo) {
          this.descendiente = false;
          this.atributo = false;
          return consulta;
        }
        this.descendiente = false;
        this.atributo = false;
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          this.ts.tabla.forEach(padre => {
            if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
              let a = padre[6];
              let b = false;
              cons.forEach(element => {
                if (element == a) {
                  b = true;
                }
              });
              if (!b) {
                cons.push(a);
              }
            }
          });
        });
        return cons;
      }
    }
    else if (nodo === 'ATRIBUTO_PREDICADO') {
      if (etiqueta === '@') {
        this.atributo = true;
        return consulta;
      }
      else if (this.atributo) {
        this.atributo = false;
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          element.listaAtributos.forEach(atributo => {
            if (atributo.identificador === etiqueta) {
              this.atributoTexto = etiqueta;
              cons.push(element);
            }
          });
        });
        return cons;
      }
    }
    else if (nodo === 'HIJOS') {
      if (etiqueta === '/*') {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
          this.ts.tabla.forEach(padre => {
            if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
              if (element.listaObjetos.length > 0) {
                cons = cons.concat(element.listaObjetos);
              }
            }
          });
        });
        return cons;
      }
    }
    if(nodo === 'ATRIBUTO_NODO'){
      if (etiqueta === '/@*') {
        let cons: Array<Objeto> = [];
        consulta.forEach(element => {
           if (element.listaAtributos.length > 0) {
                cons = cons.concat(element);
              }
        });
        this.atributo_nodo = true;
        return cons;
      }
    }
  }

  recDescen(a: Array<Objeto>, etiqueta: string, atributo: boolean): Array<Objeto> {
    let cons: Array<Objeto> = [];
    a.forEach((element) => {
      if (atributo) {
        element.listaAtributos.forEach(atributo => {
          if (atributo.identificador === etiqueta) {
            this.atributoTexto = etiqueta;
            cons.push(element);
          }
        });
        if (element.listaObjetos.length > 0) {
          cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, true));
        }
      }
      else {
        if (element.identificador === etiqueta) {
          cons.push(element);
        }
        else if (element.listaObjetos.length > 0) {
          cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, false));
        }
      }
    });
    return cons;
  }

  calcular(nodo: any): Expresion{
    if (this.identificar('ARITMETICAS', nodo)) {
      let izq:Expresion,der: Expresion = null;
      let op = "";
      nodo.hijos.forEach((element: any) => {
        if (element instanceof Object) {
          if(op === "" && this.identificar('integer', element)){
            izq = new Primitivo(Number(element.hijos[0]), 1, 1);
          }
          else if(!(op === "") && this.identificar('integer', element)){
            der = new Primitivo(Number(element.hijos[0]), 1, 1);
          }
          else if(op === "" && this.identificar('ARITMETICAS', element)){
            izq = this.calcular(element);
          }
          else if(!(op === "") && this.identificar('ARITMETICAS', element)){
            der = this.calcular(element);
          }
          else if(op === "" && this.identificar('ORDEN', element)){
            izq = new Primitivo(Number(this.consultaXML.length),1,1);
          }
          else if(!(op === "") && this.identificar('ORDEN', element)){
            der = new Primitivo(Number(this.consultaXML.length),1,1);
          }
        }
        else if (typeof element === 'string') {
          if(!(element === '(') && !(element === ')')){
            op = element;
          }
        }
      });
      if(izq && der && !(op === "")){
        let a: Operacion;
        if(op === '+'){
           a = new Operacion(izq, der, Operador.SUMA, 1, 1);
        }
        else if(op === '-'){
          a = new Operacion(izq, der, Operador.RESTA, 1, 1);
        }
        else if(op === '*'){
          a = new Operacion(izq, der, Operador.MULTIPLICACION, 1, 1);
        }
        else if(op === 'div'){
          a = new Operacion(izq, der, Operador.DIVISION, 1, 1);
        }
        else if(op === 'mod'){
          a = new Operacion(izq, der, Operador.MODULO, 1, 1);
        }
        return a;
      }
    }
  }

  traducir(): string {
    let cadena: string = '';
    let numero: number = 0;
    this.atributoIdentificacion.forEach(element => {
      numero++;
      if (!element.atributo) {
        let texto = "";
        //console.log("texto: " + element.identificador);
        for (var i = 0; i < element.cons.texto.length; i++) {
          if (this.tildes.includes(element.cons.texto[i])) {
            texto += element.cons.texto[i];
          }
          else if (this.tildes.includes(element.cons.texto[i - 1])) {
            texto += element.cons.texto[i];
          }
          else {
            texto += " " + element.cons.texto[i];
          }
        }
        cadena += '--------------------------------------(' + numero + ')---------------------------------\n';
        if (this.nodo_descendente){
          cadena += '<' + element.cons.identificador;
          if (element.cons.listaAtributos.length > 0) {
            element.cons.listaAtributos.forEach(atributos => {
              cadena += ' ' + atributos.identificador + '=' + atributos.valor;
            });
          }
          if (element.cons.doble) {
            cadena += '>\n';
          }
          else {
            cadena += '/>\n';
          }
          if (texto != '') {
            cadena += texto + '\n';
          }
          if (element.cons.listaObjetos.length > 0) {
            cadena += this.traducirRecursiva(element.cons.listaObjetos);
          }
          if (element.cons.doble) {
            cadena += '</' + element.cons.identificador + '>\n';
          }
          if (element.cons.listaObjetos.length > 0) {
            cadena += this.traducirRecursiva(element.cons.listaObjetos);
          }
        }
        else if (this.atributo_nodo){
          if (element.cons.listaAtributos.length > 0) {
            element.cons.listaAtributos.forEach(atributos => {
              cadena += ' ' + atributos.identificador + '=' + atributos.valor;
            });
          }
        }else{
          cadena += '<' + element.cons.identificador;
          if (element.cons.listaAtributos.length > 0) {
            element.cons.listaAtributos.forEach(atributos => {
              cadena += ' ' + atributos.identificador + '=' + atributos.valor;
            });
          }
          if (element.cons.doble) {
            cadena += '>\n';
          }
          else {
            cadena += '/>\n';
          }
          if (texto != '') {
            cadena += texto + '\n';
          }
          if (element.cons.listaObjetos.length > 0) {
            cadena += this.traducirRecursiva(element.cons.listaObjetos);
          }
          if (element.cons.doble) {
            cadena += '</' + element.cons.identificador + '>\n';
          }
        }
      }
      else {
        cadena += '--------------------------------------(' + numero + ')---------------------------------\n';
        element.cons.listaAtributos.forEach(atributo => {
          if (element.texto === atributo.identificador) {
            cadena += atributo.identificador + '=' + atributo.valor + '\n';
          }
        });
      }
    });
    return cadena;
  }

  traducirRecursiva(elemento: Array<Objeto>): string {
    let cadena: string = '';

    elemento.forEach(element => {
      let texto = "";
      for (var i = 0; i < element.texto.length; i++) {
        if (this.tildes.includes(element.texto[i])) {
          texto += element.texto[i];
        }
        else if (this.tildes.includes(element.texto[i - 1])) {
          texto += element.texto[i];
        }
        else {
          texto += " " + element.texto[i];
        }
      }
      cadena += '<' + element.identificador;
      if (element.listaAtributos.length > 0) {
        element.listaAtributos.forEach(atributos => {
          cadena += ' ' + atributos.identificador + '=' + atributos.valor;
        });
      }
      if (element.doble) {
        cadena += '>\n';
      }
      else {
        cadena += '/>\n';
      }
      if (texto != '') {
        cadena += texto + '\n';
      }
      if (element.listaObjetos.length > 0) {
        cadena += this.traducirRecursiva(element.listaObjetos);
      }
      if (element.doble) {
        cadena += '</' + element.identificador + '>\n';
      }
    });
    return cadena;
  }
}