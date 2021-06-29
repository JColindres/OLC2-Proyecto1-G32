/* Definición Léxica */
%lex

%options case-sensitive

%%
\s+                                         /* skip whitespace */
"//".*                                 // comentario simple línea
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/] // comentario multiple líneas

//Palabras Reservadas 
'#include' return 'include';
'<stdio.h>' return 'stdio';
'double'    return 'double';
'int' return 'int';
'S'           return 'p_Stack';
'H'           return 'p_Heap';
'heap' return 'heap';
'stack' return 'stack';
'main()' return 'main';
'goto' return 'goto';
'if'  return 'if';
'void' return 'void'; 
'int'  return 'int';
'float' return 'float';
'double' return 'double';
'char' return 'char'; 
'function' return 'function';
'return' return 'return';
'printf' return 'printf';


';' return 'pto_coma';
':' return 'dos_pts';
'[' return 'cor_izq';
']' return 'cor_der';
'{' return 'llave_izq';
'}' return 'llave_der';
'(' return 'par_izq';
')' return 'par_der';
'+' return 'suma';
'-' return 'resta';
'*' return 'multiplicacion';
'/' return 'division';
'%' return 'modulo';
'>=' return 'mayor_igual';
'<=' return 'menor_igual';
'!=' return 'diferente_que';
'==' return 'igual_que';
'=' return 'igual';
'>' return 'mayor';
'<' return 'menor';
',' return 'coma';

//Expresiones Regulares 
T[0-9]+                             return 'temporal';
L[0-9]+                             return 'etiqueta';
[a-zA-ZñÑáéíóúÁÉÍÓÚ_]+[[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9_]]*            return 'id';
(([0-9]+"."[0-9]*)|("."[0-9]+))     return 'decimal';

[0-9]+                              return 'integer';
\"[^\"]*\"                          return 'string';
\'[^\']*\'                          return 'string';

//error lexico
. {
  const er = new errorGram.Error({ tipo: 'léxico', linea: `${yylineno + 1}`, descripcion: `El lexema "${yytext}" en la columna: ${yylloc.first_column + 1} no es válido.` });
  tablaErrores.Errores.getInstance().push(er);
}

//Fin del archivo
<<EOF>>				return 'EOF';
/lex

//seccion de Imports
%{
    const { NodoAST }= require('../arbol/nodoAST');
    const errorGram = require("../arbol/error");
    const tablaErrores = require("../arbol/errores");
    const Objeto_Optimizar = require("../Reportes/Objeto_Optimizar");
    const Rep_Optimizar = require("../Reportes/Rep_Optimizar");
%}

//Definir precedencia
%left 'igual_que' 'diferencia_que'
%left 'mayor_igual' 'menor_igual' 'mayor' 'menor' 
%left 'suma' 'resta'
%left 'multiplicacion' 'division' 'modulo'
%left 'umenos' 

// Produccion Inicial
%start S
%%

//Producciones 
S : INICIO EOF { return new NodoAST({label: 'S', hijos: [$1], linea: yylineno});} ; 

INICIO : HEADER FUNCIONES 
       { $$ = new NodoAST({label: 'INICIO', hijos: [$1,$2], linea: yylineno}); };

HEADER: include stdio L_DECLARACION 
       { $$ = new NodoAST({label: 'HEADER', hijos: [$1,$2,$3], linea: yylineno}); };

L_DECLARACION : L_DECLARACION DECLARACION 
              { $$ = new NodoAST({label: 'L_DECLARACION', hijos: [$1,$2], linea: yylineno}); }
              | DECLARACION 
              {$$ = new NodoAST({label: 'L_DECLARACION', hijos: [$1], linea: yylineno});} ; 

