import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './authentication/auth.service';
import { MockAuthService, professorJohnson } from 'src/testing/auth.service.mock';
import { OwnerService } from './owner.service';
import { MockOwnerService } from 'src/testing/owner.service.mock';
import { By } from '@angular/platform-browser';


describe('AppComponent:', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let generateSignButton: HTMLElement;
  const mockOwnerService = new MockOwnerService();
  const mockAuthService = new MockAuthService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatListModule,
        MatMenuModule,
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OwnerService, useValue: mockOwnerService },
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    app.ngOnInit();
  }));

  beforeEach(async(() => {
    // Open the share menu.
    fixture.detectChanges();
    generateSignButton = fixture.debugElement
      .query(By.css('.share-button'))
      .nativeElement
      .click();

    fixture.detectChanges();
    generateSignButton = fixture.debugElement
      .query(By.css('#generate-pdf-button'))
      .nativeElement;
  }));

  it('creates the app', () => {
    expect(app).toBeTruthy();
  });

  it('has "DoorBoard" as its title', () => {
    expect(app.title).toEqual('DoorBoard');
  });

  describe('The getViewerLink() method:', () =>{
    it('gives the right url for the viewer page', () => {
      expect(app.getViewerLink()).toEqual(`/${professorJohnson.nickname}`);
    });
  });

  describe('Making the sign:', () => {
    const pretendPdfUrl = 'pretend url';

    beforeEach(() => {
      spyOn(mockOwnerService, 'getSignUrl').and.returnValue(pretendPdfUrl);

      spyOn(app, 'openExternalLink');
    });

    describe('The openPDF() method:', () => {
      it('gets a pdf document from OwnerService', async(() => {
        app.openPDF();

        fixture.whenStable().then(() => {
          expect(mockOwnerService.getSignUrl).toHaveBeenCalledTimes(1);
        });
      }));

      it('opens that pdf', async(() => {
        app.openPDF();

        fixture.whenStable().then(() => {
          expect(app.openExternalLink)
            .toHaveBeenCalledWith(pretendPdfUrl);
        });
      }));
    });

    describe('The GENERATE SIGN button:', () => {
      it('gets a pdf document from OwnerService', async(() => {
        generateSignButton.click();

        fixture.whenStable().then(() => {
          expect(mockOwnerService.getSignUrl).toHaveBeenCalledTimes(1);
        });
      }));

      it('opens that pdf', async(() => {
        generateSignButton.click();

        fixture.whenStable().then(() => {
          expect(app.openExternalLink)
            .toHaveBeenCalledWith(pretendPdfUrl);
        });
      }));
    });
  });
});
