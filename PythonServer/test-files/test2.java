public class test {
	public String prueba1(int x, int y, int z, String saludo){
		saludo = "Prueba";
		x = 10;
		y = 30;
		/*Una prueba de comentario multilinea
		* 
		*
		*/
		for(int i = 0; i < 20; i++){
			if (saludo != "Hola"){
				System.out.println(saludo);
				do{
					if(y == 30){
					    System.out.println(y);
					}
					x++;
				}while(x < 20);
			}else{
				System.out.println("Saludo es hola");
			}
		}
		return saludo;
	}
}
