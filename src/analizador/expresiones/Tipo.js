"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTipo = void 0;
const arreglo_1 = require("./arreglo");
function getTipo(valor) {
    if (typeof valor == 'string')
        return 0 /* STRING */;
    if (typeof valor == 'number')
        return 1 /* INT */;
    if (typeof valor == 'boolean')
        return 3 /* BOOL */;
    if (valor instanceof arreglo_1.Arreglo)
        return 8 /* ARRAY */;
    if (valor == null)
        return null;
    return null;
}
exports.getTipo = getTipo;
