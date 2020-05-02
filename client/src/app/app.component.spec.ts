import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppModule } from './app.module';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './authentication/auth.service';
import { MockAuthService, professorJohnson } from 'src/testing/auth.service.mock';

describe('AppComponent:', () => {
  let fixture;
  let app;

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
        { provide: AuthService, useValue: new MockAuthService() },
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    app.ngOnInit();
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
  })
});
