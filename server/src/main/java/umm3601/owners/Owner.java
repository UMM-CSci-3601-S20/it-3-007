package umm3601.owners;

import org.mongojack.Id;
import org.mongojack.ObjectId;

public class Owner {

  @ObjectId @Id
  public String _id;
  public String name;
  public String officeNumber;
  public String email;
  public String building;
  public String x500;
  public String sub;

}
