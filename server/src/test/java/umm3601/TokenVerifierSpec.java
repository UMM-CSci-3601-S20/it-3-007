package umm3601;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.when;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;

class TokenVerifierSpec {
  // Here's the data stored inside that test token:
  // The 'kid' (key ID) claim. (This goes in the token's header.)
  public static String testKid = "foo";
  // The 'sub' (subject) claim.
  public static String testSub = "1234567890";
  // The 'iat' (issued-at-time) claim. (In seconds since 1970.)
  // (This date is in late December 2019.)
  public static long testIat = 1577842200L;
  // The 'exp' (expiration) claim. (In seconds since 1970.)
  // (This date is around the year 8000 CE.)
  public static long testExp = 200000000000L;
  // The 'iss' (issuer) claim.
  public static String testIss = "https://doorbboard-dev.auth0.com/";

  // These keys are just for testing.
  // Please don't use any of them in production ;)
  // (Generated using the wonderful
  // https://www.devglan.com/online-tools/rsa-encryption-decryption
  // website, which is the only tool I could find that outputs the private
  // key in PKCS#8 format.)
  public String testPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoHqSpUC8PvpHXyIrIC3r50Qi74J0djAC5absVz07VB0wUT88uNubcI3Jsnx3tWGVFpwerZv1PjSf3ouBEMSkAPx0s6ACIgGroIYjf0d1M8dC7sndSPZBnOfcAhhOXv8ELZouUeD3Bc+aRUMjT7n9E7RhjJhO4MSvt/ajiw3dKejr1WOxcEmsz511hjQzSjbbIzqPc3yxqt0IU5akbWXoNxzOqvPxaa5x7SDN7LyBxxYutwmCVgehG4gAvyQAEd7rkOlACgyQbMj4Zp+Wa+STTeB7L37HMuGchgdJQ7Z4LPyzPI4mM64Ooob0F3pJYge/gbLoq2rFVliKSwF4fWNbhQIDAQAB";
  public String testPrivateKey = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCgepKlQLw++kdfIisgLevnRCLvgnR2MALlpuxXPTtUHTBRPzy425twjcmyfHe1YZUWnB6tm/U+NJ/ei4EQxKQA/HSzoAIiAaughiN/R3Uzx0Luyd1I9kGc59wCGE5e/wQtmi5R4PcFz5pFQyNPuf0TtGGMmE7gxK+39qOLDd0p6OvVY7FwSazPnXWGNDNKNtsjOo9zfLGq3QhTlqRtZeg3HM6q8/FprnHtIM3svIHHFi63CYJWB6EbiAC/JAAR3uuQ6UAKDJBsyPhmn5Zr5JNN4Hsvfscy4ZyGB0lDtngs/LM8jiYzrg6ihvQXekliB7+BsuirasVWWIpLAXh9Y1uFAgMBAAECggEBAIyIysNM3Y2JP9df5MRZcq0kTjPQ2oxlnyPd+jqrtLkElruP1W1NY+I9SNS1i1+cBSO3tGX0nd/L1fTd1jkI+1ahvtFO3o9JRzNcRNnBijG93i+fN9odTXhK07BB+N/YE6Cb1NR/XdQI6eCd2t6G0cnfvU2SVAEiPX+szauIiJWZqnWWWCOVhB/nk7N3W7wLwLUmmDxRzZVE229sEzXRsf0n1HncL9qwK1yxpAhlsBmZ3e0kS4+CQ40nU9fZTYqlkRajWsIeRHoaBemg9FBcsB6dp64YE8wlyJfllVxMnwod1P2Tt+/Hi1CsGm+dfGXiSeVccd/sLFAm9/QKAFQ9sgECgYEA9wPjtKUikqZHiVPGkZew0tXFIKh/BbcKBZgDVtqD9BYZgRIcUiDACucmgoETdj3dIz4+wgRhYlABcS69e20SfF8EKaox63+DdEsK0OE216GpmtOfWB4Ak6j0ur7sv9eKDTSRiXntqYqWuzqPiPs5Xd3RVbYi3lqbzazbS81xpj0CgYEAplDjxXA9Q3W4LnMKARowZ4ErJkTqW6GGbcRR/SH0i8r4O9GT2ZADtvhuVkuShqaCzn3ZahajF2brHXLwF9wqu0p/TyjcHRMajUxLoLWjYeljKxnbklGkfiIF3YP+e39a9UVlf/LHDdgZ/qUkgbmHTI1fJqLuENJmamxTMFW+JukCgYEArgjBf97xEt2wfSLXPnDflkwizTWp+P7TQsmtYJ4oZerEIVn/NiX46DWfvkbuzVoc2d3bHZs0ea3gtju2KKXaZmITbr+I2GFI3sCYaD6lAxvVgU4kcFMDGQXrFz+5UhisHU2yVGfheJg6RsOlqV9HNck42eivfHXeW/SztR6UOgkCgYBlDYkXkdbngkNilatieBMpEKazHfR3sHEJiNt4PoVj2vNxBSocaxCWv+PqswhYoBuic30CpLZ7paD9x7RyCug73Ev2QRFc6Rqc99qLz1FyUGhc690pzklwCiQeL/EUAJG3rW66izy/AKrqulSwLZYzwUIrK5wSxIRN7XuuRqq+4QKBgHh5vlnu2vp3Fo7A8/6/Knb0bD8o9cl5LMZRrwvbd6ZdiW9h3sL349AXfp/ip3nPi9Wt6wbl+8XF2HonMa6KGJlPDZRVtyb2ZcBHQn/3DR2FHKEZyitKV4sGUXBjTUACfEMRjNIxCuPnMpw2A24vTeL0BS9ZZXkIzBqkbw+r/Hoy";

