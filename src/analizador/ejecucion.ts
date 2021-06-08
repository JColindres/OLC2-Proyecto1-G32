import { Objeto } from "./abstractas/objeto";
import { XmlTS } from "./arbol/xmlTS";

export class Ejecucion {
    prologoXml: JSON;
    cuerpoXml: Array<Objeto>;
    cadena: string; 

    version: string;
    encoding: string;

    ts: XmlTS;

    tildes: Array<String> = ['á','é','í','ó','ú'];

    raiz: Object;
    contador: number;
    dot: string;

    constructor(prologo: JSON, cuerpo:Array<Objeto>, cadena: string , raiz: Object){
        this.prologoXml = prologo;
        this.cuerpoXml = cuerpo;
        this.cadena = cadena;
        Object.assign(this, { raiz, contador: 0, dot: '' });
    }

    verObjetos(){
        this.ts = new XmlTS();
        
        this.cuerpoXml.forEach(element => {
            let etiqueta = "doble";
            if(!element.doble){
                etiqueta = "única"
            }
            this.ts.agregar(element.identificador, element.texto,"Raiz", "Etiqueta " + etiqueta, element.linea, element.columna);
            if(element.listaAtributos.length > 0){
                element.listaAtributos.forEach(atributos => {
                    this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna);
                });
            }
            if(element.listaObjetos.length > 0){
                this.tablaRecursiva(element.listaObjetos, element.identificador);
            }
        });
    }

    tablaRecursiva(elemento: Array<Objeto>, entorno: string){
        elemento.forEach(element => {
            let etiqueta = "doble";
            if(!element.doble){
                etiqueta = "única"
            }
            let texto = ""
            for (var i = 0; i < element.texto.length; i++){                
                if(this.tildes.includes(element.texto[i])){
                    texto += element.texto[i];
                }
                else if(this.tildes.includes(element.texto[i-1])){
                    texto += element.texto[i];
                }
                else{
                    texto += " " + element.texto[i];
                }
            }
            this.ts.agregar(element.identificador, texto, entorno, "Etiqueta " + etiqueta, element.linea, element.columna);
            if(element.listaAtributos.length > 0){
                element.listaAtributos.forEach(atributos => {
                    this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna);
                });
            }
            if(element.listaObjetos.length > 0){
                this.tablaRecursiva(element.listaObjetos, element.identificador);
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
}