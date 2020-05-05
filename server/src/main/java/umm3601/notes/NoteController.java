package umm3601.notes;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

import javax.annotation.CheckReturnValue;

import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Updates.set;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.ConflictResponse;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.UnauthorizedResponse;
import umm3601.TokenVerifier;
import umm3601.UnprocessableResponse;
import umm3601.notes.Note.NoteStatus;
import umm3601.owners.Owner;
import umm3601.owners.OwnerController;

public class NoteController {

  JacksonCodecRegistry jacksonCodecRegistry = JacksonCodecRegistry.withDefaultObjectMapper();

  private MongoCollection<Owner> ownerCollection;
  private final MongoCollection<Note> noteCollection;
  private final TokenVerifier tokenVerifier;
  private final OwnerController ownerController;
  private final DeathTimer deathTimer = DeathTimer.getDeathTimerInstance();

  /**
   * The length of a note's body must be less than or equal to this value.
   */
  public static final int MAXIMUM_BODY_LENGTH = 1_000;

  /**
   * The length of a note's body must be greater than or equal to this value.
   */
  public static final int MINIMUM_BODY_LENGTH = 1;


  public NoteController(MongoDatabase database) {
    jacksonCodecRegistry.addCodecForClass(Note.class);
    noteCollection = database.getCollection("notes").withDocumentClass(Note.class)
        .withCodecRegistry(jacksonCodecRegistry);

    ownerController = new OwnerController(database);
    tokenVerifier = new TokenVerifier();
  }

  public boolean verifyHttpRequest(Context ctx) {
    if (!this.tokenVerifier.verifyToken(ctx)) {
      throw new BadRequestResponse("Invalid header token. The request is not authorized.");
    } else {
      return true;
    }
  }

  public void checkOwnerForNewNote(Context ctx) {
    String x500 = tokenVerifier.getOwnerx500(ctx);
    String ownerID = ownerController.getOwnerIDByx500(x500);

    Note newNote = ctx.bodyAsClass(Note.class);

    if(!ownerID.equals(newNote.owner_id)) {
      ctx.status(401);
      throw new UnauthorizedResponse("You do not have permission to perform this action.");
    }
  }

  public void checkOwnerForGivenNote(Context ctx) {
    String x500 = tokenVerifier.getOwnerx500(ctx);
    String ownerID = ownerController.getOwnerIDByx500(x500);

    String noteID = ctx.pathParam("id");
    Note note;

    try {
    note = noteCollection.find(eq("_id", new ObjectId(noteID))).first();
    }  catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested note id wasn't a legal Mongo Object ID.");
    }

