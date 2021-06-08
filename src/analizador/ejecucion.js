"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ejecucion = void 0;
const xmlTS_1 = require("./arbol/xmlTS");
class Ejecucion {
    constructor(prologo, cuerpo, cadena) {
        this.tildes = ['á', 'é', 'í', 'ó', 'ú'];
        this.prologoXml = prologo;
        this.cuerpoXml = cuerpo;
        this.cadena = cadena;
    }
    verObjetos() {
        this.ts = new xmlTS_1.XmlTS();
        this.cuerpoXml.forEach(element => {
            let etiqueta = "doble";
            if (!element.doble) {
                etiqueta = "única";
            }
            this.ts.agregar(element.identificador, element.texto, "Raiz", "Etiqueta " + etiqueta, element.linea, element.columna);
            if (element.listaAtributos.length > 0) {
                element.listaAtributos.forEach(atributos => {
                    this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna);
                });
            }
            if (element.listaObjetos.length > 0) {
                this.tablaRecursiva(element.listaObjetos, element.identificador);
            }
        });
    }
    tablaRecursiva(elemento, entorno) {
        elemento.forEach(element => {
            let etiqueta = "doble";
            if (!element.doble) {
                etiqueta = "única";
            }
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
            this.ts.agregar(element.identificador, texto, entorno, "Etiqueta " + etiqueta, element.linea, element.columna);
            if (element.listaAtributos.length > 0) {
                element.listaAtributos.forEach(atributos => {
                    this.ts.agregar(atributos.identificador, atributos.valor, element.identificador, "Atributo", atributos.linea, atributos.columna);
                });
            }
            if (element.listaObjetos.length > 0) {
                this.tablaRecursiva(element.listaObjetos, element.identificador);
            }
        });
    }
}
exports.Ejecucion = Ejecucion;
