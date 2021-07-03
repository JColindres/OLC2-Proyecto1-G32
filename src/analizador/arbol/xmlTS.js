"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlTS = void 0;
class XmlTS {
    constructor() {
        this.tabla = [];
    }
    agregar(identificador, valor, ambito, tipo, linea, columna, nodo, direccion) {
        this.tabla.push([identificador, valor, ambito, tipo, linea, columna, nodo, direccion]);
    }
    concatenar(nueva) {
        this.tabla = this.tabla.concat(nueva);
    }
}
exports.XmlTS = XmlTS;
