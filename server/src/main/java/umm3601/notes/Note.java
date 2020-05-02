package umm3601.notes;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.mongodb.lang.Nullable;

import org.bson.types.ObjectId;
import org.mongojack.Id;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {

  @org.mongojack.ObjectId @Id
  public String _id;
  public String owner_id;

  public String body;

  @JsonProperty(value="addDate")
  public Date getAddDate () {
    return new ObjectId(_id).getDate();
  }

  // The annotations appear to contradict here, but they don't.
  // What they're saying is, "It's totally fine if this property is null,
  // but if it is we shouldn't serialize it into the document."
  @Nullable @JsonInclude(Include.NON_NULL)
  public Date expireDate;

  // When serializing or deserializing, this will look like a string.  However,
  // internally, its values will be constrained.  This makes comparison faster and safer,
  // but can make using it a little tricky.
  public enum NoteStatus {
    @JsonProperty(value="active") ACTIVE,
    @JsonProperty(value="draft") DRAFT,
    @JsonProperty(value="template") TEMPLATE,
    @JsonProperty(value="deleted") DELETED
  }
  public NoteStatus status;
}