DECLARACION : double heap cor_izq integer cor_der pto_coma 
              {$$ = new NodoAST({label: 'DECLARACION', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno});}      //heap 
            | double stack cor_izq integer cor_der pto_coma 
              {$$ = new NodoAST({label: 'DECLARACION', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno});}    //stack                             
            | double L_TEMPORAL pto_coma 
              {$$ = new NodoAST({label: 'DECLARACION', hijos: [$1,...$2.hijos,$3], linea: yylineno});}                     //temporales
            | double p_Heap pto_coma 
              {$$ = new NodoAST({label: 'DECLARACION', hijos: [$1,$2,$3], linea: yylineno});} //puntero
            | double p_Stack pto_coma 
              {$$ = new NodoAST({label: 'DECLARACION', hijos: [$1,$2,$3], linea: yylineno});} ; //puntero

L_TEMPORAL : L_TEMPORAL coma temporal 
              {$$ = new NodoAST({label: 'L_TEMPORAL', hijos: [...$1.hijos,$2,$3], linea: yylineno}); }
           | temporal 
              {$$ = new NodoAST({label: 'L_DECLARACION', hijos: [$1], linea: yylineno}); }; 

FUNCIONES: FUNCIONES FUNCION {$$ = new NodoAST({label: 'FUNCIONES', hijos: [...$1.hijos,...$2.hijos], linea: yylineno}); }
       | FUNCION {$$ = new NodoAST({label: 'FUNCIONES', hijos: [...$1.hijos], linea: yylineno}); };  

FUNCION: TIPO_F funtion id par_izq par_der llave_izq BLOQUES RETURN llave_der 
              {$$ = new NodoAST({label: 'FUNCION', hijos: [$1,$3,$4,$5,$6,$7,...$8.hijos,$9], linea: yylineno});}
       | TIPO_F main llave_izq BLOQUES RETURN llave_der
              {$$ = new NodoAST({label: 'FUNCION', hijos: [$1,$2,$3,$4,...$5.hijos,$6], linea: yylineno});}
       ;

TIPO_F : int { $$ = $1} 
       | void {$$ = $1}; 

TIPO :  int { $$ = $1}
       | float { $$ = $1}
       | double { $$ = $1}
       | char { $$ = $1};

RETURN : return pto_coma {$$ = new NodoAST({label: 'RETURN', hijos: [$1,$2], linea: yylineno}); } 
       | return par_izq par_der pto_coma {$$ = new NodoAST({label: 'RETURN', hijos: [$1,$2,$3,$4], linea: yylineno}); } 
       | return VALOR pto_coma {$$ = new NodoAST({label: 'RETURN', hijos: [$1,...$2.hijos,$3], linea: yylineno});} ;

VALOR: temporal {$$ = new NodoAST({label: 'temporal', hijos: [$1], linea: yylineno}); }
       | integer {$$ = new NodoAST({label: 'integer', hijos: [$1], linea: yylineno}); }
       | decimal {$$ = new NodoAST({label: 'decimal', hijos: [$1], linea: yylineno}); }
       | par_izq TIPO par_der integer {$$ = new NodoAST({label: 'acceso', hijos: [$1,$2,$3,$4], linea: yylineno});} 
       | par_izq TIPO par_der double {$$ = new NodoAST({label: 'acceso', hijos: [$1,$2,$3,$4], linea: yylineno});} 
       | par_izq TIPO par_der p_Stack {$$ = new NodoAST({label: 'acceso', hijos: [$1,$2,$3,$4], linea: yylineno});} 
       | par_izq TIPO par_der p_Heap {$$ = new NodoAST({label: 'acceso', hijos: [$1,$2,$3,$4], linea: yylineno});} 
       | PUNTERO {$$ = new NodoAST({label: 'PUNTERO', hijos: [$1], linea: yylineno}); }
       | resta integer {$$ = new NodoAST({label: 'umenos', hijos: [($1+$2)], linea: yylineno});}; 

BLOQUES : BLOQUES BLOQUE {$$ = new NodoAST({label: 'BLOQUES', hijos: [...$1.hijos,...$2.hijos], linea: yylineno}); }
        | BLOQUE {$$ = new NodoAST({label: 'BLOQUES', hijos: [...$1.hijos], linea: yylineno});};

