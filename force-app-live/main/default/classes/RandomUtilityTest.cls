@isTest
public class RandomUtilityTest {

    @isTest
    static void testRandom(){
        System.assertNotEquals(RandomUtility.getInteger(2000), RandomUtility.getInteger(2000));
        System.assertEquals(4,RandomUtility.getString(4).length());
        
    }
}