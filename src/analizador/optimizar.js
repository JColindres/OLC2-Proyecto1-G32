"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimizar = void 0;
const Objeto_Optimizar = require("./Reportes/Objeto_Optimizar");
const Rep_Optimizar = require("./Reportes/Rep_Optimizar");
class Optimizar {
    constructor(raiz) {
        Object.assign(this, { raiz });
    }
    identificar(etiqueta, nodo) {
        if (nodo == null || !(nodo instanceof Object)) {
            return false;
        }
        if (nodo.hasOwnProperty('label') && nodo.label != null) {
            return nodo.label === etiqueta;
        }
        return false;
    }
    recorrer() {
        this.salida = '';
        if (this.raiz != null) {
            try {
                this.recorrido(this.raiz);
            }
            catch (error) {
                return 'No se encontró por algun error';
            }
            return this.salida;
        }
        return 'No se puede optimizar';
    }
    recorrido(nodo) {
        if (nodo instanceof Object) {
            if (this.identificar('S', nodo)) {
                this.recorrido(nodo.hijos[0]);
            }
        }
        if (this.identificar('INICIO', nodo)) {
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    this.recorrido(element);
                }
            });
        }
        if (this.identificar('HEADER', nodo)) {
            this.salida += nodo.hijos[0] + ' ' + nodo.hijos[1] + '\n';
            this.recorrido(nodo.hijos[2]);
        }
        if (this.identificar('L_DECLARACION', nodo)) {
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    this.recorrido(element);
                }
            });
        }
        if (this.identificar('DECLARACION', nodo)) {
            nodo.hijos.forEach((element) => {
                this.salida += element + ' ';
                if (element == ';') {
                    this.salida += '\n';
                }
            });
        }
        if (this.identificar('FUNCIONES', nodo)) {
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    this.recorrido(element);
                }
                else {
                    this.salida += element + ' ';
                    if (element == ';' || element == '{') {
                        this.salida += '\n';
                    }
                }
            });
        }
        if (this.identificar('BLOQUES', nodo)) {
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    this.recorrido(element);
                }
            });
        }
        if (this.identificar('ASIGNA', nodo)) {
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    this.recorrido(element);
                }
                else {
                    this.salida += element + ' ';
                    if (element == ';') {
                        this.salida += '\n';
                    }
                }
            });
        }
        if (this.identificar('ASIGNA_EXPR', nodo)) {
            let id = nodo.hijos[0];
            let arg1 = nodo.hijos[2].hijos[0];
            let op = nodo.hijos[2].hijos[1];
            let arg2 = nodo.hijos[2].hijos[2];
            let linea = nodo.linea;
            let nuevo;
            let anterior;
            //regla 6  T1 = T1 +0; Se elimina 
            if (id == arg1 && arg2 == 0 && op == '+' || id == arg2 && arg1 == 0 && op == '+') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                nuevo = ' ';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '6', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            // regla 7  T1 = T1 - 0; se elimina
            if (id == arg1 && arg2 == 0 && op == '-') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                nuevo = ' ';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '7', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 8 T1 = T1 * 1; se elimina
            if (id == arg1 && arg2 == 1 && op == '*' || id == arg2 && arg1 == 1 && op == '*') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                nuevo = ' ';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '8', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 9 T1 = T1 / 1; se elimina
            if (id == arg1 && arg2 == 1 && op == '/') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                nuevo = ' ';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '9', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 10 T1 = T2 + 0;; T1 = T2;
            if (id != arg1 && arg2 == 0 && op == '+' || id != arg2 && arg1 == 0 && op == '+') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                if (arg2 == 0) {
                    this.salida += id + ' ' + '=' + ' ' + arg1 + ';' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg1 + ';';
                }
                else if (arg1 == 0) {
                    this.salida += id + ' ' + '=' + ' ' + arg2 + ';' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg2 + ';';
                }
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '10', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 11 T1 = T2 - 0 ; T1 = T2; 
            if (id != arg1 && arg2 == 0 && op == '-') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                if (arg2 == 0) {
                    this.salida += id + ' ' + '=' + ' ' + arg1 + ';' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg1 + ';';
                }
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '11', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 12 X = Y *1 ; x = y; 
            if (id != arg1 && arg2 == 1 && op == '*' || id != arg2 && arg1 == 1 && op == '*') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                if (arg2 == 1) {
                    this.salida += id + ' ' + '=' + ' ' + arg1 + ';' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg1 + ';';
                }
                else if (arg1 == 1) {
                    this.salida += id + ' ' + '=' + ' ' + arg2 + ';' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg2 + ';';
                }
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '12', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 13 X = Y / 1 ; x = y; 
            if (id != arg1 && arg2 == 1 && op == '/') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                this.salida += id + ' ' + '=' + ' ' + arg1 + ';' + '\n';
                nuevo = id + ' ' + '=' + ' ' + arg1 + ';';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '13', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 14 x = y * 2 ; x = y + y ; 
            if (id != arg1 && arg2 == 2 && op == '*' || id != arg2 && arg1 == 2 && op == '*') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                if (arg2 == 2) {
                    this.salida += id + ' ' + '=' + ' ' + arg1 + ' + ' + arg1 + ' ;' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg1 + ' + ' + arg1 + ' ;';
                }
                else if (arg1 == 2) {
                    this.salida += id + ' ' + '=' + ' ' + arg2 + ' + ' + arg2 + ' ;' + '\n';
                    nuevo = id + ' ' + '=' + ' ' + arg2 + ' + ' + arg2 + ' ;';
                }
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '14', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 15 T1 = T2 *0 ; T1 = 0;
            if (id != arg1 && arg2 == 0 && op == '*' || id != arg2 && arg1 == 0 && op == '*') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                this.salida += id + ' ' + '=' + ' ' + 0 + ' ;' + '\n';
                nuevo = id + ' ' + '=' + ' ' + 0 + ' ;';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '15', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
            //regla 16 x = 0/y ; x = 0;
            if (id != arg2 && arg1 == 0 && op == '/') {
                anterior = id + ' ' + '=' + arg1 + ' ' + op + ' ' + arg2;
                this.salida += id + ' ' + '=' + ' ' + 0 + ' ;' + '\n';
                nuevo = id + ' ' + '=' + ' ' + 0 + ' ;';
                Rep_Optimizar.Rep_Optimizar.getInstance().push(new Objeto_Optimizar.Objeto_Optimizar({ tipo: 'Simplificación algebraica y reducción por fuerza',
                    regla: '16', eliminado: anterior, nuevo: nuevo, fila: linea }));
            }
        }
    }
}
exports.Optimizar = Optimizar;
;
