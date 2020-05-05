package umm3601.owners;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.client.MongoClient;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import static com.mongodb.client.model.Filters.eq;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;
import io.javalin.http.NotFoundResponse;

public class OwnerControllerSpec {

  private static final Class NotFoundResponse = null;
  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private OwnerController ownerController;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  static ObjectId importantOwnerId;
  static String myx500;
  static String mySub;
  static BasicDBObject importantOwner;

@BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
    MongoClientSettings.builder()
    .applyToClusterSettings(builder ->
    builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
    .build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setupEach() throws IOException {

    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    // Setup database
    MongoCollection<Document> noteDocuments = db.getCollection("owners");
    noteDocuments.drop();
    List<Document> testNotes = new ArrayList<>();
    testNotes.add(Document.parse("{ name: \"person1\", " + "officeNumber: \"111\", " + "email: \"test@email1\", "+
  "building: \"Science\", " + "x500: \"x500_1\", " + "sub: \"sub1\"}"));
  testNotes.add(Document.parse("{ name: \"person2\", " + "officeNumber: \"222\", " + "email: \"test@email2\", "+
  "building: \"HFA\", " + "x500: \"x500_2\", "+ "sub: \"sub2\"}"));
  testNotes.add(Document.parse("{ name: \"person3\", " + "officeNumber: \"333\", " + "email: \"test@email3\", "+
  "building: \"Imholte\", " + "x500: \"x500_3\", "+ "sub: \"sub3\"}"));

    importantOwnerId = new ObjectId();
    importantOwner = new BasicDBObject("_id", importantOwnerId);
    myx500 = "smallOwner";
    mySub = "smallSub";
    importantOwner.append("x500", myx500);
    importantOwner.append("sub", mySub);

    noteDocuments.insertMany(testNotes);
    noteDocuments.insertOne(Document.parse(importantOwner.toJson()));

    ownerController = new OwnerController(db);
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }
/*
  @Test
  public void VerifyHttpRequests() throws IOException {

  } */

  @Test
  public void GetOwnerById() throws IOException {

    mockReq.setMethod("GET");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/owner/:id", ImmutableMap.of("id", importantOwnerId.toHexString()));
    ownerController.getOwnerByID(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Owner resultOwner = JavalinJson.fromJson(result, Owner.class);

    assertEquals(resultOwner._id, importantOwnerId.toHexString());
    assertEquals(resultOwner.name, importantOwner.get("name"));
  }

  @Test
  public void GetOwnerByx500() throws IOException {
    mockReq.setMethod("GET");
    String testx500 = "x500_3";
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/owner/x500/:x500", ImmutableMap.of("x500", testx500.toString()));
    ownerController.getOwnerByx500(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Owner resultOwner = JavalinJson.fromJson(result, Owner.class);

    assertEquals("person3", resultOwner.name);
  }

  @Test
  public void GetOwnerWithBadId() throws IOException {

    mockReq.setMethod("GET");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/owner/:id", ImmutableMap.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      ownerController.getOwnerByID(ctx);
    });
  }

  @Test
  public void GetOwnerWithNonexistentId() throws IOException {

    mockReq.setMethod("GET");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/owner/:id", ImmutableMap.of("id", new ObjectId().toHexString()));

    assertThrows(NotFoundResponse.class, () -> {
      ownerController.getOwnerByID(ctx);
    });
  }

  @Test
  public void GetOwnerIdByx500() throws IOException {
    String result = ownerController.getOwnerIDByx500(myx500);
    assertEquals(result, importantOwnerId.toHexString());

  }


  @Test
  public void AddOwner() throws IOException {

    String testNewOwner = "{ \"name\": \"Guy Fieri\", " + "\"officeNumber\": \"777\", " + "\"email\": \"guy@flavortown\", "+
    "\"building\": \"Flavortown\", " + "\"x500\": \"guyF\" }";

    mockReq.setBodyContent(testNewOwner);
    mockReq.setMethod("POST");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/owner/new");

    ownerController.addOwner(ctx);

    assertEquals(201, mockRes.getStatus());

    String result = ctx.resultString();
    String id = jsonMapper.readValue(result, ObjectNode.class).get("id").asText();
    assertNotEquals("", id);

    assertEquals(1, db.getCollection("owners").countDocuments(eq("_id", new ObjectId(id))));

    //verify owner was added to the database and the correct ID
    Document addedOwner = db.getCollection("owners").find(eq("_id", new ObjectId(id))).first();
    assertNotNull(addedOwner);
    assertEquals("Guy Fieri", addedOwner.getString("name"));
    assertEquals("Flavortown", addedOwner.getString("building"));
    assertEquals("777", addedOwner.getString("officeNumber"));
    assertEquals("guy@flavortown", addedOwner.getString("email"));
    assertEquals("guyF", addedOwner.getString("x500"));
  }

  @Test
  public void GetOwnerIDBySubject() throws IOException {
    String result = ownerController.getOwnerIDBySubject(mySub); // sub from important owner
    assertEquals(result, importantOwnerId.toHexString());

  }

  @Test
  public void getOwnerIDByBadSubject() throws IOException {
    Exception exception = assertThrows(NotFoundResponse.class,
    () -> {
      ownerController.getOwnerIDBySubject("this sub should not work");
    });

    String expectedMessage = "The requested owner ID was not found and getOwnerIDBySubject is breaking things";
    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(expectedMessage));
  }




}

