import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { OwnerComponent } from './owner.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MockNoteService } from 'src/testing/note.service.mock';
import { MockOwnerService } from 'src/testing/owner.service.mock';
import { NotesService } from '../notes.service';
import { AuthService } from '../authentication/auth.service';
import { OwnerService } from '../owner.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MockAuthService, professorJohnson } from 'src/testing/auth.service.mock';



describe('OwnerComponent:', () => {

  let component: OwnerComponent;
  let fixture: ComponentFixture<OwnerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockNoteService = new MockNoteService();
  const mockOwnerService = new MockOwnerService();
  const mockAuthService = new MockAuthService();
  const activatedRoute = new ActivatedRouteStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule, RouterTestingModule, MatSnackBarModule],
      declarations: [OwnerComponent], // declare the test component
      providers: [
        { provide: NotesService, useValue: mockNoteService },
        { provide: OwnerService, useValue: mockOwnerService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    fixture = TestBed.createComponent(OwnerComponent);

    component = fixture.componentInstance; // BannerComponent test instance

    component.ngOnInit();
    component.ngAfterViewInit();

    // query for the link (<a> tag) by CSS element selector
    de = fixture.debugElement.query(By.css('#generate-pdf-button'));
    el = de.nativeElement;
  }));

  describe('The ngOnInit() method:', () => {
    it('gets the owner', async(() => {
      component.x500.subscribe(x500 => {
        expect(x500).toEqual(professorJohnson.nickname);
      });
      component.owner.subscribe(owner => {
        expect(owner._id).toEqual('rachel_id');
      });
    }));
  });

  describe('The retrieveNotes() method:', () => {
    it('gets all of the owner\'s posted notes from the server', async(() => {
      component.notes = undefined;
      component.retrieveNotes();

      const notesThatShouldBeDisplayed = MockNoteService.testNotes
        .filter(note => note.owner_id === 'rachel_id' && note.status === 'active');

      component.notes.subscribe(notes => {
        expect(notes).toEqual(notesThatShouldBeDisplayed);
      });
    }));
  });

  describe('The deleteNote() method:', () => {
    it('calls notesService.deleteNote', () => {
      const id = 'Hey everyone, I\'m an ID!';
      spyOn(mockNoteService, 'deleteNote').and.returnValue(of(true));

      component.deleteNote(id);
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith(id);
    });
  });

  describe('Making the sign:', () => {
    const pretendPdfUrl = 'pretend url';

    beforeEach(() => {
      spyOn(mockOwnerService, 'getSignUrl').and.returnValue(pretendPdfUrl);

      spyOn(component, 'openExternalLink');
    });

    describe('The openPDF() method:', () => {
      it('gets a pdf document from OwnerService', async(() => {
        component.openPDF();

        fixture.whenStable().then(() => {
          expect(mockOwnerService.getSignUrl).toHaveBeenCalledTimes(1);
        });
      }));

      it('opens that pdf', async(() => {
        component.openPDF();

        fixture.whenStable().then(() => {
          expect(component.openExternalLink)
            .toHaveBeenCalledWith(pretendPdfUrl);
        });
      }));
    });

    describe('The GENERATE SIGN button:', () => {
      it('gets a pdf document from OwnerService', async(() => {
        el.click();

        fixture.whenStable().then(() => {
          expect(mockOwnerService.getSignUrl).toHaveBeenCalledTimes(1);
        });
      }));

      it('opens that pdf', async(() => {
        el.click();

        fixture.whenStable().then(() => {
          expect(component.openExternalLink)
            .toHaveBeenCalledWith(pretendPdfUrl);
        });
      }));
    });
  });
});
