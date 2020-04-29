import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {OwnerComponent} from './owner.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MockNoteService } from 'src/testing/note.service.mock';
import { MockOwnerService } from 'src/testing/owner.service.mock';
import { NotesService } from '../notes.service';
import { AuthService } from '../authentication/auth.service';
import { OwnerService } from '../owner.service';
import { Note } from '../note';
import { of } from 'rxjs';
import { Router, ActivatedRoute, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockAuthService } from 'src/testing/auth.service.mock';



describe('Component: Owner page:', () => {

  let component: OwnerComponent;
  let fixture: ComponentFixture<OwnerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let mockNoteService: MockNoteService;
  let mockOwnerService: MockOwnerService;
  let authService: MockAuthService;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();

  beforeEach(() => {
    mockNoteService = new MockNoteService();
    mockOwnerService = new MockOwnerService();
    TestBed.configureTestingModule({
      imports: [MatCardModule, RouterTestingModule, MatSnackBar, MatSnackBarModule],
      declarations: [OwnerComponent], // declare the test component
      providers: [
          {provide: NotesService, useValue: mockNoteService},
          {provide: OwnerService, useValue: mockOwnerService},
          {provide: ActivatedRoute, useValue: activatedRoute},
          {provide: AuthService, useValue: authService}
      ]
    });

    fixture = TestBed.createComponent(OwnerComponent);

    component = fixture.componentInstance; // BannerComponent test instance

    // query for the link (<a> tag) by CSS element selector
    de = fixture.debugElement.query(By.css('#generate-pdf-button'));
    el = de.nativeElement;
  });

  describe('The retrieveOwner() method:', () => {
    it('gets the owner Kyle Fluto', () => {
      const spyOnX500 = spyOnProperty(component, 'x500').and.returnValue('fluto006');
      component.retrieveOwner();
      expect(spyOnX500).toHaveBeenCalled();
      expect(component.retrieveOwner).toHaveBeenCalled();
      expect(component.x500).toBe('fluto006');
    });

    it('gets the owner Rachel Johnson', () => {

    });

    it('gets the owner Joe Beaver', () => {

    });

    it('gets the owner James Flegel', () => {

    });

    it('does not get the owner Jack Black', () => {

    });
  });

  describe('The retrieveNotes() method:', () => {
    it('gets all the notes from the server', () => {
      component.retrieveNotes();

      expect(component.notes.length).toBe(3);
    });

    it('contains a note with body \'This is the first note\'', () => {
      component.retrieveNotes();

      expect(component.notes.some((note: Note) => note.body === 'This is the first note')).toBe(true);
    });
  });

  describe('The deleteNote() method:', () => {
    it('calls notesService.deleteNote', () => {
      const id = 'Hey everyone, I\'m an ID!';
      spyOn(MockNoteService.prototype, 'deleteNote').and.returnValue(of(true));

      component.deleteNote(id);
      expect(MockNoteService.prototype.deleteNote).toHaveBeenCalledWith(id);
    });
  });

  describe('The savePDF() method:', () => {
    it('gets a pdf document from PDFService and calls .save() on it', () => {
      component.savePDF();
      expect(mockPDFService.doc.save).toHaveBeenCalled();
    });
  });

  describe('The GENERATE PDF button:', () => {
    it('gets a pdf document from PDFService and calls .save() on it', () => {
      el.click();
      expect(mockPDFService.doc.save).toHaveBeenCalled();
    });
  });
});
