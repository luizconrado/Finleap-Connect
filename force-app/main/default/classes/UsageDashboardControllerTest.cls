@isTest
public class UsageDashboardControllerTest {

    @isTest
    static void fetchAllTrackingRecordsTest(){
        Test.startTest();
        UsageDashboardController.fetchAllTrackingRecords('4/6/2020','6/28/2020');
        UsageDashboardController.getLoginHistory('4/6/2020','6/28/2020');
        Test.stopTest();
    }
}