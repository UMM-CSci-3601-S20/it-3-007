package umm3601;

import java.security.interfaces.RSAPublicKey;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.github.kevinsawicki.http.HttpRequest;

import io.javalin.http.Context;

public class TokenVerifier {

  private JwkProvider provider;

  public static final String AUTH0_TENANT = "https://doorbboard-dev.auth0.com/";

  /**
   * This constructor makes a TokenVerifier for production use. (If you don't
   * need to mock TokenVerifier's dependencies, use this constructor.)
   */
  public TokenVerifier() {
    this(new UrlJwkProvider(AUTH0_TENANT));
  }

  /**
   * This constructor is provided in case you need to inject certain
   * dependencies into TokenVerifier. (You might use it to mock certain
   * functionality for testing, for example.)
   *
   * @param provider Where to look for the public keys used to validate tokens.
   */
  TokenVerifier(JwkProvider provider) {
    this.provider = provider;
  }

  // See:
  // https://community.auth0.com/t/verify-jwt-token-received-from-auth0/35581/4
  public boolean verifyToken(Context ctx) {
    String authorization = ctx.header("Authorization");
    if (authorization == null) {
      ctx.status(400);
      return false;
    }

    String token = authorization.replace("Bearer ", "");
    try {
      DecodedJWT jwt = JWT.decode(token);
      Jwk jwk = provider.get(jwt.getKeyId());

      Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

      JWTVerifier verifier = JWT.require(algorithm)
        .withIssuer(AUTH0_TENANT)
        // Allow the issued-at and expiration dates to be off by one
        // one second in either direction. (This should catch any rounding
        // errors where we try to validate a token in the same second that
        // it was made.)
        .acceptLeeway(1L)
        .build();

      jwt = verifier.verify(token);

      return true;

    } catch (JWTVerificationException e) {
      // Invalid signature/claims
      ctx.status(400);
      e.printStackTrace();
    } catch (JwkException e) {
      ctx.status(400);
      e.printStackTrace();
    }

    return false;
  }

  // https://community.auth0.com/t/verify-jwt-token-received-from-auth0/35581/4 never stops being useful
  // gets the subject from a JWT stored in the context
  // This will be used in place of repeated calls to auth0 for userinfo, as the sub is a field in our database that we can use to find user info
  public String getSubjectFromToken(Context ctx) {

    String token = ctx.header("Authorization").replace("Bearer ", ""); // I don't really get this but it's how they got the token above
    String subject = "Soon, I will be something else entirely";

    try {
      DecodedJWT decode = JWT.decode(token);
      subject = decode.getSubject();
    }
    catch ( JWTDecodeException e ) {
      e.printStackTrace();
      ctx.status(412); // putting pre-condition failed here because if the decoding has failed, chances are it's because the context didn't have a proper JWT
    }

    return subject;
  }
}
