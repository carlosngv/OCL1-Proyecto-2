
%lex
%options case-insensitive

%%

\s+			{}								
[ \t\r\n\f] %{  %}
\n                  {}
                    

    
\"[^\"]*\"				{ yytext = yytext.substr(1,yyleng-2); return 'STRING'; }
[0-9]+("."[0-9]+)?\b  	return 'DECIMAL';
[0-9]+\b				return 'ENTERO';
"//".*										
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]	 

":"     return 'DOS_PUNTOS';
";"     return 'PUNTO_COMA';
","     return 'COMA'
"++" return 'INCR';           
"+"     return 'MAS';
"--" return 'DECR';   
"-"     return 'MENOS';
"/"     return 'DIVISION';
"*"     return 'MULT';
"."     return 'PUNTO';


"<" return 'MENOR';           
">" return 'MAYOR';           
"<=" return 'MENOR_IGUAL';           
">=" return 'MAYOR_IGUAL'; 

"==" return 'IGUALDAD';           
"!=" return 'DESIGUALDAD';           
"||" return 'OR';           
"&&" return 'AND';           
"^" return 'XOR';     
"!" return 'NEG';           
"="     return 'ASIGNACION';



"("     return 'PARENTIZQ';
")"     return 'PARENTDER';
"["     return 'BRACKIZQ';
"]"     return 'BRACKDER';
"{"     return 'LLAVEIZQ';
"}"     return 'LLAVEDER';

"public"    return 'RESERVADA_PUBLIC';
"class"     return 'RESERVADA_CLASS';
"interface" return 'RESERVADA_INTERFACE';
"int"    return 'RESERVADA_INT';
"double"  return 'RESERVADA_DOUBLE';
"boolean"     return 'RESERVADA_BOOLEAN';
"void" return 'RESERVADA_VOID';   
"char" return 'RESERVADA_CHAR';           
"String" return 'RESERVADA_STRING';           
"if" return 'RESERVADA_IF';           
"else" return 'RESERVADA_ELSE';           
"for" return 'RESERVADA_FOR';           
"while" return 'RESERVADA_WHILE';           
"do" return 'RESERVADA_DO';           
"true" return 'RESERVADA_TRUE';   
"false" return 'RESERVADA_FALSE';     
"static" return 'RESERVADA_STATIC';           
"main" return 'RESERVADA_MAIN';           
"continue" return 'RESERVADA_CONTINUE';          
"break" return 'RESERVADA_BREAK';           
"System" return 'RESERVADA_SYSTEM'; 
"out" return 'RESERVADA_OUT';           
"println" return 'RESERVADA_PRINTLN'; 
"print" return 'RESERVADA_PRINT';          
"return" return 'RESERVADA_RETURN';  
([a-zA-Z])[a-zA-Z0-9_]*	return 'ID';

<<EOF>>                 return 'EOF';

