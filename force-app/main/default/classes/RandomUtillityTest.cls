@isTest
public class RandomUtillityTest {

    @isTest
    static void testRandom(){
        System.assertNotEquals(RandomUtillity.getInteger(2000), RandomUtillity.getInteger(2000));
        System.assertEquals(4,RandomUtillity.getString(4).length());
        
    }
}