  public String wrongPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj4Ip4vG92R4WBkBp+5/Ri87q5EDBeiOouhA1+YH+bX3XEAdlsNKmXg/EBrth7l6h5R4Rqf09JUatOWTbeuuJ2AWgzBBX28g4sYp9bjdepAO6T6qXAtp1uLLVJzOblp/7FCx+obHeVMXbwXBBqz41D0tUgNyGa5EOrEuLoQRQ3hf6xTezdVLgcHF1aLrw9GARsEi4/w56a9WJ1W8ijUIHCi/cXNMlF0xpvI7FLxDZMzL7gUjCoqWHNqWFkSCtVNe7BgHiTqU0i001UNWFA/S2rg5mEH/M4G8SXJyVP95W2PIZAmqlrstpqY9XsxyO9uY3dkCiHuvg18P3K7XpWuX0zQIDAQAB";
  public String wrongPrivateKey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCPgini8b3ZHhYGQGn7n9GLzurkQMF6I6i6EDX5gf5tfdcQB2Ww0qZeD8QGu2HuXqHlHhGp/T0lRq05ZNt664nYBaDMEFfbyDixin1uN16kA7pPqpcC2nW4stUnM5uWn/sULH6hsd5UxdvBcEGrPjUPS1SA3IZrkQ6sS4uhBFDeF/rFN7N1UuBwcXVouvD0YBGwSLj/Dnpr1YnVbyKNQgcKL9xc0yUXTGm8jsUvENkzMvuBSMKipYc2pYWRIK1U17sGAeJOpTSLTTVQ1YUD9LauDmYQf8zgbxJcnJU/3lbY8hkCaqWuy2mpj1ezHI725jd2QKIe6+DXw/crtela5fTNAgMBAAECggEAeysEODuy7X3c+VCfpc7tUkktYOoTJHkmf0saiCMB84dl5ePza2fgUirF2+FHlAa0fKjqEDPBHxUh53igx0cQ788kyv/b6E5YGkj6jnYHTE3GwklvgottLjCOsS6iAw0buZzWsoCuiaOnkMaAFjE16QKGbHLZC8lcBpRwKqpBnds4a5xy5f7DrPD6d1Lh7L8GpqVqFiP4bI/FKopf6kAVfp2Mxws5m2SKjeqbCZp3e9F1re1oXrn4cwfBrAmobVGFhAXMWWgk+n2ljPej+zXruwCeSuSbOLeaKu2OgJC2WBuxBRuWkUMHan9aZ8CwSajaVy6/K5Y6owdHTxIroCVHAQKBgQDl9BtpsNASniqSD44wAgrdpV0ZqEhNAsOFlJC9yX3rIkRVhUBKlmq82PIdjs/d1G3fEz2Se1Pe01DsTYWRugnxBVT4qHKJpFH3CoygGgVqkXxcdmn1QvhR4YgimiZ6ljQnXR/Igh8GJGVSe0nYod4A9TajsTe2HFntqsZ6tYShyQKBgQCfw288whBb8yun7PB9ObFE6UJGe2ANqIhOMSRA6oGpXYwnK++fq76oeOgXpBaYc5egv0wUK/gFB3d1T1npzNvnQE4r9K2F3HJp4c4wA9mjWKCh0R/TxI45K0UfKtZgiQEdltEOH8bkbGkrc+wXBuQAwzD/JWetXbjawq9yfrVc5QKBgDOlOo7nPiQgT9FUGwwfOU+Edz9u8yYQq9cRgdyOJ3Cq1owajFD0LW7SjrYiv/7DWhXS3W5Lso+GCFO6KXiMPvVZzDa4pljRhfMk9GZ00aiYmkSt96g07U5+h7O1yVSY7Ye1u5Ct4MfhXrxColg8Kn8uk6H6CFgnT+83/rHKmMo5AoGAR/cP122PUuwBoT3wwmfHe0QbT4ZpqR1ecOJf80HvMCxsYoS/BsylMFxuJ6AJcZi4F3e0PG3l5dYMMHKTDObzs4Ja9B/ePisj+p/1cdl6IsNccCe0T379lbDxDO4N7SQptXtnJhaYT/KpmSI5mdHHyLQkEPp3bjeGejwyLb/30CUCgYEAtWi9qpKSv6VjXaDJNo1DEdPLCwswUcPUCqv+7cDB3P9pOxnf9ah1rP9dROD1GeNX0NayBhNH/pfqkxrzNbiiGItbWATfzR3fc4ZFgwc6z6zqWEBUFDxHQol6WVPQtXZa9fXelpX8o8MWWp815x9RzzOgCmp2lIMKATLb8fnLWSg=";

