package umm3601.owners;

import static com.mongodb.client.model.Filters.eq;

import java.util.ArrayList;
import java.util.List;

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
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import umm3601.TokenVerifier;

public class OwnerController {

  JacksonCodecRegistry jacksonCodecRegistry = JacksonCodecRegistry.withDefaultObjectMapper();

  private final MongoCollection<Owner> ownerCollection;
  private final TokenVerifier tokenVerifier;

  public static final String DELETED_RESPONSE = "deleted";
  public static final String NOT_DELETED_RESPONSE = "nothing deleted";

  public OwnerController(MongoDatabase database) {
    jacksonCodecRegistry.addCodecForClass(Owner.class);
    ownerCollection = database.getCollection("owners").withDocumentClass(Owner.class)
        .withCodecRegistry(jacksonCodecRegistry);

    tokenVerifier = new TokenVerifier();
  }

  public boolean verifyHttpRequest(Context ctx) {
    if (!this.tokenVerifier.verifyToken(ctx)) {
      throw new BadRequestResponse("Invalid header token. The request is not authorized.");
    } else {
      return true;
    }
  }

  public void getOwnerByID(Context ctx) {
    String id = ctx.pathParam("id");
    Owner owner;

    try {
      owner = ownerCollection.find(eq("_id", new ObjectId(id))).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested owner id wasn't a legal Mongo Object ID.");
    }
    if (owner == null) {
      throw new NotFoundResponse("The requested owner was not found.");
    } else {
      ctx.json(owner);
    }
  }

  public void getOwnerByx500(Context ctx) {
    String x500 = ctx.pathParam("x500");
    Owner owner;

    try {
      owner = ownerCollection.find(eq("x500", x500)).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested owner x500 wasn't a legal Mongo Object.");
    }
    if (owner == null) {
      throw new NotFoundResponse("The requested owner was not found.");
    } else {
      ctx.json(owner);
    }
  }


  public void getOwners(Context ctx) {
    ctx.json(ownerCollection.find(new Document()).into(new ArrayList<>()));
  }

  public void addOwner(Context ctx) {

    Owner newOwner = ctx.bodyValidator(Owner.class)
    .check((owner) -> owner.name.length() >= 2 && owner.name.length() <= 300).get();

    ownerCollection.insertOne(newOwner);
    ctx.status(201);
    ctx.json(ImmutableMap.of("id", newOwner._id));
  }


  public String getOwnerIDByx500(String x500) {
    Owner owner;

    try {
      owner = ownerCollection.find(eq("x500", x500)).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested owner x500 wasn't a legal Mongo Object.");
    }

    if(owner== null) {
      throw new NotFoundResponse("The requested ownerID was not found");
    } else {
      return owner._id;
    }
  }

  public String getOwnerIDBySubject(String subject) {
    Owner owner;

    try {
      owner = ownerCollection.find(eq("sub", subject)).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested owner subject wasn't a legal Mongo Object.");
    }

    if(owner== null) {
      throw new NotFoundResponse("The requested owner ID was not found.");
    } else {
      return owner._id;
    }
  }
}
