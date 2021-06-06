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

//Axes
'ancestor' return 'ancestor';
//'ancestor-or-self' return 'ancestor_or_self';
'attribute' return 'attribute';
'child' return 'child';
'descendant' return 'descendant';
//'descendant-or-self' return 'descendant_or_self';
'following' return 'following';
//'following-sibling' return 'following_sibling';
'namespace' return 'namespace';
'parent' return 'parent';
'preceding' return 'preceding';
'sibling' return 'sibling';
//'preceding-sibling' return 'preceding_sibling';
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
'<=' return 'menor_igual';
'>' return 'mayor';
'>=' return 'mayor_igual';
'or' return 'or';
'and' return 'and';
'mod' return 'mod';

'.' return 'punto';
"/" return 'diagonal';
"@" return 'arroba';
'(' return 'par_izq';
')' return 'par_der';
'[' return 'cor_izq';
"]" return 'cor_der';

'{' return 'llave_izq';
'}' return 'llave_der';
':' return 'bi_puntos';

//Expresiones regulares
(([0-9]+"."[0-9]*)|("."[0-9]+))     return 'double';
[0-9]+                              return 'integer';
\"[^\"]*\"                          return 'string';
\'[^\']*\'                          return 'string';
[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+              return 'id';

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

// Produccion Inicial
%start S

%%

//Gramatica 

S : INSTRUCCIONES EOF  ;

INSTRUCCIONES : INSTRUCCIONES INSTRUCCION
              | INSTRUCCION  ;

INSTRUCCION : PRINCIPAL FILTROS
            | INSTRUCCION o PRINCIPAL FILTROS;

PRINCIPAL : id
      | RAIZ
      | DESCENDIENTE
      | ATRIBUTO
      | PADRE 
      | EJES OPC;

RAIZ: diagonal OPC ;

DESCENDIENTE : diagonal diagonal OPC;

ATRIBUTO: diagonal diagonal arroba OPC  
       | diagonal arroba OPC; 

OPC: id 
    | NODOS
    | EJES
    | mul; 

PADRE : diagonal punto punto 
      | punto punto ; 

EJES : ancestor bi_puntos bi_puntos
      | ancestor menos or menos self bi_puntos bi_puntos
      | attribute bi_puntos bi_puntos
      | child bi_puntos bi_puntos
      | descendant bi_puntos bi_puntos
      | descendant menos or self  bi_puntos bi_puntos
      | following bi_puntos bi_puntos
      | following menos sibling bi_puntos bi_puntos
      | namespace  bi_puntos bi_puntos
      | parent bi_puntos bi_puntos
      | preceding bi_puntos bi_puntos
      | preceding menos sibling bi_puntos bi_puntos
      | self bi_puntos bi_puntos;

NODOS : node par_izq par_der
         | text par_izq par_der ;

FILTROS : 
        | PREDICADO ; 

PREDICADO: cor_izq  EXPR cor_der;

EXPR : ATRIBUTO_PREDICADO
     | ARITMETICAS
     | RELACIONALES
     | ORDEN 
     | VALORES;

ORDEN : last par_izq par_der 
         | position par_izq par_der ;

ARITMETICAS: EXPR mas EXPR
            | EXPR menos EXPR
            | EXPR mul EXPR
            | EXPR div EXPR 
            | EXPR mod EXPR ;

RELACIONALES: EXPR mayor EXPR
            | EXPR menor EXPR
            | EXPR mayor_igual EXPR
            | EXPR menor_igual EXPR 
            | EXPR igual EXPR
            | EXPR diferencia EXPR ;

LOGICAS : EXPR o EXPR
         | EXPR or EXPR
         | EXPR and EXPR ;

ATRIBUTO_PREDICADO : arroba OPC;

VALORES : integer
        | id 
        | double
        | string; 
