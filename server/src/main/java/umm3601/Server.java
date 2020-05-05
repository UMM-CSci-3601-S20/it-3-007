package umm3601;

import java.util.Arrays;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import umm3601.notes.NoteController;
import umm3601.owners.OwnerController;
import umm3601.signs.SignController;


public class Server {

  private static MongoDatabase database;

  /**
   * This is the absolute URL of the root of our website (including the
   * protocol, without a trailing slash).
   *
   * If we get a new domain name, we'll need to change this value.
   */
  public static final String BASE_URL = "https://droptables.csci.app";

  public static void main(String[] args) {

    // Get the MongoDB address and database name from environment variables and
    // if they aren't set, use the defaults of "localhost" and "dev".
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");
    String databaseName = System.getenv().getOrDefault("MONGO_DB", "dev");

    // Setup the MongoDB client object with the information we set earlier
    MongoClient mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    // Get the database
    database = mongoClient.getDatabase(databaseName);

    // Initialize dependencies here ...
    NoteController noteController = new NoteController(database);
    OwnerController ownerController = new OwnerController(database);
    SignController signController = new SignController();

    Javalin server = Javalin.create(config -> {
      // Set the maximum request size to thrice the size of the maximum
      // allowed note, or the old cache size, whichever is larger.
      //
      // (NB: config.requestCacheSize is measured in bytes and
      // NoteController.MAXIMUM_BODY_LENGTH is measured in chars, so we
      // need the factor of two in there.)
      config.requestCacheSize = Math.max(
        config.requestCacheSize,
        3L * 2L * (long)NoteController.MAXIMUM_BODY_LENGTH);
    }).start(4567);

    // Trying to remove extraneous calls to TokenVerifier... I feel like the get a single note API route will be used before
    // edit, trash, restore, and delete, so we shouldn't need to verify them again when the route is updated

    // Note endpoints
    // List notes
    server.get("api/notes", noteController::getOwnerNotes);

    server.before("api/notes/:id", noteController::verifyHttpRequest);
    server.before("api/notes/:id", noteController::checkOwnerForGivenNote);
    // Get a single note
    server.get("api/notes/:id", noteController::getNoteByID);
    // Trash a note
    server.delete("api/notes/:id", noteController::deleteNote);
    // Restore a note
    server.post("api/notes/:id", noteController::restoreNote);

    // Add new note
    server.before("api/new/notes/", noteController::verifyHttpRequest);
    server.before("api/new/notes/", noteController::checkOwnerForNewNote);
    server.post("api/new/notes/", noteController::addNote);

    // Edit an existing note
    server.before("api/notes/edit/:id", noteController::verifyHttpRequest);
    server.before("api/notes/edit/:id", noteController::checkOwnerForGivenNote);
    server.post("api/notes/edit/:id", noteController::editNote);

    // Delete a note
    server.before("api/notes/delete/:id", noteController::verifyHttpRequest);
    server.before("api/notes/delete/:id", noteController::checkOwnerForGivenNote);
    server.delete("api/notes/delete/:id", noteController::permanentlyDeleteNote);

    // Owner Endpoints
    server.get("api/owner", ownerController::getOwners);

    // Add a new owner
    server.before("api/owner/new", ownerController::verifyHttpRequest);
    server.post("api/owner/new", ownerController::addOwner);

    // Get owner by id
    server.get("api/owner/:id", ownerController::getOwnerByID);

    // Get owner by x500
    server.get("api/owner/x500/:x500", ownerController::getOwnerByx500);

    // Sign Endpoints
    server.get("api/sign", signController::getSign);

    server.exception(Exception.class, (e, ctx) -> {
      ctx.status(500);
      ctx.json(e); // you probably want to remove this in production
    });
  }
}
