
%lex
%options case-insensitive

%%

\s+			{}								
[ \t\r\n\f] %{  %}
\n                  {}
                    

    
\"[^\"]*\"				{ yytext = yytext.substr(1,yyleng-2); return 'STRING'; }
[0-9]+("."[0-9]+)?\b  	return 'DECIMAL';
[0-9]+\b				return 'ENTERO';
"//".*					return 'STRING';		
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
"null" return 'RESERVADA_NULL';           
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

.                       { console.error('Este es un error léxico: ' + yytext + '  en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column);}
/lex

%{
    const Node = require('./AST/node');
    const Error = require('./AST/error');
    const ScanError = require('./Error/scanError');
    var errorList = [];
    var serrorList = [];
    var nodeList = [];
    this.traduction = "";
%}

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

%right 'NEG'
%left UMENOS

%start inicio
%%

inicio: lista_clases EOF {
    $$ = new Node('INICIO', '');
    $$.setChild($1);
    $$.nodeList = nodeList;
    $$.traduction = $1.traduction;
    this.traduction = $$.traduction;
    $$.errorList = errorList;
    return $$;
}
      | lista_interfaces inicio { 
            $$ = new Node('INICIO', '');
            $$.setChild($1);
            $$.nodeList = nodeList;
            $$.traduction = $1.traduction;
            this.traduction = $$.traduction;
            $$.errorList = errorList;
            return $$;
      }
      | EOF {  }
      ;

lista_clases: lista_clases sentencia_clase { 
    $$ = new Node('LISTA_CLASES','');
    $$.setChild($1);
    $$.setChild($2);
    $$.traduction = $1.traduction + ' ' + $2.traduction;
}
            | sentencia_clase { 
                $$ = new Node('LISTA_CLASES','');
                $$.setChild($1);
                $$.traduction = $1.traduction
            }
            ;

sentencia_clase: RESERVADA_PUBLIC RESERVADA_CLASS ID bloque_declaracion_metodos_funciones { 
    $$ = new Node('SENTENCIA_CLASE', ' ');
    $$.setChild(new Node($1, 'PUBLIC'));
    $$.setChild(new Node($2, 'CLASS'));
    $$.setChild(new Node($3, 'ID'));
    $$.setChild($4);
    $$.traduction = $2 + ' ' + $3 + ' ' + $4.traduction; // class hola
 }
                | error {
                     console.log("1. Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
                     newError = new Error(yytext, this._$.first_line, this._$.first_column);
                     errorList.push(newError);
                };

bloque_declaracion_metodos_funciones: LLAVEIZQ lista_declaracion_metodos_funciones LLAVEDER { 
    $$ = new Node('BLOQUE_DECLARACION_MF', ' ');
    $$.setChild(new Node($1, 'LLAVEIZQ'));
    if($2.childList.length > 0) {
        $$.setChild($2);
    }
    $$.setChild(new Node($3, 'LLAVEDER'));
    $$.traduction = $1 + '\n' + $2.traduction + '\n' +$3 + '\n' // { instrucciones }
}
                             | LLAVEIZQ LLAVEDER { 
                                 $$ = new Node('BLOQUE_DECLARACION_MF', ' ');
                                 $$.setChild(new Node($1, 'LLAVEIZQ'));
                                 $$.setChild(new Node($2, 'LLAVEDER'));
                                 $$.traduction = $1 + $2;
                             }
                             | error {
                                console.log("2. Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
                                newError = new Error(yytext, this._$.first_line, this._$.first_column);
                                errorList.push(newError);
                             }
                             ;

lista_declaracion_metodos_funciones: lista_declaracion_metodos_funciones declaracion_metodos_funciones { 
    $$ = new Node('LISTA_DECLARACION_MF', '');
    $$.setChild($1);
    $$.setChild($2);
    $$.traduction = $1.traduction + ' ' + $2.traduction;
}
                                    | declaracion_metodos_funciones { 
                                        $$ = new Node('LISTA_DECLARACION_MF', '');
                                        $$.setChild($1);
                                        $$.traduction = $1.traduction;
                                    }
                                    ;

declaracion_metodos_funciones: RESERVADA_PUBLIC tipo ID PARENTIZQ declaracion_parametros_mf { 
    $$ = new Node('DECLARACION_MF', '');
    $$.setChild(new Node($1, 'PUBLIC'));
    $$.setChild($2);
    $$.setChild(new Node($3, 'ID'));
    $$.setChild(new Node($4, 'PARENTIZQ'));
    $$.setChild($5);
    $$.traduction = 'function ' + $3 + $4 + $5.traduction;
}
                            | error {
                                newError = new Error(yytext, this._$.first_line, this._$.first_column);
                                errorList.push(newError);
                                console.log("3.Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
                             };

declaracion_parametros_mf: lista_parametros PARENTDER instrucciones_llaves { 
    $$ = new Node('DECLARACION_PARAMETROS_MF', '');
    $$.setChild($1);
    $$.setChild(new Node($3, 'PARENTDER'));
    $$.setChild($3);
    $$.traduction = $1.traduction + $2 + ' ' + $3.traduction;
}
                         | PARENTDER instrucciones_llaves { 
                                $$ = new Node('DECLARACION_PARAMETROS_MF', '');
                                $$.setChild(new Node($1, 'PARENTDER'));
                                $$.setChild($2);
                                $$.traduction = $1 + ' ' + $2.traduction;
                         }
                         ;

lista_interfaces: lista_interfaces sentencia_interfaz { 
    $$ = new Node('LISTA_INTERFACES', '');
    $$.setChild($1);
    $$.setChild($2);
}
                | sentencia_interfaz { 
                    $$ = new Node('LISTA_INTERFACES', '');
                    $$.setChild($1);
                }
                ; 

sentencia_interfaz: RESERVADA_PUBLIC RESERVADA_INTERFACE ID bloque_declaracion_funcion { 
    $$ = new Node('SENTENCIA_INTERFAZ', '');
    $$.setChild(new Node($1,'PUBLIC'));
    $$.setChild(new Node($2,'INTERFACE'));
    $$.setChild(new Node($3,'ID'));
    $$.setChild(new Node($4));
};

bloque_declaracion_funcion: LLAVEIZQ lista_declaracion_funciones LLAVEDER { 
    $$ = new Node('BLOQUE_DECLARACION_FUNC', '');
    $$.setChild(new Node($1,'LLAVEIZQ'));
    $$.setChild($2);
    $$.setChild(new Node($3,'LLAVEDER'));
}
                     | LLAVEIZQ LLAVEDER { 
                        $$ = new Node('BLOQUE_DECLARACION_FUNC', '');
                        $$.setChild(new Node($1,'LLAVEIZQ'));
                        $$.setChild(new Node($3,'LLAVEDER'));
                     }
                     ;

lista_declaracion_funciones: lista_declaracion_funciones declaracion_funcion { 
    $$ = new Node('LISTA_DECLARACION_FUNC', '');
    $$.setChild($1);
    $$.setChild($2);
}
                           | declaracion_funcion { 
                                $$ = new Node('LISTA_DECLARACION_FUNC', '');
                                $$.setChild($1);
                           }
                           ;

declaracion_funcion: RESERVADA_PUBLIC tipo ID PARENTIZQ declaracion_parametros_funcion { 
    $$ = new Node('DECLARACION_FUNC', '');
    $$.setChild(new Node($1,'PUBLIC'));
    $$.setChild($2);
    $$.setChild(new Node($3,'ID'));
    $$.setChild(new Node($4,'PARENTIZQ'));
    $$.setChild($5);
};

declaracion_parametros_funcion: lista_parametros PARENTDER PUNTO_COMA { 
    $$ = new Node('DECLARACION_PARAMETROS_FUNC', '');
    $$.setChild($1);
    $$.setChild(new Node($2,'PARENTDER'));
    $$.setChild(new Node($3,'PUNTO_COMA'));
}
                              | PARENTDER PUNTO_COMA  { 
                                $$ = new Node('DECLARACION_PARAMETROS_FUNC', '');
                                $$.setChild(new Node($1,'PARENTDER'));
                                $$.setChild(new Node($2,'PUNTO_COMA'));  
                              };

lista_parametros: lista_parametros COMA tipo ID { 
    $$ = new Node('LISTA_PARAMETROS', '');
    $$.setChild($1);
    $$.setChild(new Node($2, 'COMA'));
    $$.setChild($3);
    $$.setChild(new Node($4, 'ID'));
    $$.traduction = $1.traduction + $2 + $3.traduction + $4;
    }
                | tipo ID { 
                    $$ = new Node('LISTA_PARAMETROS', '');
                    $$.setChild($1);
                    $$.setChild(new Node($2, 'ID'));
                    $$.traduction = $1.traduction + $2;
                };


instruccion: asignacion_simple  { 
                        $$ = new Node('INSTRUCCION','');
                        $$.setChild($1);
                        $$.traduction = $1.traduction;
                        }
           | sentencia_break {  
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_continue { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_return_metodos { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_for { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_while { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_do_while { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_if { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           } 
           | sentencia_return_funciones { 
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | sentencia_print {
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | declaracion_variable {
                $$ = new Node('INSTRUCCION','');
                $$.setChild($1);
                $$.traduction = $1.traduction;
           }
           | incremento_decremento { 
               $$ = new Node('INSTRUCCION','');
               $$.setChild($1);
               $$.traduction = $1.traduction;
           };
           

lista_instrucciones: lista_instrucciones instruccion { 
    $$ = new Node('LISTA_INSTRUCCIONES','');
    $$.setChild($1);
    $$.setChild($2);
    $$.traduction = $1.traduction + ' '+ $2.traduction;
}
                   | instruccion { 
                        $$ = new Node('LISTA_INSTRUCCIONES','');
                        $$.setChild($1);
                        $$.traduction = $1.traduction;
                   }
                   | error {
                        newError = new Error(yytext, this._$.first_line, this._$.first_column);
                        errorList.push(newError);
                        console.log("4.Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
                    }
                   ;


instrucciones_llaves: LLAVEIZQ lista_instrucciones LLAVEDER { 
    $$ = new Node('INSTR_LLAVES', '');
    $$.setChild(new Node($1, 'LLAVEIZQ'));
    if($2.childList.length > 0) {
        $$.setChild($2)
    }
    //$$.setChild($2);
    $$.setChild(new Node($3, 'LLAVEDER'));
    $$.traduction = $1 + '\n' + $2.traduction  +'\n' + $3; // { instrucciones }
    

}
                    | LLAVEIZQ LLAVEDER { 
                        $$ = new Node('INSTR_LLAVES', '');
                        $$.setChild(new Node($1, 'LLAVEIZQ'));
                        $$.setChild(new Node($2, 'LLAVEDER'));
                        $$.traduction = $1 + $2 + '\n';  // {}
                        
                    }
                    ;


tipo: RESERVADA_BOOLEAN { $$ = new Node('TIPO',''); $$.setChild(new Node('boolean','RESERVADA')); $$.traduction = 'var ';}
    | RESERVADA_INT { $$ = new Node('TIPO',''); $$.setChild(new Node('int','RESERVADA')); $$.traduction = 'var ';}
    | RESERVADA_CHAR { $$ = new Node('TIPO',''); $$.setChild(new Node('char','RESERVADA')); $$.traduction = 'var ';}
    | RESERVADA_DOUBLE { $$ = new Node('TIPO',''); $$.setChild(new Node('double','RESERVADA')); $$.traduction = 'var ';}
    | RESERVADA_STRING { $$ = new Node('TIPO',''); $$.setChild(new Node('String','RESERVADA')); $$.traduction = 'var ';}
    | RESERVADA_VOID { $$ = new Node('TIPO',''); $$.setChild(new Node('void','RESERVADA')); $$.traduction = '';}
    ;

declaracion_variable: tipo lista_id  asignacion {
    $$ = new Node('DECLARACION_VARIABLE', ''); 
    $$.setChild($1);
    if($2.childList.length > 0) {
        $$.setChild($2);
    }
    $$.setChild($3);
    $$.traduction = $1.traduction + $2.traduction + $3.traduction;
};

lista_id: lista_id COMA ID {
    $$ = new Node('LISTA_ID', '');
    $$.setChild('LISTA_ID');
    $$.setChild(new Node($2,'COMMA'));
    $$.setChild(new Node($3,'ID'));
    $$.traduction = $1.traduction + ' ' + $2 + ' ' + $3;
}
        | ID {
           $$ = new Node('LISTA_ID','');
           $$.setChild(new Node($1, 'ID'));
           $$.traduction = $1 + ' ';  
        };

asignacion: ASIGNACION expresion PUNTO_COMA {
    $$ = new Node('ASIGNACION','');
    $$.setChild(new Node($1, 'ASIGNACION'));
    $$.setChild($2);
    $$.setChild(new Node($3, 'PUNTO_COMA'));
    $$.traduction = $1 + ' ' + $2.traduction + $3;
}
          | PUNTO_COMA {
            $$ = new Node('ASIGNACION');
            $$.setChild(new Node($1, 'PUNTO_COMA'));
            $$.traduction = $1;
          }; 

sentencia_print: RESERVADA_SYSTEM PUNTO RESERVADA_OUT PUNTO opcion_print PARENTIZQ expresion PARENTDER PUNTO_COMA {
    $$ = new Node('SENTENCIA_PRINT','');
    $$.setChild(new Node($1, 'SYSTEM'));
    $$.setChild(new Node($2, 'PUNTO'));
    $$.setChild(new Node($3, 'OUT'));
    $$.setChild(new Node($4, 'PUNTO'));
    $$.setChild($5);
    $$.setChild(new Node($6, 'PARENTIZQ'));
    $$.setChild($7);
    $$.setChild(new Node($8, 'PARENTDER'));
    $$.setChild(new Node($9, 'PUNTO_COMA'));
    $$.traduction = 'console.log(' + $7.traduction + ')';
};

opcion_print: RESERVADA_PRINTLN {
    $$ = new Node('OPCION_PRINTLN', '');
    $$.setChild(new Node($1, 'PRINTLN'));
    $$.traduction = "";
}
            | RESERVADA_PRINT {
                $$ = new Node('OPCION_PRINT', '');
                $$.setChild(new Node($1, 'PRINT'));
                $$.traduction = "";
            }
            | error {
                     console.log("5.Error sintáctico en línea: " + this._$.first_line + " y columna: " + this._$.first_column); 
                     newError = new Error(yytext, this._$.first_line, this._$.first_column);
                        errorList.push(newError);
                    };

sentencia_if: RESERVADA_IF condicion instrucciones_llaves {
    $$ = new Node('SENTENCIA_IF', '');
    $$.setChild(new Node($1, 'IF'));
    $$.setChild($2);
    if($3.childList.length > 0) {
        $$.setChild($3);
    }
    $$.traduction = '\n' + $1 + ' ' + $2.traduction + ' ' + $3.traduction;
}
            | RESERVADA_IF condicion instrucciones_llaves RESERVADA_ELSE sentencia_if {
                $$ = new Node('SENTENCIA_IF', '');
                $$.setChild(new Node($1, 'IF'));
                $$.setChild($2);
                $$.setChild($3);
                $$.setChild(new Node($4, 'ELSE'));
                $$.setChild($5);
                $$.traduction = '\n' +$1 + ' ' + $2.traduction + ' ' + $3.traduction + ' ' + $4 + ' ' + $5.traduction;
            }
            | RESERVADA_IF condicion instrucciones_llaves RESERVADA_ELSE instrucciones_llaves {
                $$ = new Node('SENTENCIA_IF', '');
                $$.setChild(new Node($1, 'IF'));
                $$.setChild($2);
                $$.setChild($3);
                $$.setChild(new Node($4, 'ELSE'));
                $$.setChild($5);
                $$.traduction = '\n' +$1 + ' '+ $2.traduction + ' ' + $3.traduction + ' ' + $4 + ' ' + $5.traduction;
            };


sentencia_while: RESERVADA_WHILE condicion instrucciones_llaves {
    $$ = new Node('SENTENCIA_WHILE','');
    $$.setChild(new Node($1, 'WHILE'));
    $$.setChild($2);
    if($3.childList.length > 0) {
        $$.setChild($3);
    }
    $$.traduction = '\n' + $1 + $2.traduction + ' ' + $3.traduction;
} ;

sentencia_do_while: RESERVADA_DO instrucciones_llaves RESERVADA_WHILE condicion PUNTO_COMA {
    $$ = new Node('SENTENCIA_DO_WHILE', '');
    $$.setChild(new Node($1, 'DO'));
    if($2.childList.length > 0) {
        $$.setChild($2);
    }
    $$.setChild(new Node($3, 'WHILE'));
    $$.setChild($4);
    $$.setChild(new Node($5, 'PUNTO_COMA'));
    $$.traduction =  '\n' +$1 + ' ' + $2.traduction + ' ' + $3  + $4.traduction + $5 + '\n';
};

sentencia_for: RESERVADA_FOR PARENTIZQ declaracion_for PUNTO_COMA expresion PUNTO_COMA incremento_decremento PARENTDER instrucciones_llaves {
    $$ = new Node('SENTENCIA_FOR', '');
    $$.setChild(new Node($1, 'FOR'));
    $$.setChild(new Node($2, 'PARENTIZQ'));
    $$.setChild($3);
    $$.setChild(new Node($4, 'PUNTO_COMA'));
    $$.setChild($5);
    $$.setChild(new Node($6, 'PUNTO_COMA'));
    $$.setChild($7);
    $$.setChild(new Node($8, 'PARENTDER'));
    if($9.childList.length > 0) {
        $$.setChild($9);
    }
    $$.traduction = '\n' + $1 + $2 + $3.traduction + $4 + ' ' + $5.traduction + $6  + ' ' + $7.traduction + $8 + $9.traduction;
};

declaracion_for: tipo ID ASIGNACION expresion {
    $$ = new Node('DECLARACION_FOR','');
    $$.setChild($1);
    $$.setChild(new Node($2, 'ID'));
    $$.setChild(new Node($3, 'ASIGNACION'));
    $$.setChild($4);
    $$.traduction = $1.traduction + $2 + ' ' + $3 + ' ' + $4.traduction;
}
               | ID  ASIGNACION expresion {
                    $$ = new Node('DECLARACION_FOR','');
                    $$.setChild(new Node($1, 'ID'));
                    $$.setChild(new Node($2, 'ASIGNACION'));
                    $$.setChild($3);
                    $$.traduction = $1 + ' ' + $2 + ' ' + $3.traduction;
               };

incremento_decremento: ID INCR {
    $$ = new Node('INCR_DECR','');
    $$.setChild(new Node($1, 'ID'));
    $$.setChild(new Node($2, 'INCR'));
    $$.traduction = $1 + $2;
}
                     | ID DECR {
                            $$ = new Node('INCR_DECR','');
                            $$.setChild(new Node($1, 'ID'));
                            $$.setChild(new Node($2, 'DECR'));
                            $$.traduction = $1 + $2;
                     }
                     
                     | ID DECR PUNTO_COMA {
                            $$ = new Node('INCR_DECR','');
                            $$.setChild(new Node($1, 'ID'));
                            $$.setChild(new Node($2, 'DECR'));
                            $$.setChild(new Node($3, 'PUNTO_COMA'));
                            $$.traduction = '\n' + $1 + $2 + $3;
                     }
                     | ID INCR PUNTO_COMA {
                            $$ = new Node('INCR_DECR','');
                            $$.setChild(new Node($1, 'ID'));
                            $$.setChild(new Node($2, 'INCR'));
                            $$.setChild(new Node($3, 'PUNTO_COMA'));
                            $$.traduction = '\n' + $1 + $2 + $3;
                     }
                     ;   

sentencia_return_metodos: RESERVADA_RETURN PUNTO_COMA { 
    $$ = new Node('SENTENCIA_RETURN_METODOS','');
    $$.setChild(new Node($1, 'RETURN'));
    $$.setChild(new Node($2, 'PUNTO_COMA'));
    $$.traduction = '\n' + $1 + $2 + '\n';
};

sentencia_return_funciones: RESERVADA_RETURN expresion PUNTO_COMA { 
    $$ = new Node('SENTENCIA_RETURN_FUNCIONES','');
    $$.setChild(new Node($1, 'RETURN'));
    $$.setChild($2);
    $$.setChild(new Node($3, 'PUNTO_COMA'));
    $$.traduction = '\n' + $1 + ' '+ $2.traduction +  $3 + '\n';
};              

sentencia_break: RESERVADA_BREAK PUNTO_COMA { 
    $$ = new Node('SENTENCIA_BREAK','');
    $$.setChild(new Node($1, 'BREAK'));
    $$.setChild(new Node($2, 'PUNTO_COMA'));
    $$.traduction = '\n' + $1 + $2 + '\n';
};

sentencia_continue: RESERVADA_CONTINUE PUNTO_COMA { 
    $$ = new Node('SENTENCIA_CONTINUE','');
    $$.setChild(new Node($1, 'CONTINUE'));
    $$.setChild(new Node($2, 'PUNTO_COMA'));
    $$.traduction = '\n' + $1 + $2 + '\n';
};                   

asignacion_simple: ID ASIGNACION expresion PUNTO_COMA { 
    $$ = new Node('ASIGNACION_SIMPLE','');
    $$.setChild(new Node($1, 'ID'));
    $$.setChild(new Node($2, 'ASIGNACION'));
    $$.setChild($3);
    $$.setChild(new Node($4, 'COMA'));
    $$.traduction = $1 + ' ' + $2 + ' ' + $3.traduction + $4 + '\n';
};
                 

condicion: PARENTIZQ expresion PARENTDER { 
    $$ = new Node('CONDICION','');  
    $$.setChild(new Node($1, 'PARENTIZQ'));  
    $$.setChild($2);
    $$.setChild(new Node($3, 'PARENTDER'));
    $$.traduction = $1 + $2.traduction + $3;
};



expresion : MENOS expresion %prec UMENOS	{ 
        $$ = new Node('EXPRESION',''); 
        $$.setChild(new Node($1, 'MENOS'));
        $$.setChild($1);
        $$.traduction = '-' + $2.traduction;
    }    
          | NEG expresion	            { 
                $$ = new Node('EXPRESION',''); 
                $$.setChild(new Node($1, 'NEGACION'));
                $$.setChild($2);
                $$.traduction = '!' + $2.traduction;
          }   
          | expresion  MAS expresion      { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MAS'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' + ' + $3.traduction;
          }   
          | expresion MENOS expresion       { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MENOS'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' - ' + $3.traduction;

          }    
          | expresion MULT expresion  { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MULT'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' * ' + $3.traduction;
          }
          | expresion DIVISION expresion	    { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'DIVISION'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' / ' + $3.traduction;
          }
          | expresion MAYOR_IGUAL expresion	    { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MAYOR_IGUAL'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' >= ' + $3.traduction;
          }
          | expresion MENOR_IGUAL expresion      { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MENOR_IGUAL'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' <= ' + $3.traduction;
          }     
          | expresion MAYOR expresion	 { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MAYOR'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' > ' + $3.traduction;
          }   
          | expresion MENOR expresion	 { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'MENOR'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' < ' + $3.traduction;
          }   
          | expresion IGUALDAD expresion	  { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'IGUALDAD'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' == ' + $3.traduction;
          }  
          | expresion DESIGUALDAD expresion	  { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'NO_IGUAL'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' != ' + $3.traduction;
          }  
          | expresion AND expresion	    { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'AND'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' && ' + $3.traduction;
          }                     
          | expresion OR expresion	  { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'OR'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' || ' + $3.traduction;
          } 
          | expresion XOR expresion	    { 
              $$ = new Node('EXPRESION','');
              $$.setChild($1);
              $$.setChild(new Node($2, 'XOR'));
              $$.setChild($3);
              $$.traduction = $1.traduction + ' ^ ' + $3.traduction;
          }
          | ENTERO     		    { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'ENTERO'));
              $$.traduction = $1
          }
          | DECIMAL		          { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'DECIMAL'));
              $$.traduction = $1
          }
          | RESERVADA_TRUE				   { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'TRUE'));
              $$.traduction = $1
          } 
          | RESERVADA_FALSE				{ 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'FALSE'));
              $$.traduction = $1
          }    
          | STRING			         { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'STRING'));
              $$.traduction = '"'+ $1 +'"';
          }                   
          | PARENTIZQ expresion PARENTDER { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'PARENTIZQ'));
              $$.setChild($2);
              $$.setChild(new Node($3, 'PARENTDER'));
              $$.traduction = $1 + $2.traduction + $3;
          }
          | ID                  { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'ID'));
              $$.traduction = $1
          }
          | RESERVADA_NULL                  { 
              $$ = new Node('EXPRESION','');
              $$.setChild(new Node($1, 'NULL'));
              $$.traduction = $1
          };       












