package umm3601.signs;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

import com.google.common.collect.ImmutableSet;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import umm3601.Server;

/**
 * This class is in charge of making door signs.
 */
public class SignController {
  // Cobbled together from:
  // https://svn.apache.org/viewvc/pdfbox/trunk/examples/src/main/java/org/apache/pdfbox/examples/pdmodel/HelloWorld.java?revision=1792647&view=markup
  // https://stackoverflow.com/a/17656461

  // All units are in points (pt) unless specified otherwise.

  // We'll use letter-size paper,
  private static final PDRectangle PAGE_SIZE = PDRectangle.LETTER;

  // an eighteen-point sans-serif font, bolded,
  private static final float FONT_SIZE = 18F;
  private static final PDType1Font FONT = PDType1Font.HELVETICA_BOLD;

  // one-and-a-half spaced,
  private static final float LINE_SPACING = FONT_SIZE * 1.5F;

  // with one-inch margins.
  private static final float MARGINS = 72F;


  /**
   * Given a name and an x500, send back a response with mime type
   * `application/pdf`.
   *
   * @param ctx A Javalin context with two query parameters:
   *   - `name`, the full name of the owner
   *   - `x500`, the portion of the owner's email that comes before the @ sign.
   */
  public void getSign(Context ctx) throws IOException {
    if (!ctx.queryParamMap().keySet().containsAll(ImmutableSet.of("name", "x500"))) {
      throw new BadRequestResponse("Bad query parameters provided");
    }

    String name = ctx.queryParam("name");
    String x500 = ctx.queryParam("x500");

    // The lines of text to display on the PDF.
    // (This array must have at least one element.)
    String[] lines = {
      String.format("%s's DoorBoard:", name),
      getViewerUrl(x500),
    };

    // Center the text vertically.
    // The y offset is measured from the bottom of the page
    // (for some reason 🙃)
    // So we have to give the distance from the bottom of the page to the
    // baseline of the first line of text.
    //
    // We won't bother centering the text horizontally, since that's
    // actually much harder.
    float startOfTextX = MARGINS;
    float startOfTextY =
      PAGE_SIZE.getHeight() / 2F
      + lines.length * LINE_SPACING / 2F
      - FONT_SIZE;

    try (PDDocument sign = new PDDocument()) {
      PDPage page = new PDPage(PAGE_SIZE);
      sign.addPage(page);

      try (PDPageContentStream content = new PDPageContentStream(sign, page)) {
        content.beginText();

        content.setFont(FONT, FONT_SIZE);
        content.setLeading(LINE_SPACING);

        content.newLineAtOffset(startOfTextX, startOfTextY);
        content.showText(lines[0]);

        for (String line : Arrays.copyOfRange(lines, 1, lines.length)) {
          content.newLine();
          content.showText(line);
        }

        content.endText();
      }

      ByteArrayOutputStream whereToReceiveBytes = new ByteArrayOutputStream();
      sign.save(whereToReceiveBytes);

      InputStream whereToSendBytes =
        new ByteArrayInputStream(whereToReceiveBytes.toByteArray());

      ctx.contentType("application/pdf");
      ctx.result(whereToSendBytes);
    }
  }

  private String getViewerUrl(String x500) {
    return String.format("%s/%s", Server.BASE_URL, x500);
  }
}
