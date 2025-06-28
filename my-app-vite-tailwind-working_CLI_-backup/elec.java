// import java.util.*;
// public class DSA {
//     public static void main(String[] args){
//         Scanner sc= new Scanner(System.in);
//         int [] A= new int[50];
//         System.out.print("Enter the size of array:");
//         int size=sc.nextInt();
//         if (size > 49) {
//             System.out.println("Size too large! Maximum allowed is 49.");
//             return;
//         }
//         for(int i=0; i<size;i++){
//              System.out.print("Enter A["+ i +"]:");
//              A[i] = sc.nextInt();
//         }
         
//          System.out.print("Enter the position where you want to insert:");
//          int pos= sc.nextInt();
//          if (pos < 1 || pos > size + 1) {
//             System.out.println("Invalid position! It should be between 1 and " + (size + 1));
//             return;
//         }

//         if (size == 50) {
//             System.out.println("Array is full. Cannot insert.");
//             return;
//         }
//          for(int i=size-1;i>=pos-1;i--){
//             A[i+1]=A[i];
//          }
//          System.out.print("Enter the value you want to insert:");
//          A[pos-1]= sc.nextInt();
//          System.out.println("Final Array:");
//          for(int i=0;i<size;i++){
//             System.out.println("A["+i+"]=" +A[i]);
//          }
//          sc.close();
//          }           
//     }