BLOQUE : IF {$$ = new NodoAST({label: 'BLOQUE', hijos: [$1], linea: yylineno}); }
      | GOTO { $$ = new NodoAST({label: 'BLOQUE', hijos: [$1], linea: yylineno}); }
      | LLAMADA {$$ = new NodoAST({label: 'BLOQUE', hijos: [$1], linea: yylineno}); }
      | PRINT {$$ = new NodoAST({label: 'BLOQUE', hijos: [$1], linea: yylineno}); }
      | ASIGNA {$$ = new NodoAST({label: 'BLOQUE', hijos: [$1], linea: yylineno}); }; 

LLAMADA : id par_izq par_der pto_coma {$$ = new NodoAST({label: 'LLAMADA', hijos: [$1,$2,$3,$4], linea: yylineno}); }  ; 

PRINT : printf par_izq string coma VALOR par_der pto_coma 
              {$$ = new NodoAST({label: 'LLAMADA', hijos: [$1,$2,$3,$4,...$5.hijos,$6,$7], linea: yylineno});} ; 

IF: if par_izq CONDICION par_der GOTO 
              {$$ = new NodoAST({label: 'IF', hijos: [$1,$2,$3,$4,$5], linea: yylineno});};

CONDICION: VALOR OP_COMPARACION VALOR 
              {$$ = new NodoAST({label: 'CONDICION', hijos: [...$1.hijos,$2,...$3.hijos], linea: yylineno});};

GOTO : goto etiqueta pto_coma 
             {$$ = new NodoAST({label: 'GOTO', hijos: [$1,$2,$3], linea: yylineno}); }
;

OP_COMPARACION : diferente_que 
                     { $$ = $1}
               | igual_que 
                     { $$ = $1}
               | mayor_igual 
                     { $$ = $1}
               | menor_igual 
                     { $$ = $1}
               | mayor 
                     { $$ = $1}
               | menor 
                     { $$ = $1}; 

ASIGNA : temporal  igual EXPR pto_coma
              {$$ = new NodoAST({label: 'ASIGNA_EXPR', hijos: [$1,$2,$3,$4], linea: yylineno});}
       | temporal  igual VALOR pto_coma
              {$$ = new NodoAST({label: 'ASIGNA', hijos: [$1,$2,...$3.hijos,$4], linea: yylineno});}
       | PUNTERO igual EXPR  pto_coma
              {$$ = new NodoAST({label: 'ASIGNA_EXPR', hijos: [$1,$2,$3,$4], linea: yylineno});}
       | PUNTERO igual VALOR pto_coma
              {$$ = new NodoAST({label: 'ASIGNA', hijos: [$1,$2,...$3.hijos,$4], linea: yylineno});}
       | temporal igual ACCESO pto_coma
              {$$ = new NodoAST({label: 'ASIGNA', hijos: [$1,$2,...$3.hijos,$4], linea: yylineno});}
       | ACCESO  igual EXPR pto_coma
              {$$ = new NodoAST({label: 'ASIGNA_EXPR', hijos: [$1,$2,$3,$4], linea: yylineno});}
       | ACCESO  igual VALOR pto_coma
              {$$ = new NodoAST({label: 'ASIGNA', hijos: [...$1.hijos,$2,...$3.hijos,$4], linea: yylineno});}
       ; 

EXPR: VALOR OP_ARITMETICO VALOR {$$ = new NodoAST({label: 'EXPR', hijos: [...$1.hijos,$2,...$3.hijos], linea: yylineno});};

ACCESO : heap cor_izq VALOR cor_der 
              {$$ = new NodoAST({label: 'ACCESO', hijos: [$1,$2,...$3.hijos,$4], linea: yylineno});}
       | stack cor_izq VALOR cor_der
              {$$ = new NodoAST({label: 'ACCESO', hijos: [$1,$2,...$3.hijos,$4], linea: yylineno});}
       ;

PUNTERO : p_Stack 
              { $$ = $1}
       | p_Heap 
              { $$ = $1}; 

OP_ARITMETICO : suma 
                     { $$ = $1}
           | resta 
                     { $$ = $1}
           | multiplicacion 
                     { $$ = $1}
           | division 
                     { $$ = $1}
           | modulo 
                   { $$ = $1}; 
