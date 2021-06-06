  /* Definición Léxica */
%lex

%options case-sensitive

%%
\s+               {/* skip whitespace */}

//Palabras reservadas
'last' return 'last';
'position' return 'position';
'node' return 'node';
'text' return 'text';
'comment' return 'comment';

//Axes
'ancestor' return 'ancestor';
'attribute' return 'attribute';
'child' return 'child';
'descendant' return 'descendant';
'following' return 'following';
'namespace' return 'namespace';
'parent' return 'parent';
'preceding' return 'preceding';
'sibling' return 'sibling';
'self' return 'self';

//Signos
'|' return 'o';
'+' return 'mas';
'-' return 'menos';
'*' return 'mul';
'div' return 'div';
'=' return 'igual';
'!=' return 'diferencia';
'<' return 'menor';
'>' return 'mayor';
'or' return 'or';
'and' return 'and';
'mod' return 'mod';

'[' return 'cor_izq';
"]" return 'cor_der';
'(' return 'par_izq';
')' return 'par_der';

//Expresiones regulares
(([0-9]+"."[0-9]*)|("."[0-9]+))     return 'double';
[0-9]+                              return 'integer';
\"[^\"]*\"                          return 'string';
\'[^\']*\'                          return 'string';
[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9]+            return 'id';

[.][.]                              return 'dos_pts';
["/"]["/"]["@"]["*"]                return 'diagonal_diagonal_arroba_ast';
["/"]["/"]["*"]                     return 'diagonal_diagonal_ast';
["/"]["/"]                          return 'doble_diagonal';
["/"]["."]["."]                     return 'diagonal_dos_pts';
["/"]["@"]["*"]                     return 'diagonal_arroba_ast';
["/"]["*"]                          return 'diagonal_ast';
"/"                                 return 'diagonal';
"."                                 return 'punto';
[":"][":"]                          return 'bi_pto';
["@"]["*"]                          return 'any_atributo';
"@"                                 return 'arroba';    

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
    const errorGram = require("../arbol/error");
    const tablaErrores = require("../arbol/errores");
%}

//Definir precedencia
%left 'or'
%left 'and'
%left 'igual' 'diferencia'
%left 'mayor' 'menor' 'mayor_igual' 'menor_igual'
%left 'mas' 'menos'
%left 'mul' 'div' 'mod'
%left 'umenos'
%left 'diagonal'
%left 'doble_diagonal'
%left 'cor_izq' 'cor_der'
%left 'dos_pts'

// Produccion Inicial
%start S

%%

S : INSTRUCCIONES EOF  ;

INSTRUCCIONES : INSTRUCCION INSTRUCCIONES ; 

INSTRUCCIONES : ; 

INSTRUCCION : RUTA FILTROS OPC_I;

OPC_I :  
        | o INSTRUCCION ; 

RUTA :    ATRIBUTO_DESCENDIENTES
            | DESCENDIENTES_NODO
            | DESCENDIENTE 
            | PADRE
            | ATRIBUTO_NODO
            | HIJOS 
            | RAIZ 
            | NODO_ACTUAL
            | PADRE_NODO
            | ANY 
            | id 
            | EJES OPC_EJES ; // FILTROS ;

ATRIBUTO_DESCENDIENTES : diagonal_diagonal_arroba_ast OPC;

DESCENDIENTES_NODO : diagonal_diagonal_ast OPC;

DESCENDIENTE : doble_diagonal OPC;

PADRE : diagonal_dos_pts OPC;

ATRIBUTO_NODO : diagonal_arroba_ast OPC; 

HIJOS : diagonal_ast OPC; 

RAIZ : diagonal OPC; 

NODO_ACTUAL : punto; 

PADRE_NODO : dos_pts ;

ANY : mul ;

EJES : ancestor bi_pto
      | ancestor menos or menos self bi_pto
      | attribute bi_pto
      | child bi_pto
      | descendant bi_pto
      | descendant menos or self bi_pto 
      | following bi_pto
      | following menos sibling bi_pto
      | namespace bi_pto
      | parent bi_pto
      | preceding bi_pto
      | preceding menos sibling bi_pto
      | self bi_pto;

OPC_EJES : id
         |  mul 
         |  NODO_FUNCION ;

NODO_FUNCION : node par_izq par_der
         | text par_izq par_der ;

OPC: 
    | NODO_FUNCION
    | PASOS; 

PASOS :    ANY_ATRIBUTO
            | ATRIBUTO ;

ANY_ATRIBUTO : any_atributo ; 

ATRIBUTO : arroba id;

FILTROS : LISTA_PREDICADO ; 

LISTA_PREDICADO :  PREDICADO LISTA_PREDICADO;

LISTA_PREDICADO : ;

PREDICADO: cor_izq  EXPR  cor_der;

EXPR : ATRIBUTO_PREDICADO
     | ARITMETICAS
     | RELACIONALES
     | LOGICAS
     | ORDEN 
     | VALORES
     | EJES OPC_EJES
     | PATH
     | PREDICADO
     | NODO_FUNCION;


     PATH : EXPR doble_diagonal EXPR
        | EXPR diagonal EXPR
        | doble_diagonal OPC_PATH EXPR
        | diagonal OPC_PATH EXPR
        | diagonal_dos_pts;

OPC_PATH : id 
        | arroba id;

ORDEN : last par_izq par_der 
         | position par_izq par_der ;

ARITMETICAS: EXPR mas EXPR
            | EXPR menos EXPR
            | EXPR mul EXPR
            | EXPR div EXPR 
            | EXPR mod EXPR ;

RELACIONALES: EXPR mayor EXPR
            | EXPR menor EXPR
            | EXPR mayor igual EXPR
            | EXPR menor igual EXPR 
            | EXPR igual EXPR
            | EXPR diferencia EXPR ;

LOGICAS : EXPR or EXPR
         | EXPR and EXPR ;

ATRIBUTO_PREDICADO : arroba OPC
                   | any_atributo
                   | arroba id;

VALORES : integer 
        | double
        | string 
        | id
        | punto
        | dos_pts; 