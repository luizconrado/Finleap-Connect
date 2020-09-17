public class TrackingEventsHandler extends Triggerhandler{
    
     public override void afterInsert(){
     	List<Tracking_Events__e> events=(List<Tracking_Events__e>) Trigger.New;
         TrackHistory.captureChanges(events);
     }

}