.                       { console.error('Este es un error léxico: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column); }
/lex

%left 'RESERVADA_ELSE'
%left 'OR'
%left 'AND'
%left 'IGUALDAD' 'DESIGUALDAD'
%left 'MAYOR_IGUAL' 'MENOR_IGUAL' 'MAYOR' 'MENOR'

%left 'MAS' 'MENOS'
%left 'MULT' 'DIVISION'
%left 'PARENTIZQ' 'PARENTDER'
%left 'BRACKIZQ' 'BRACKDER'
%left 'LLAVEIZQ' 'LLAVEDER'

%right NEG
%left UMENOS

%start inicio
%%

inicio: lista_clases  inicio {$$ = $1;}
      | lista_interfaces inicio { $$ = $1;}
      | EOF {}
      ;

lista_clases: lista_clases sentencia_clase { $$ = $1;}
            | sentencia_clase { $$ = $1;}
            ;

sentencia_clase: RESERVADA_PUBLIC RESERVADA_CLASS ID bloque_declaracion_metodos_funciones { $$ = $1;};

bloque_declaracion_metodos_funciones: LLAVEIZQ lista_declaracion_metodos_funciones LLAVEDER { $$ = $1;}
                             | LLAVEIZQ LLAVEDER { $$ = $1;}
                             ;

lista_declaracion_metodos_funciones: lista_declaracion_metodos_funciones declaracion_metodos_funciones { $$ = $1;}
                                    | declaracion_metodos_funciones { $$ = $1;}
                                    ;

declaracion_metodos_funciones: RESERVADA_PUBLIC tipo ID PARENTIZQ declaracion_parametros_mf { $$ = $1;};

declaracion_parametros_mf: lista_parametros PARENTDER instrucciones_llaves { $$ = $1;}
                         | PARENTDER instrucciones_llaves { $$ = $1;}
                         ;

lista_interfaces: lista_interfaces sentencia_interfaz { $$ = $1;}
                | sentencia_interfaz { $$ = $1;}
                ; 

sentencia_interfaz: RESERVADA_PUBLIC RESERVADA_INTERFACE ID bloque_declaracion_funcion { $$ = $1;};

bloque_declaracion_funcion: LLAVEIZQ lista_declaracion_funciones LLAVEDER { $$ = $1;}
                     | LLAVEIZQ LLAVEDER { $$ = $1;}
                     ;

lista_declaracion_funciones: lista_declaracion_funciones declaracion_funcion { $$ = $1;}
                           | declaracion_funcion { $$ = $1;}
                           ;

declaracion_funcion: RESERVADA_PUBLIC tipo ID PARENTIZQ declaracion_parametros_funcion { $$ = $1;};

declaracion_parametros_funcion: lista_parametros PARENTDER PUNTO_COMA { $$ = $1;}
                              | PARENTDER PUNTO_COMA  { $$ = $1;}
                              ;

lista_parametros: lista_parametros COMA tipo ID { $$ = $1;}
                | tipo ID { $$ = $1;};


instruccion: asignacion_simple  { $$ = $1;}
           | sentencia_break { $$ = $1;}
           | sentencia_continue { $$ = $1;}
           | sentencia_return_metodos { $$ = $1;}
           | sentencia_for { $$ = $1;}
           | sentencia_while { $$ = $1;}
           | sentencia_do_while { $$ = $1;}
           | sentencia_if { $$ = $1;} 
           | sentencia_return_funciones { $$ = $1;}
           | sentencia_print {}
           | declaracion_variable {}
           ;
           

lista_instrucciones: lista_instrucciones instruccion { $$ = $1;}
                   | instruccion { $$ = $1;}
                   ;


instrucciones_llaves: LLAVEIZQ lista_instrucciones LLAVEDER { $$ = $1;}
                    | LLAVEIZQ LLAVEDER { $$ = $1;}
                    ;


tipo: RESERVADA_BOOLEAN { $$ = $1;}
    | RESERVADA_INT { $$ = $1;}
    | RESERVADA_CHAR { $$ = $1;}
    | RESERVADA_DOUBLE { $$ = $1;}
    | RESERVADA_STRING { $$ = $1;}
    | RESERVADA_VOID { $$ = $1; }
    ;

declaracion_variable: tipo lista_id  asignacion {};

lista_id: lista_id COMA ID {}
        | ID {};

asignacion: ASIGNACION expresion PUNTO_COMA {}
          | PUNTO_COMA {}; 

sentencia_print: RESERVADA_SYSTEM PUNTO opcion_print PUNTO RESERVADA_OUT PARENTIZQ expresion PARENTDER {};

opcion_print: RESERVADA_PRINTLN {}
            | RESERVADA_PRINT {};

sentencia_if: RESERVADA_IF condicion instrucciones_llaves 
            | RESERVADA_IF condicion instrucciones_llaves RESERVADA_ELSE sentencia_if
            | RESERVADA_IF condicion instrucciones_llaves RESERVADA_ELSE instrucciones_llaves;


sentencia_while: RESERVADA_WHILE condicion instrucciones_llaves;

sentencia_do_while: RESERVADA_DO instrucciones_llaves RESERVADA_WHILE condicion PUNTO_COMA {};

sentencia_for: RESERVADA_FOR PARENTIZQ declaracion_for PUNTO_COMA expresion PUNTO_COMA incremento_decremento PARENTDER instrucciones_llaves {};

declaracion_for: tipo ID ASIGNACION expresion {}
               | ID  ASIGNACION expresion {};

incremento_decremento: ID INCR {}
                     | ID DECR {};   

sentencia_return_metodos: RESERVADA_RETURN PUNTO_COMA { $$ = $1;}
                        ;
sentencia_return_funciones: RESERVADA_RETURN expresion PUNTO_COMA { $$ = $1;};              

sentencia_break: RESERVADA_BREAK PUNTO_COMA { $$ = $1;}
                ;

sentencia_continue: RESERVADA_CONTINUE PUNTO_COMA { $$ = $1;}
                  ;                    

asignacion_simple: ID ASIGNACION expresion PUNTO_COMA { $$ = $1;}
                 ;

condicion: PARENTIZQ expresion PARENTDER;



expresion : MENOS expresion %prec UMENOS	{ $$ = $2;}    
          | NEG expresion	            { $$ = $2;}   
          | expresion  MAS expresion      { $$ = $1;}   
          | expresion MENOS expresion       { $$ = $1;}    
          | expresion MULT expresion  { $$ = $1;}
          | expresion DIVISION expresion	    { $$ = $1;}
          | expresion MAYOR_IGUAL expresion	    { $$ = $1;}
          | expresion MENOR_IGUAL expresion      { $$ = $1;}     
          | expresion MAYOR expresion	 { $$ = $1;}   
          | expresion MENOR expresion	 { $$ = $1;}   
          | expresion IGUALDAD expresion	  { $$ = $1;}  
          | expresion DESIGUALDAD expresion	  { $$ = $1;}  
          | expresion AND expresion	    { $$ = $1;}                     
          | expresion OR expresion	  { $$ = $1;} 
          | expresion XOR expresion	    { $$ = $1;}
          | NUMBER     		    { $$ = ($1);}
          | DECIMAL		          { $$ = ($1);}
          | RESERVADA_TRUE				   { $$ = $1;} 
          | RESERVADA_FALSE				{ $$ = $1;}    
          | STRING			         { $$ = $1;}                   
          | PARENTIZQ expresion PARENTDER { $$ = $2;}
          | ID                  { $$ = $1;}
          ;       












