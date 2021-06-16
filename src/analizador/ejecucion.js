"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ejecucion = void 0;
const error_1 = require("./arbol/error");
const errores_1 = require("./arbol/errores");
const xmlTS_1 = require("./arbol/xmlTS");
const operacion_1 = require("./expresiones/operacion");
const primitivo_1 = require("./expresiones/primitivo");
const relacional_1 = require("./expresiones/relacional");
class Ejecucion {
    constructor(prologo, cuerpo, cadena, raiz) {
        this.tildes = ['á', 'é', 'í', 'ó', 'ú'];
        this.prologoXml = prologo;
        this.cuerpoXml = cuerpo;
        this.cadena = cadena;
        Object.assign(this, { raiz, contador: 0, dot: '' });
    }
    verObjetos() {
        this.ts = new xmlTS_1.XmlTS();
        this.cuerpoXml.forEach((element, index) => {
            let etiqueta = "doble";
            if (!element.doble) {
                etiqueta = "única";
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
    tablaRecursiva(elemento, entorno, padre, indice) {
        elemento.forEach((element, index) => {
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
    getDot() {
        this.contador = 0;
        this.dot = "digraph G {\n";
        if (this.raiz != null) {
            this.generacionDot(this.raiz);
        }
        this.dot += "\n}";
        return this.dot;
    }
    generacionDot(nodo) {
        if (nodo instanceof Object) {
            let idPadre = this.contador;
            this.dot += `node${idPadre}[label="${this.getStringValue(nodo.label)}"];\n`;
            if (nodo.hasOwnProperty("hijos")) {
                nodo.hijos.forEach((nodoHijo) => {
                    let idHijo = ++this.contador;
                    this.dot += `node${idPadre} -> node${idHijo};\n`;
                    if (nodoHijo instanceof Object) {
                        this.generacionDot(nodoHijo);
                    }
                    else {
                        this.dot += `node${idHijo}[label="${this.getStringValue(nodoHijo)}"];`;
                    }
                });
            }
        }
    }
    getStringValue(label) {
        if (label.startsWith("\"") || label.startsWith("'") || label.startsWith("`")) {
            return label.substr(1, label.length - 2);
        }
        return label;
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
        if (this.raiz != null) {
            this.esRaiz = true;
            this.descendiente = false;
            this.atributo = false;
            this.atributoTexto = '';
            this.atributoIdentificacion = [];
            this.indiceValor = null;
            this.punto = '';
            this.consultaXML = this.cuerpoXml;
            this.verObjetos();
            try {
                this.recorrido(this.raiz);
            }
            catch (error) {
                return 'No se encontró por algun error';
            }
            //console.log(this.atributoIdentificacion);
            if (this.atributoIdentificacion.length > 0)
                return this.traducir();
            else
                return 'No se encontró';
        }
        return 'no se pudo';
    }
    recorrido(nodo) {
        if (nodo instanceof Object) {
            if (this.identificar('S', nodo)) {
                this.recorrido(nodo.hijos[0]);
                //console.log(this.consultaXML);
            }
            if (this.identificar('INSTRUCCIONES', nodo)) {
                nodo.hijos.forEach((element) => {
                    if (element instanceof Object) {
                        this.recorrido(element);
                    }
                    else if (typeof element === 'string') {
                        if (element === '|') {
                            this.consultaXML.forEach(element => {
                                this.atributoIdentificacion.push({ cons: element, atributo: this.atributo, texto: this.atributoTexto });
                            });
                            this.esRaiz = true;
                            this.descendiente = false;
                            this.atributo = false;
                            this.atributoTexto = '';
                            this.indiceValor = null;
                            this.punto = '';
                            this.consultaXML = this.cuerpoXml;
                        }
                        else if (!(element === '[') && !(element === ']') && !(element === '(') && !(element === ')')) {
                            this.consultaXML = this.reducir(this.consultaXML, element, 'INSTRUCCIONES');
                            //console.log(this.consultaXML);
                        }
                    }
                });
                this.consultaXML.forEach(element => {
                    this.atributoIdentificacion.push({ cons: element, atributo: this.atributo, texto: this.atributoTexto });
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
                nodo.hijos.forEach((element) => {
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
                nodo.hijos.forEach((element) => {
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
                nodo.hijos.forEach((element) => {
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
                nodo.hijos.forEach((element) => {
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
                nodo.hijos.forEach((element) => {
                    if (element instanceof Object) {
                        this.recorrido(element);
                    }
                    else if (typeof element === 'string' && element === 'last') {
                        let cons;
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
                if (this.identificar('integer', nodo)) {
                    this.consultaXML = this.reducir(this.consultaXML, nodo.hijos[0], 'INSTRUCCIONES');
                }
                else {
                    let val = null;
                    val = this.calcular(nodo, null, 0);
                    this.consultaXML = this.reducir(this.consultaXML, val.getValorImplicito(val), 'INSTRUCCIONES');
                }
            }
            if (this.identificar('RELACIONALES', nodo)) {
                let val = null;
                let cons = [];
                let es = '';
                nodo.hijos.forEach((element) => {
                    if (element instanceof Object) {
                        if (this.identificar('ATRIBUTO_PREDICADO', element)) {
                            es = 'es@';
                        }
                        else if (this.identificar('id', element)) {
                            es = 'esID';
                        }
                        else if (this.identificar('punto', element)) {
                            es = 'esPunto';
                        }
                        else if (this.identificar('PATH', element)) {
                            es = 'esPath';
                        }
                    }
                });
                this.consultaXML.forEach((element, index) => {
                    if (es === 'es@') {
                        if (element.listaAtributos.length > 0) {
                            val = this.calcular(nodo, element, index);
                            if (val.getValorImplicito(val)) {
                                cons.push(element);
                            }
                        }
                    }
                    else if (es === 'esID') {
                        console.log("entró esID");
                        if (element.listaObjetos.length > 0) {
                            val = this.calcular(nodo, element, index);
                            if (val.getValorImplicito(val)) {
                                cons.push(element);
                            }
                        }
                    }
                    else if (es === "esPunto") {
                        if (this.atributo) {
                            if (element.listaAtributos.length > 0) {
                                val = this.calcular(nodo, element, index);
                                if (val.getValorImplicito(val)) {
                                    cons.push(element);
                                }
                            }
                        }
                        else {
                            if (element) {
                                val = this.calcular(nodo, element, index);
                                if (val.getValorImplicito(val)) {
                                    cons.push(element);
                                }
                            }
                        }
                    }
                });
                if (cons.length > 0)
                    this.consultaXML = cons;
                else {
                    //this.consultaXML = [];
                    const er = new error_1.Error({ tipo: 'Semántico', linea: '0', descripcion: 'No existe ese atributo.' });
                    errores_1.Errores.getInstance().push(er);
                }
            }
            if (this.identificar('HIJOS', nodo)) {
                nodo.hijos.forEach((element) => {
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
                nodo.hijos.forEach((element) => {
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
                if (nodo.hijos[0] == 'child') {
                    this.ej_child = true;
                }
                else if (nodo.hijos[0] == 'attribute') {
                    this.ej_attrib = true;
                    this.atributo = true;
                }
            }
            if (this.identificar('ATRIBUTO_DESCENDIENTES', nodo)) {
                nodo.hijos.forEach((element) => {
                    if (element instanceof Object) {
                        this.recorrido(element);
                    }
                    else if (typeof element === 'string') {
                        this.consultaXML = this.reducir(this.consultaXML, element, 'ATRIBUTO_DESCENDIENTES');
                    }
                });
            }
            if (this.identificar('NODO_FUNCION', nodo)) {
                nodo.hijos.forEach((element) => {
                    if (element instanceof Object) {
                        this.recorrido(element);
                    }
                    else if (typeof element === 'string') {
                        this.consultaXML = this.reducir(this.consultaXML, element, 'NODO_FUNCION');
                    }
                });
            }
        }
    }
    reducir(consulta, etiqueta, nodo) {
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
                this.punto = etiqueta;
                let cons = [];
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
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                cons = cons.concat(element.listaObjetos);
                            }
                            else {
                                //arreglar cuando solo viene texto 
                                this.node_texto = true;
                                if (element.texto != null)
                                    cons = cons.concat(element);
                            }
                        }
                    });
                });
                return cons;
            }
            else if (etiqueta === 'text()') {
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                //elemento
                            }
                            else {
                                this.node_texto = true;
                                if (element.texto != null)
                                    cons = cons.concat(element);
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
                this.punto = etiqueta;
                let cons = [];
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
                let cons = [];
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
            else if (etiqueta === 'node()') {
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                cons = cons.concat(element.listaObjetos);
                            }
                            else {
                                //arreglar cuando solo viene texto 
                                this.node_texto = true;
                                if (element.texto != null)
                                    cons = cons.concat(element);
                            }
                        }
                    });
                });
                this.node_desc = true;
                return cons;
            }
            else if (etiqueta === 'text()') {
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                if (element.texto != null) {
                                    this.node_texto = true;
                                    cons = cons.concat(element.listaObjetos);
                                }
                            }
                            else {
                            }
                        }
                    });
                });
                return cons;
            }
        }
        else if (nodo === 'INSTRUCCIONES') {
            let cons;
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
                if (this.descendiente) {
                    this.punto = etiqueta;
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
                //Si viene una ruta normal -> /nodo::child
                else {
                    this.punto = etiqueta;
                    // Si child viene en la raiz -> child::raiz
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
            }
            //Axes - :: attrib
            else if (this.ej_attrib) {
                console.log("entro a axes::attrib");
                this.punto = etiqueta;
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
            else if (!this.descendiente) {
                this.punto = etiqueta;
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
                this.punto = etiqueta;
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
                let cons = [];
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
                let cons = [];
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
                let cons = [];
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
        else if (nodo === 'ATRIBUTO_NODO') {
            if (etiqueta === '/@*') {
                let cons = [];
                consulta.forEach(element => {
                    if (element.listaAtributos.length > 0) {
                        cons = cons.concat(element);
                    }
                });
                this.atributo_nodo = true;
                return cons;
            }
        }
        else if (nodo === 'NODO_FUNCION') {
            if (etiqueta === 'node()') {
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                cons = cons.concat(element.listaObjetos);
                            }
                            else {
                                //arreglar cuando solo viene texto 
                                this.node_texto = true;
                                if (element.texto != null)
                                    cons = cons.concat(element);
                            }
                        }
                    });
                });
                this.node_desc = true;
                return cons;
            }
            else if (etiqueta === 'text()') {
                let cons = [];
                consulta.forEach(element => {
                    this.ts.tabla.forEach(padre => {
                        if (padre[0] === element.identificador && padre[4] === element.linea && padre[5] === element.columna) {
                            if (element.listaObjetos.length > 0) {
                                //elemento
                            }
                            else {
                                this.node_texto = true;
                                if (element.texto != null)
                                    cons = cons.concat(element);
                            }
                        }
                    });
                });
                return cons;
            }
        }
        else if (nodo === 'ATRIBUTO_DESCENDIENTES') {
            if (etiqueta === '//@*') {
                let cons = [];
                consulta.forEach(element => {
                    if (element.listaAtributos.length > 0) {
                        cons = cons.concat(element);
                    }
                });
                //this.atributo_nodo = true; 
                return consulta;
            }
        }
    }
    recDescen(a, etiqueta, atributo) {
        let cons = [];
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
                    if (this.descendiente && element.listaObjetos.length > 0) {
                        cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, false));
                    }
                }
                else if (element.listaObjetos.length > 0) {
                    cons = cons.concat(this.recDescen(element.listaObjetos, etiqueta, false));
                }
            }
        });
        return cons;
    }
    calcular(nodo, logica, position) {
        if (this.identificar('ARITMETICAS', nodo)) {
            let izq, der = null;
            let op = "";
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    if (op === "" && this.identificar('integer', element)) {
                        izq = new primitivo_1.Primitivo(Number(element.hijos[0]), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('integer', element)) {
                        der = new primitivo_1.Primitivo(Number(element.hijos[0]), 1, 1);
                    }
                    else if (op === "" && this.identificar('double', element)) {
                        izq = new primitivo_1.Primitivo(Number(parseInt(element.hijos[0])), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('double', element)) {
                        der = new primitivo_1.Primitivo(Number(parseInt(element.hijos[0])), 1, 1);
                    }
                    else if (op === "" && this.identificar('ARITMETICAS', element)) {
                        izq = this.calcular(element, null, position);
                    }
                    else if (!(op === "") && this.identificar('ARITMETICAS', element)) {
                        der = this.calcular(element, null, position);
                    }
                    else if (op === "" && this.identificar('ORDEN', element)) {
                        izq = new primitivo_1.Primitivo(Number(this.consultaXML.length), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('ORDEN', element)) {
                        der = new primitivo_1.Primitivo(Number(this.consultaXML.length), 1, 1);
                    }
                }
                else if (typeof element === 'string') {
                    if (!(element === '(') && !(element === ')')) {
                        op = element;
                    }
                }
            });
            if (izq && der && !(op === "")) {
                let a;
                if (op === '+') {
                    a = new operacion_1.Operacion(izq, der, operacion_1.Operador.SUMA, 1, 1);
                }
                else if (op === '-') {
                    a = new operacion_1.Operacion(izq, der, operacion_1.Operador.RESTA, 1, 1);
                }
                else if (op === '*') {
                    a = new operacion_1.Operacion(izq, der, operacion_1.Operador.MULTIPLICACION, 1, 1);
                }
                else if (op === 'div') {
                    a = new operacion_1.Operacion(izq, der, operacion_1.Operador.DIVISION, 1, 1);
                }
                else if (op === 'mod') {
                    a = new operacion_1.Operacion(izq, der, operacion_1.Operador.MODULO, 1, 1);
                }
                return a;
            }
        }
        if (this.identificar('RELACIONALES', nodo)) {
            let izq, der = null;
            let op = "";
            console.log("entró relacional");
            nodo.hijos.forEach((element) => {
                if (element instanceof Object) {
                    if (op === "" && this.identificar('integer', element)) {
                        izq = new primitivo_1.Primitivo(Number(element.hijos[0]), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('integer', element)) {
                        der = new primitivo_1.Primitivo(Number(element.hijos[0]), 1, 1);
                    }
                    else if (op === "" && this.identificar('double', element)) {
                        izq = new primitivo_1.Primitivo(Number(parseInt(element.hijos[0])), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('double', element)) {
                        der = new primitivo_1.Primitivo(Number(parseInt(element.hijos[0])), 1, 1);
                    }
                    else if (op === "" && this.identificar('string', element)) {
                        let texto = element.hijos[0].slice(1, -1);
                        let t = texto.split(" ");
                        texto = '';
                        for (var i = 0; i < t.length; i++) {
                            texto += t[i];
                        }
                        izq = new primitivo_1.Primitivo(texto, 1, 1);
                    }
                    else if (!(op === "") && this.identificar('string', element)) {
                        console.log("entró string derecho");
                        let texto = element.hijos[0].slice(1, -1);
                        let t = texto.split(" ");
                        texto = '';
                        for (var i = 0; i < t.length; i++) {
                            texto += t[i];
                        }
                        console.log(texto);
                        der = new primitivo_1.Primitivo(texto, 1, 1);
                    }
                    else if (op === "" && this.identificar('ARITMETICAS', element)) {
                        izq = this.calcular(element, logica, position);
                    }
                    else if (!(op === "") && this.identificar('ARITMETICAS', element)) {
                        der = this.calcular(element, logica, position);
                    }
                    else if (op === "" && this.identificar('ORDEN', element)) {
                        if (element.hijos[0] === 'position')
                            izq = new primitivo_1.Primitivo(Number(position), 1, 1);
                        else
                            izq = new primitivo_1.Primitivo(Number(this.consultaXML.length), 1, 1);
                    }
                    else if (!(op === "") && this.identificar('ORDEN', element)) {
                        if (element.hijos[0] === 'position')
                            der = new primitivo_1.Primitivo(Number(position), 1, 1);
                        else
                            der = new primitivo_1.Primitivo(Number(this.consultaXML.length), 1, 1);
                    }
                    else if (op === "" && this.identificar('ATRIBUTO_PREDICADO', element)) {
                        logica.listaAtributos.forEach(atri => {
                            if (atri.identificador === element.hijos[1]) {
                                let valor = atri.valor.slice(1, -1);
                                if (Number.isInteger(parseInt(valor)) && !valor.includes("/") && !valor.includes("-")) {
                                    console.log(parseInt(valor));
                                    izq = new primitivo_1.Primitivo(Number(parseInt(valor)), 1, 1);
                                }
                                else {
                                    let texto = valor;
                                    let t = texto.split(" ");
                                    texto = '';
                                    for (var i = 0; i < t.length; i++) {
                                        texto += t[i];
                                    }
                                    izq = new primitivo_1.Primitivo(texto, 1, 1);
                                }
                            }
                        });
                    }
                    else if (!(op === "") && this.identificar('ATRIBUTO_PREDICADO', element)) {
                        logica.listaAtributos.forEach(atri => {
                            if (atri.identificador === element.hijos[1]) {
                                let valor = atri.valor.slice(1, -1);
                                if (Number.isInteger(parseInt(valor)) && !valor.includes("/") && !valor.includes("-")) {
                                    der = new primitivo_1.Primitivo(Number(parseInt(valor)), 1, 1);
                                }
                                else {
                                    let texto = valor;
                                    let t = texto.split(" ");
                                    texto = '';
                                    for (var i = 0; i < t.length; i++) {
                                        texto += t[i];
                                    }
                                    der = new primitivo_1.Primitivo(texto, 1, 1);
                                }
                            }
                        });
                    }
                    else if (op === "" && this.identificar('id', element)) {
                        console.log("entró id");
                        logica.listaObjetos.forEach(ob => {
                            if (ob.identificador === element.hijos[0]) {
                                let texto = "";
                                for (var i = 0; i < ob.texto.length; i++) {
                                    texto += ob.texto[i];
                                }
                                if (Number.isInteger(parseInt(texto)) && !texto.includes("/") && !texto.includes("-")) {
                                    console.log(parseInt(texto));
                                    izq = new primitivo_1.Primitivo(Number(parseInt(texto)), 1, 1);
                                }
                                else {
                                    console.log(texto);
                                    izq = new primitivo_1.Primitivo(texto, 1, 1);
                                }
                            }
                        });
                    }
                    else if (!(op === "") && this.identificar('id', element)) {
                        logica.listaObjetos.forEach(ob => {
                            if (ob.identificador === element.hijos[0]) {
                                console.log(ob.texto);
                                let texto = "";
                                for (var i = 0; i < ob.texto.length; i++) {
                                    texto += ob.texto[i];
                                }
                                if (Number.isInteger(parseInt(texto)) && !texto.includes("/") && !texto.includes("-")) {
                                    console.log(parseInt(texto));
                                    der = new primitivo_1.Primitivo(Number(parseInt(texto)), 1, 1);
                                }
                                else {
                                    console.log(texto);
                                    der = new primitivo_1.Primitivo(texto, 1, 1);
                                }
                            }
                        });
                    }
                    else if (op === "" && this.identificar('punto', element)) {
                        console.log("at " + this.atributo);
                        if (logica.identificador === this.punto && !this.atributo) {
                            let texto = "";
                            for (var i = 0; i < logica.texto.length; i++) {
                                texto += logica.texto[i];
                            }
                            if (Number.isInteger(parseInt(texto)) && !texto.includes("/") && !texto.includes("-")) {
                                console.log(parseInt(texto));
                                izq = new primitivo_1.Primitivo(Number(parseInt(texto)), 1, 1);
                            }
                            else {
                                console.log(texto);
                                izq = new primitivo_1.Primitivo(texto, 1, 1);
                            }
                        }
                        else {
                            logica.listaAtributos.forEach(atri => {
                                if (atri.identificador === this.punto) {
                                    let valor = atri.valor.slice(1, -1);
                                    if (Number.isInteger(parseInt(valor)) && !valor.includes("/") && !valor.includes("-")) {
                                        izq = new primitivo_1.Primitivo(Number(parseInt(valor)), 1, 1);
                                    }
                                    else {
                                        let texto = valor;
                                        let t = texto.split(" ");
                                        texto = '';
                                        for (var i = 0; i < t.length; i++) {
                                            texto += t[i];
                                        }
                                        izq = new primitivo_1.Primitivo(texto, 1, 1);
                                    }
                                }
                            });
                        }
                    }
                    else if (!(op === "") && this.identificar('punto', element)) {
                        if (logica.identificador === this.punto && !this.atributo) {
                            console.log(logica.texto);
                            let texto = "";
                            for (var i = 0; i < logica.texto.length; i++) {
                                texto += logica.texto[i];
                            }
                            if (Number.isInteger(parseInt(texto)) && !texto.includes("/") && !texto.includes("-")) {
                                console.log(parseInt(texto));
                                der = new primitivo_1.Primitivo(Number(parseInt(texto)), 1, 1);
                            }
                            else {
                                console.log(texto);
                                der = new primitivo_1.Primitivo(texto, 1, 1);
                            }
                        }
                        else {
                            logica.listaAtributos.forEach(atri => {
                                if (atri.identificador === this.punto) {
                                    let valor = atri.valor.slice(1, -1);
                                    if (Number.isInteger(parseInt(valor)) && !valor.includes("/") && !valor.includes("-")) {
                                        der = new primitivo_1.Primitivo(Number(parseInt(valor)), 1, 1);
                                    }
                                    else {
                                        let texto = valor;
                                        let t = texto.split(" ");
                                        texto = '';
                                        for (var i = 0; i < t.length; i++) {
                                            texto += t[i];
                                        }
                                        der = new primitivo_1.Primitivo(texto, 1, 1);
                                    }
                                }
                            });
                        }
                    }
                }
                else if (typeof element === 'string') {
                    if (!(element === '(') && !(element === ')')) {
                        op = element;
                    }
                }
            });
            if (izq && der && !(op === "")) {
                let a;
                if (op === '<') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.MENOR_QUE, 1, 1);
                }
                else if (op === '>') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.MAYOR_QUE, 1, 1);
                }
                else if (op === '<=') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.MENOR_IGUA_QUE, 1, 1);
                }
                else if (op === '>=') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.MAYOR_IGUA_QUE, 1, 1);
                }
                else if (op === '=') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.IGUAL_IGUAL, 1, 1);
                }
                else if (op === '!=') {
                    a = new relacional_1.Relacion(izq, der, operacion_1.Operador.DIFERENTE_QUE, 1, 1);
                }
                else if (op === '!') {
                    a = new relacional_1.Relacion(izq, null, operacion_1.Operador.NOT, 1, 1);
                }
                return a;
            }
        }
    }
    traducir() {
        let cadena = '';
        let numero = 0;
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
                if (this.nodo_descendente) {
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
                else if (this.atributo_nodo) {
                    if (element.cons.listaAtributos.length > 0) {
                        element.cons.listaAtributos.forEach(atributos => {
                            cadena += ' ' + atributos.identificador + '=' + atributos.valor + '\n';
                        });
                    }
                }
                else if (this.node_desc) {
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
                    if (texto != '') {
                        cadena += texto + '\n';
                    }
                }
                else if (this.node_texto) {
                    if (element.texto != null) {
                        cadena += texto + '\n';
                    }
                }
                else {
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
    traducirRecursiva(elemento) {
        let cadena = '';
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
    validarError(error) {
        const json = JSON.stringify(error);
        const objeto = JSON.parse(json);
        console.log(objeto);
    }
}
exports.Ejecucion = Ejecucion;