    if (note == null) {
      throw new NotFoundResponse("The requested note was not found");
    } else if (!ownerID.equals(note.owner_id)) {
      ctx.status(401);
      throw new UnauthorizedResponse("You do not have permission to perform this action.");
    }
  }

  public void getNoteByID(Context ctx) {
    String id = ctx.pathParam("id");
    Note note;

    try {
      note = noteCollection.find(eq("_id", new ObjectId(id))).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested note id wasn't a legal Mongo Object ID.");
    }
    if (note == null) {
      throw new NotFoundResponse("The requested note was not found");
    } else {
      ctx.json(note);
    }
  }

  public void getOwnerNotes(Context ctx) {

    List<Bson> filters = new ArrayList<Bson>(); // start with a blank document

    if (ctx.queryParamMap().containsKey("owner_id")) {
      filters.add(eq("owner_id", ctx.queryParam("owner_id")));
    if (ctx.queryParamMap().containsKey("status")) {
      filters.add(eq("status", ctx.queryParam("status")));
    }
    }else{
      throw new NotFoundResponse("The requested owner was not found");
    }

    ctx.json(noteCollection.find(filters.isEmpty() ? new Document() : and(filters))
    .into(new ArrayList<>()));
  }


  public void getNotes(Context ctx) {
    ctx.json(noteCollection.find(new Document()).into(new ArrayList<>()));
  }

  public void addNote(Context ctx) {

    Note newNote = ctx.bodyValidator(Note.class)
      .check(note -> note.body.length() >= MINIMUM_BODY_LENGTH)
      .check(note -> note.body.length() <= MAXIMUM_BODY_LENGTH)
      .get();

    noteCollection.insertOne(newNote);
    deathTimer.updateTimerStatus(newNote);
    ctx.status(201);
    ctx.json(ImmutableMap.of("id", newNote._id));
  }

  /**
   * Edit an existing note
   */
  public void editNote(Context ctx) {

    Document inputDoc = ctx.bodyAsClass(Document.class); //throws 400 error
    Document toEdit = new Document();
    Document toReturn = new Document();

    String id = ctx.pathParam("id");
    if (inputDoc.isEmpty()) {
      throw new BadRequestResponse("PATCH request must contain a body.");
    } else if (inputDoc.getString("body").length() < MINIMUM_BODY_LENGTH) {
      throw new BadRequestResponse("The body of the received note was too short.");
    } else if (inputDoc.getString("body").length() > MAXIMUM_BODY_LENGTH) {
      throw new BadRequestResponse("The body of the received note was too long.");
    }


    Note note;

    try {
      note = noteCollection.find(eq("_id", new ObjectId(id))).projection(new Document("addDate", 0)).first();
      // This really isn't the right way to do things.  Retrieving the database object
      // in order to check if it exists is inefficient.  We will need to do this at some
      // point, in order to enforce non-active notices not gaining expiration dates--but
      // we can probably move that later.  It's a question of: do the expensive thing always;
      // or do the cheap thing always, and sometimes the expensive thing as well.
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested note id wasn't a legal Mongo Object ID.");
    }

    if (note == null) {
      throw new NotFoundResponse("The requested note does not exist.");
    }

    // verifyJwtFromHeader will throw an UnauthorizedResponse if the user isn't logged in.
    // Due to verification in "before" clauses, this isn't necessary.
    // String currentUserSub = jwtProcessor.verifyJwtFromHeader(ctx).getSubject();

    //String subOfOwnerOfNote = getDoorBoard(note.owner_id).sub;

    /**
    if (!subOfOwnerOfNote.equals(currentUserSub)) {
      throw new ForbiddenResponse("Request not allowed; users can only edit their own notes");
    }
    */

    HashSet<String> validKeys = new HashSet<String>(Arrays.asList("body", "expireDate", "status"));
    HashSet<String> forbiddenKeys = new HashSet<String>(Arrays.asList("owner_id", "addDate", "_id"));
    for (String key: inputDoc.keySet()) {
      if(forbiddenKeys.contains(key)) {
        throw new BadRequestResponse("Cannot edit the field " + key + ": this field is not editable and should be considered static.");
      } else if (!(validKeys.contains(key))){
        throw new ConflictResponse("Cannot edit the nonexistent field " + key + ".");
      }
    }


    NoteStatus noteStatus = note.status;
      // At this point, we're taking information from the user and putting it directly into the database.
      // I'm unsure of how to properly sanitize this; StackOverflow just says to use PreparedStatements instead
      // of Statements, but thanks to the magic of mongodb I'm not using either.  At this point I'm going to cross
      // my fingers really hard and pray that this will be fine.

      if(inputDoc.containsKey("body")) {
        toEdit.append("body", inputDoc.get("body"));
      }
      if (inputDoc.containsKey("status")) {
        toEdit.append("status", inputDoc.get("status"));
        noteStatus = NoteStatus.valueOf(inputDoc.get("status").toString().toUpperCase());
        if(!inputDoc.get("status").equals("active")) {
          toReturn.append("$unset", new Document("expireDate", ""));
          //Only active notices can have expiration dates, so if a notice becomes inactive, it loses
          //its expiration date.
        }
      }

      if(inputDoc.containsKey("expireDate")){
        if(inputDoc.get("expireDate") == null) {
          toReturn.append("$unset", new Document("expireDate", "")); //If expireDate is specifically included with a null value, remove the expiration date.
        } else if (!noteStatus.equals(NoteStatus.ACTIVE)) {
          throw new ConflictResponse("Expiration dates can only be assigned to active notices.");
          //Order of clauses means we don't mind of someone manually zeroes their expireDate when making something inactive.
        } else if (new Date().after((Date)inputDoc.get("expireDate"))){
          throw new UnprocessableResponse("Expiration date cannot be in the past.");
        } else {
          toEdit.append("expireDate", inputDoc.get("expireDate"));
        }
      }

      //If the message includes a change to status or expiration date, update timers here

      if(!(toEdit.isEmpty())) {
        toReturn.append("$set", toEdit);
      }
      noteCollection.updateOne(eq("_id", new ObjectId(id)), toReturn);
      //Should probably only run update if expiration date or status changed

      deathTimer.updateTimerStatus(noteCollection.find(eq("_id", new ObjectId(id))).first());

      //we're getting the note, we can(should) send it back with a 201 instead of just a 204
      //alternatively, give 204 if all the changed fields have the same values and 201 otherwise
      ctx.status(204);
    }

  /**
   * Move a note with a given id to the trash, if the id exists.
   *
   * If the id does not exist, do nothing.
   */
  // need to verify that owner is correct owner
  public void deleteNote(Context ctx) {
    String id = ctx.pathParamMap().get("id");
    // check if owner id of a note, matches logged in user's id
    Note oldNote = noteCollection.findOneAndUpdate(eq("_id", new ObjectId(id)), set("status", "deleted"));

    if (oldNote == null) {
      throw new NotFoundResponse("The requested note was not found");
    } else {
      ctx.status(200);
      ctx.json(ImmutableMap.of("id", id));
    }
  }

  public void permanentlyDeleteNote(Context ctx) {
    String id = ctx.pathParamMap().get("id");

    Note noteToDelete = noteCollection.findOneAndDelete(eq("_id", new ObjectId(id)));

    if (noteToDelete == null) {
      throw new NotFoundResponse("The requested note was not found");
    } else {
      ctx.status(200);
      ctx.json(ImmutableMap.of("id", id));
    }
  }

  public void restoreNote(Context ctx) {
    String id = ctx.pathParamMap().get("id");
    // check if owner id of a note, matches logged in user's id
    Note oldNote = noteCollection.findOneAndUpdate(eq("_id", new ObjectId(id)), set("status", "active"));

    if (oldNote == null) {
      throw new NotFoundResponse("The requested note was not found");
    } else {
      ctx.status(200);
      ctx.json(ImmutableMap.of("id", id));
    }
  }

      /**
     * Silently purge a single notice from the database.
     *
     * A helper function which should never be called directly.
     * This function is not guaranteed to behave well if given an incorrect
     * or invalid argument.
     *
     * @param id the id of the note to be deleted.
     */
    protected void singleDelete(String id) {
      noteCollection.deleteOne(eq("_id", new ObjectId(id)));
      deathTimer.clearKey(id);
    }



    /**
     * Flags a single notice as deleted.
     *
     * A helper function which should never be called directly.
     * Note that this calls UpdateTimerStatus on said note.
     * This function is not guaranteed to behave well
     * if given an incorrect or invalid argument.
     *
     * @param id the id of the note to be flagged.
     */
    protected void flagOneForDeletion(String id) {
      noteCollection.updateOne(eq("_id", new ObjectId(id)),
       new Document("$set", new Document("status", "deleted").append("expireDate", null)));
      deathTimer.updateTimerStatus(noteCollection.find(eq("_id", new ObjectId(id))).first());
    }

}
