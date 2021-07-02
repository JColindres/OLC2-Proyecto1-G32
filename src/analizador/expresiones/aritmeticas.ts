import { Error } from "../arbol/error";
import { Errores } from "../arbol/errores";
import { Entorno } from "../interfaces/entorno";
import { Expresion } from "../Interfaces/Expresion";
import { Instruccion } from "../interfaces/instruccion";
import { Tipo } from "./Tipo";

export enum Operador {
    SUMA,
    RESTA,
    MULTIPLICACION,
    DIVISION,
    MODULO,
    MENOS_UNARIO,
    MAYOR_QUE,
    MENOR_QUE,
    IGUAL_IGUAL,
    DIFERENTE_QUE,
    OR,
    AND,
    NOT,
    MAYOR_IGUA_QUE,
    MENOR_IGUA_QUE,
    DESCONOCIDO
}

export class Aritmeticas extends Instruccion {
    expIzq: Instruccion;
    expDer: Instruccion;
    operador: Operador;

    constructor( expIzq: Instruccion, expDer: Instruccion, operador: Operador, linea: string) {
        super(linea);
        Object.assign(this, { expIzq, expDer, operador });
    }

    ejecutar(e: Entorno) {
        if (this.operador !== Operador.MENOS_UNARIO && this.operador !== Operador.NOT){
            let exp1 = this.expIzq.ejecutar(e);
            let exp2 = this.expDer.ejecutar(e);
            //console.log(this.expDer)
            //suma
            if (this.operador == Operador.SUMA)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 + exp2;
                }
                else if (typeof(exp1==="string") || typeof(exp2==="string"))
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() + exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //resta
            else if (this.operador == Operador.RESTA)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    //console.log(exp1, '-', exp2)
                    return exp1 - exp2;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //multiplicación
            else if (this.operador == Operador.MULTIPLICACION)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    //console.log(exp1, ' * ', exp2)
                    return exp1 * exp2;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //division
            else if (this.operador == Operador.DIVISION)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    if(exp2===0){
                        console.log("Resultado indefinido, no puede ejecutarse operación sobre cero.");
                        return null;
                    }
                    return exp1 / exp2;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //modulo
            else if (this.operador == Operador.MODULO)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    if(exp2===0){
                        console.log("Resultado indefinido, no puede ejecutarse operación sobre cero.");
                        return null;
                    }
                    return exp1 % exp2;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //menorque
            else if (this.operador == Operador.MENOR_QUE)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 < exp2;
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() < exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //mayorque
            else if (this.operador == Operador.MAYOR_QUE)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 > exp2;
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() > exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //menorigual
            else if (this.operador == Operador.MENOR_IGUA_QUE)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 <= exp2;
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() <= exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //mayorigual
            else if (this.operador == Operador.MAYOR_IGUA_QUE)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 >= exp2;
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() >= exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //igual
            else if (this.operador == Operador.IGUAL_IGUAL)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return exp1 === exp2;
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return exp1.ToString() === exp2.ToString();
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }
            //diferente
            else if (this.operador == Operador.DIFERENTE_QUE)
            {
                if (typeof(exp1==="number") && typeof(exp2==="number"))
                {
                    return !(exp1 === exp2);
                }
                else if (exp1==="string" || exp2 ==="string")
                {
                    if (exp1 == null) exp1 = "null";
                    if (exp2 == null) exp2 = "null";
                    return !(exp1.ToString() === exp2.ToString());
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una suma");
                    return null;
                }
            }

        }else{
            let exp1 = this.expIzq.ejecutar(e);
            if (this.operador == Operador.MENOS_UNARIO)
            {
                if (typeof(exp1==="number"))
                {
                    return -1* exp1;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una operación unaria");
                    return null;
                }
            }
            else if (this.operador == Operador.NOT)
            {
                if (typeof(exp1==="number"))
                {
                    return !exp1;
                }
                else
                {
                    console.log("Error de tipos de datos no permitidos realizando una operación unaria");
                    return null;
                }
            }
        }
        return null;
        //Si no es error
        //Errores.getInstance().push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una multiplicacion entre un operando tipo ${typeof exp1} y un operando tipo ${typeof exp2}` }));
    }
}