  @Mock(name = "jwkProvider")
  public JwkProvider mockJwkProvider;

  @InjectMocks
  public TokenVerifier verifier;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.initMocks(this);

    Jwk mockJwk = Mockito.mock(Jwk.class);
    try {
      when(mockJwkProvider.get(testKid)).thenReturn(mockJwk);
      when(mockJwk.getPublicKey()).thenReturn(publicKeyFromBase64String(testPublicKey));
    } catch (JwkException e) {
      // We're mocking these calls, so they should never throw.
      // (But the compiler doesn't know that, so we have to put a "catch" to
      // make it happy.)
      throw new RuntimeException(e);
    }
  }

  private Context contextWithGoodToken() {
    MockHttpServletRequest mockRequest = new MockHttpServletRequest();
    MockHttpServletResponse mockResponse = new MockHttpServletResponse();

    Algorithm algorithm = Algorithm.RSA256(
      publicKeyFromBase64String(testPublicKey),
      privateKeyFromBase64String(testPrivateKey));
    String encodedTestToken = JWT.create()
      .withKeyId(testKid)
      .withSubject(testSub)
      // Remember to convert to milliseconds!
      .withIssuedAt(new Date(testIat * 1000))
      .withExpiresAt(new Date(testExp * 1000))
      .withIssuer(testIss)
      .sign(algorithm);

    mockRequest.setHeader(
      "Authorization",
      String.format("Bearer %s", encodedTestToken));

    return ContextUtil.init(
      mockRequest,
      mockResponse,
      "api/this/is/not/a/real/route");
  }

  private Context contextWithoutToken() {
    return ContextUtil.init(
      new MockHttpServletRequest(),
      new MockHttpServletResponse(),
      "api/this/is/not/a/real/route");
  }

  private Context contextWithBadToken() {
    MockHttpServletRequest mockRequest = new MockHttpServletRequest();
    MockHttpServletResponse mockResponse = new MockHttpServletResponse();

    Algorithm algorithm = Algorithm.RSA256(
      publicKeyFromBase64String(wrongPublicKey),
      privateKeyFromBase64String(wrongPrivateKey));
    String encodedTestToken = JWT.create()
      .withKeyId(testKid)
      .withSubject(testSub)
      // Remember to convert to milliseconds!
      .withIssuedAt(new Date(testIat * 1000))
      .withExpiresAt(new Date(testExp * 1000))
      .withIssuer(testIss)
      .sign(algorithm);

    mockRequest.setHeader(
      "Authorization",
      String.format("Bearer %s", encodedTestToken));

    return ContextUtil.init(
      mockRequest,
      mockResponse,
      "api/this/is/not/a/real/route");
  }

  private Context contextWithExpiredToken() {
    MockHttpServletRequest mockRequest = new MockHttpServletRequest();
    MockHttpServletResponse mockResponse = new MockHttpServletResponse();

    Algorithm algorithm = Algorithm.RSA256(
      publicKeyFromBase64String(testPublicKey),
      privateKeyFromBase64String(testPrivateKey));
    String encodedTestToken = JWT.create()
      .withKeyId(testKid)
      .withSubject(testSub)
      // This token expired in January 1970.
      .withIssuedAt(new Date(0 * 1000))
      .withExpiresAt(new Date(1 * 1000))
      .withIssuer(testIss)
      .sign(algorithm);

    mockRequest.setHeader(
      "Authorization",
      String.format("Bearer %s", encodedTestToken));

    return ContextUtil.init(
      mockRequest,
      mockResponse,
      "api/this/is/not/a/real/route");
  }

  // We're going to make a token and validate it as quickly as possible, to
  // try to catch any rounding errors in the TokenVerifier.
  private Context contextWithTokenIssuedRightThisSecond() {
    MockHttpServletRequest mockRequest = new MockHttpServletRequest();
    MockHttpServletResponse mockResponse = new MockHttpServletResponse();

    Algorithm algorithm = Algorithm.RSA256(
      publicKeyFromBase64String(testPublicKey),
      privateKeyFromBase64String(testPrivateKey));
    String encodedTestToken = JWT.create()
      .withKeyId(testKid)
      .withSubject(testSub)
      // Fudge it a few hundred milliseconds forward just to account for the
      // time it takes to run a test.
      .withIssuedAt(new Date(System.currentTimeMillis() + 900L))
      .withExpiresAt(new Date(testExp * 1000))
      .withIssuer(testIss)
      .sign(algorithm);

    mockRequest.setHeader(
      "Authorization",
      String.format("Bearer %s", encodedTestToken));

    return ContextUtil.init(
      mockRequest,
      mockResponse,
      "api/this/is/not/a/real/route");
  }

  private Context contextWithTokenWithInvalidSyntax() {
    MockHttpServletRequest mockRequest = new MockHttpServletRequest();
    MockHttpServletResponse mockResponse = new MockHttpServletResponse();

    Algorithm algorithm = Algorithm.RSA256(
      publicKeyFromBase64String(testPublicKey),
      privateKeyFromBase64String(testPrivateKey));
    String encodedTestToken = JWT.create()
      .withKeyId(testKid)
      .withSubject(testSub)
      // Remember to convert to milliseconds!
      .withIssuedAt(new Date(testIat * 1000))
      .withExpiresAt(new Date(testExp * 1000))
      .withIssuer(testIss)
      .sign(algorithm);

    mockRequest.setHeader(
      "Authorization",
      String.format("Bearer", encodedTestToken)); // dropped the space after bearer

    return ContextUtil.init(
      mockRequest,
      mockResponse,
      "api/this/is/not/a/real/route");
  }

  @Test
  public void verifyTheGoodToken() {
    assertTrue(verifier.verifyToken(contextWithGoodToken()));
  }

  // Be careful with this test; it's non-deterministic.
  //
  // Its job is to catch a rounding error where issuing a token and checking
  // it within the same second fails.
  //
  // But, in order to test that behavior, the test has to run really really
  // fast.
  //
  // Depending on how fast or slow your computer is (I'm looking at you,
  // GitHub Actions) you may get false positives. (That is, the test may
  // succeed spuriously.)
  //
  // This is not in any way ideal.
  //
  // However, in order to test this behavior in a deterministic way,
  // we would have to do some heavy-duty mocking of the Date class, probably
  // by installing a custom class loader.
  //
  // Which is more trouble than it's worth.
  @Test
  public void verifyTheTokenIssuedRightThisSecond() {
    for (int i = 0; i < 100; i++) {
      assertTrue(
        verifier.verifyToken(contextWithTokenIssuedRightThisSecond()));
    }
  }

  @Test
  public void rejectRequestsWithoutTokens() {
    Context ctx = contextWithoutToken();
    assertFalse(verifier.verifyToken(ctx));
    assertEquals(((MockHttpServletResponse)ctx.res).getStatus(), 400);
  }

  @Test
  public void rejectTheBadToken() {
    Context ctx = contextWithBadToken();
    assertFalse(verifier.verifyToken(ctx));
    assertEquals(((MockHttpServletResponse)ctx.res).getStatus(), 400);
  }

  @Test
  public void rejectTheExpiredToken() {
    Context ctx = contextWithExpiredToken();
    assertFalse(verifier.verifyToken(ctx));
    assertEquals(((MockHttpServletResponse)ctx.res).getStatus(), 400);
  }

  // This method is a variant of https://stackoverflow.com/a/24502245
  private RSAPublicKey publicKeyFromBase64String(String keyString) {
    byte[] publicKeyBytes = Base64.getDecoder().decode(keyString);
    X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
    KeyFactory keyFactory;
    try {
      keyFactory = KeyFactory.getInstance("RSA");
    } catch (NoSuchAlgorithmException e) {
      fail("Couldn't get the 'RSA' algorithm.");
      return null;
    }
    PublicKey publicKey;
    try {
      publicKey = keyFactory.generatePublic(keySpec);
    } catch (InvalidKeySpecException e) {
      fail("Couldn't read the public key from the string.");
      return null;
    }
    return (RSAPublicKey)publicKey;
  }

  // Also from StackOverflow: https://stackoverflow.com/a/20748064
  private RSAPrivateKey privateKeyFromBase64String(String keyString) {
    byte[] privateKeyBytes = Base64.getDecoder().decode(keyString);

    PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
    KeyFactory keyFactory;
    try {
      keyFactory = KeyFactory.getInstance("RSA");
    } catch (NoSuchAlgorithmException e) {
      fail("Couldn't get the 'RSA' algorithm.");
      return null;
    }
    PrivateKey privateKey;
    try {
      privateKey = keyFactory.generatePrivate(keySpec);
    } catch (InvalidKeySpecException e) {
      fail("Couldn't read the private key from the string.");
      return null;
    }
    return (RSAPrivateKey)privateKey;
  }

  @Test
  public void subjectIsGottenFromGoodToken() {
    Context ctx = contextWithGoodToken();

    assertEquals("1234567890", verifier.getSubjectFromToken(ctx));
  }

  // While this test is currently passing in the spec file, it is failing in the gradle testing
  @Test
  public void errorIsThrownWhenDecodingFails() {
    Context ctx = contextWithTokenWithInvalidSyntax();
    verifier.getSubjectFromToken(ctx);
    assertEquals(412 , ctx.status()); // should throw 412 if token cannot be decoded
  }
}
