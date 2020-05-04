package umm3601;

import java.security.interfaces.RSAPublicKey;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
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
    } catch (JwkException e) {
      ctx.status(400);
    }

    return false;
  }

  public String getOwnerx500(Context ctx) {

    String authorization = ctx.header("Authorization");

    String userInfo = HttpRequest.get(AUTH0_TENANT + "userinfo").authorization(authorization).body();

    // Pull the x500 out of the body, there's definitely a better way to do this, but idk how
    int startIndex = userInfo.indexOf("\"nickname\":\"");
    String temp = userInfo.substring(startIndex + 12);
    int endIndex = temp.indexOf('"');
    String x500 = temp.substring(0, endIndex);

    return x500;
  }
}
