# Translator in Docker
---

Como programadores a veces (no siempre) queremos usar la tecnología o lenguaje de programación que es más reciente o popular. Ya que usualmente, son los que tienen más información a la mano. Es por eso, que trabajar con sistemas heredados y querer replicar su funcionalidad con un lenguaje más actual o popular, se opta por la traducción de este mismo.

Es por eso que se da la solución de dos traductores que tienen como entrada un lenguaje fuente en Java y que su salida es su respectiva traducción en JavaScript y Python. Esto para darle al usurio más de una opción de salida.

---

### Descripción de la Aplicación 
Es un aplicación web, que se encuentra implementada mediante tres contenedores, cuya razón es simular su funcionamiento en distintas computadoras. Cada uno con un servidor propio.



Cuenta con una interfaz gráfica amigable, se puede definir como una página web estática, ya que no tiene mayor funcionalidad. 

#### Menú
El menú consta de las siguientes acciones:
|  **Archivo**    | Archivo Traducido |  AST        |
| ----------- | ----------------- | ----------  |
| Abrir       |     Ambos         |  JavaScript |
| Guardar     |   JavaScript      |  Python     |
| Guardar Como|     Python        |     -       | 

El usuario será capaz de ingresar el código fuente dentro de un editor de código y a lado dos terminales que muestran errores sintácticos (si es que surgen).

![main page](./Documentation/Screenshots/main2.png "Aplicación web")

Dos botones para analizar en cada lenguaje. Un menú en la parte superior, donde el usuario será capaz de descargar los reportes del árbol de análisis sintáctico y la salida, que es la traducción resultante de cada lenguaje. Puede abrir o guardar un nuevo archivo que será plasmado dentro del editor de código y listo para traducirse. De no analizarse correctamente, como se mención, en las terminales se mostrará el error y no será posible traducir y generar el AST.

```Python

class interfaz:
	self.helo(h)
class prueba_1:
	def fibonacci(n):
		if n > 1 :
			return fibonacci 
			# función recursiva

		elif n == 1 or n == 0 :
			#  caso base
			return 1 

		else:
			# error
			print("Debes ingresar un tamaño mayor o igual a 1, ingresaste: " + n )
			return - 1 


	def Ack(m, n):
		if m == 0 :
			return n + 1 

		elif n == 0 :
			return "adios" 

		else:
			return "hola" 


	def main():
		num = 32465 
		print("El factorial de " + num + " es: 1111111" )

	if __name__ = “__main__”:
 		main()
	def factorial(num):
		if num == 0 :
			return 1 

		else:
			return num * factorial 


	def helo(h):
		return "Bienvenido a Compiladores 1 " + h 


class Modificacion:
	self.incremento(a)
	self.decremento(a)
class clase:
	def incremento(a):
		return a ++

	def decremento(a):
		return a --

	def main():
		# uso del ciclo for
		for x in range(0,100):
			for y in range(0.0,100):
				print("Pares de numeros: " + x + " ," + y )



	if __name__ = “__main__”:
 		main()

class error:
	#  Recuperacion mediante modo panico
	def recuperarse():
		x = 5 - 3 * 2 - 4 
		s = "Texto cadena" 
		y = 3 
		x = 8 
		# boolean True = true && false ! true || true !!!! false && true;

	def declaraciones():
		# String s = "",t,r,i="Compi",n="1",g="2020";
		pi = 3.14159265358979323846 

	def main():
		x = 1 
		#  Salir cuando x llega a ser mayor que 4
		while x <= 4 :
			print("Valor de x: " + x )
			# incrementa el valor de x para la siguiente iteración

		while contador < 10 :
			print("Contando... " + contador + 1 )
			contador += 1

	if __name__ = “__main__”:
 		main()


```

Esto es un ejemplo de la salida de código emitida por el traductor de *Java* a *Python*, realizando primeramente el análisis correspondiente. Sintáctico y léxico.

A continuación, un ejemplo de salida del AST generado a partir de una entrada *Java*:

![AST](./Documentation/Screenshots/ast.png "AST Generado")


Este mismo procesos aplica para la generación del archivo traducido en lenguaje Python.

Cabe mencionar que para hacer funcionar la aplicación, debe de ejecturse el siguiente comando: *docker-compose up*. Permite levantar los servidores configuradas para cada uno de los servidores, así, funcionar multiples contenedores relacionados simultaneamente. Esto logra manter un proyecto compacto y capaz de ser ejecutado en cualquier ordenador.

