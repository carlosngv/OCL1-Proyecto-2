/**
 *
 * @author Carlos NG
 */

public class HashTable {

    int c = 1;
    private int size; // current size.
    private int SIZE = 37; // Hash Table size.
    LinkedListHash[] list;

    public HashTable() {
        list = new LinkedListHash[SIZE];
        int i;
        for (i = 0; i < SIZE; i++) {
            list[i] = new LinkedListHash();

        }
        size = 0;
    }
    private BigInteger hash(BigInteger value) {
        BigInteger key;
        key = value.mod(BigInteger.valueOf(SIZE));
        return (key);
    }
    
    public void insert(Client client) {
        if (client == null) {
            return;
        }
        BigInteger hashIndex = hash(client.getDPI());
        list[hashIndex.intValue()].addFirst(client, hashIndex.intValue());
        size++;
        double colSize = ((SIZE * 0.75) - 0.75);
        if (size == ((int) colSize)) {
            resizing(client);
        }
    }

    public void remove(Client client) {
        BigInteger hashIndex = hash(client.getDPI());
        list[hashIndex.intValue()].remove(client.getDPI().intValue());
        size--;
    }
}
