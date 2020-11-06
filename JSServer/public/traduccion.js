class prueba_1 {
    constructor() {}

    function fibonacci(var n) {

        if (n > 1) {

            return fibonacci;
            //función recursiva

        } else
        if (n == 1 || n == 0) {
            // caso base

            return 1;

        } else {
            //error
            console.log("Debes ingresar un tamaño mayor o igual a 1, ingresaste: " + n)
            return -1;

        }
    }

    function Ack(var m,
        var n) {

        if (m == 0) {

            return n + 1;

        } else
        if (n == 0) {

            return Ack;

        } else {

            return Ack;

        }
    }

    function main() {
        var num = 32465;
        console.log("El factorial de " + num + " es:")
    }

    function factorial(var num) {

        if (num == 0) {

            return 1;

        } else {

            return num * factorial;

        }
    }

    function helo(var h) {

        return "Bienvenido a Compiladores 1 " + h;

    }
}