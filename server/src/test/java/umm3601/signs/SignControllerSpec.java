package umm3601.signs;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;

import com.google.common.collect.ImmutableList;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.util.ContextUtil;

public class SignControllerSpec {
  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  SignController signController;

  @BeforeEach
  public void setupEach() {
    mockReq.resetAll();
    mockRes.resetAll();

    signController = new SignController();
  }

  /**
   * Just check to make sure the controller sends back some PDF, any PDF.
   */
  @Test
  public void gettingAPdf() throws IOException {
    mockReq.setQueryString("name=Rachel%20Johnson&x500=rmjohns");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/sign");

    signController.getSign(ctx);

    assertEquals(200, mockRes.getStatus());
    assertEquals("application/pdf", mockRes.getContentType());

    assertDoesNotThrow(() -> {
      PDDocument.load(ctx.resultStream());
    });
  }

  @Test
  public void usingTheWrongQueryParameters() throws IOException {
    mockReq.setQueryString("name=Rachel%20Johnson");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/sign");

    assertThrows(BadRequestResponse.class, () -> {
      signController.getSign(ctx);
    });
  }
}
