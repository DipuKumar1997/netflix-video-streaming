// Java program to demonstrate
// java.nio.file.Path.get(String first,String... more)
// method

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class work {
    public static void main(String[] args) throws IOException {
        // create object of Path
        Path path = (Path)Paths.get("/usr", "local");

        // print Path
        System.out.println(path);
    }
}