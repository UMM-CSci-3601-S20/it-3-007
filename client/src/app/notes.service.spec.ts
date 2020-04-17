import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { Note } from './note';
import { NotesService } from './notes.service';

describe('Note service:', () => {

  const yogiId = 'yogi_id';
  const yogiNotes = [
    {
      _id: 'y1',
      owner_id: yogiId,
      body: 'You can observe a lot by watching.',
      posted: true,
    },
    {
      _id: 'y2',
      owner_id: yogiId,
      body: 'Nobody goes there anymore. It\'s too crowded.',
      posted: true,
    },
  ];

  const testNotes: Note[] = [
    {
      _id: 'first_id',
      owner_id: 'rachel_id',
      body: 'This is the first note',
      posted: true,
    },
    {
      _id: 'second_id',
      owner_id: 'joe_id',
      body: 'This is the second note',
      posted: true,
    },
    {
      _id: 'third_id',
      owner_id: 'james_id',
      body: 'This is the third note',
      posted: true,
    },
    ...yogiNotes,
  ];

  let noteService: NotesService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    noteService = new NotesService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('The getOwnerNotes() method:', () => {
    it('gets all the notes in the database when given no filters', async(() => {
      noteService.getOwnerNotes().subscribe(notes => {
        expect(notes).toEqual(testNotes);
      });

      const req = httpTestingController.expectOne({ method: 'GET' });
      expect(req.request.url).toEqual(noteService.noteUrl);
      req.flush(testNotes);
    }));

    it('filters by owner', async(() => {
      noteService.getOwnerNotes({ owner_id: yogiId }).subscribe(notes => {
        expect(notes).toEqual(yogiNotes);
      });

      const req = httpTestingController.expectOne({ method: 'GET' });
      expect(req.request.url).toEqual(noteService.noteUrl);
      expect(req.request.params.get('owner_id')).toEqual(yogiId);
      req.flush(yogiNotes);
    }));

    it('filters by posted status', async(() => {
      noteService.getOwnerNotes({ posted: false }).subscribe(notes => {
        expect(notes).toEqual([]);
      });

      const req = httpTestingController.expectOne({ method: 'GET' });
      expect(req.request.url).toEqual(noteService.noteUrl);
      expect(req.request.params.get('posted')).toEqual('false');
      req.flush([]);
    }));
  });

  describe('The addNote() method:', () => {
    it('sends the newly-created note to the server and returns its id', async(() => {

      noteService.addNote(testNotes[1]).subscribe(id => {
        expect(id).toBe('test_id');
      });

      const req = httpTestingController.expectOne({ method: 'POST' });

      expect(req.request.url).toEqual(noteService.addNoteUrl);
      expect(req.request.body).toEqual(testNotes[1]);

      req.flush({ id: 'test_id' });
    }));
  });

  describe('The deleteNote() method:', () => {
    it('sends a delete request', async(() => {
      const id = 'Hi! I\'m an ID';
      // For unknown reasons, we need to provide an empty subscribe block.
      // (Otherwise httpTestingController isn't happy.)
      noteService.deleteNote(id).subscribe(() => {});

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      expect(req.request.url).toEqual(`${noteService.noteUrl}/${encodeURI(id)}`);
      req.flush({ id });
    }));

    it('returns true when the note to be deleted exists', async(() => {
      const id = 'This is totes a legit ID';
      noteService.deleteNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(true);
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush({ id });
    }));

    it('returns false when the note to be deleted doesn\'t exist', async(() => {
      const id = 'This ID is bogus, man';
      noteService.deleteNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(false);
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush(null, { status: 404, statusText: 'The requested note was not found' });
    }));

    it('passes other HTTP errors through transparently', async(() => {
      // We don't want deleteNote to catch *all* HTTP errors, only 404 errors.
      const id = 'Good Evening!';
      noteService.deleteNote(id).subscribe({
        next: () => { fail('This Observable should throw.'); },
        error: error => { expect(error.status).toEqual(500); },
        complete: () => { fail('This Observable should throw.'); },
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush(null, { status: 500, statusText: 'There was an internal server error!' });
    }));
  });

  describe('The permanentlyDeleteNote() method:', () => {
    it('sends a delete request', async(() => {
      const id = 'Hi! I\'m an ID';
      // For unknown reasons, we need to provide an empty subscribe block.
      // (Otherwise httpTestingController isn't happy.)
      noteService.permanentlyDeleteNote(id).subscribe(() => {});

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      expect(req.request.url).toEqual(`${noteService.deleteNoteUrl}/${encodeURI(id)}`);
      req.flush({ id });
    }));

    it('returns true when the note to be deleted exists', async(() => {
      const id = 'This is totes a legit ID';
      noteService.permanentlyDeleteNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(true);
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush({ id });
    }));

    it('returns false when the note to be deleted doesn\'t exist', async(() => {
      const id = 'This ID is bogus, man';
      noteService.permanentlyDeleteNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(false);
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush(null, { status: 404, statusText: 'The requested note was not found' });
    }));

    it('passes other HTTP errors through transparently', async(() => {
      const id = 'Good Evening!';
      noteService.permanentlyDeleteNote(id).subscribe({
        next: () => { fail('This Observable should throw.'); },
        error: error => { expect(error.status).toEqual(500); },
        complete: () => { fail('This Observable should throw.'); },
      });

      const req = httpTestingController.expectOne({ method: 'DELETE' });
      req.flush(null, { status: 500, statusText: 'There was an internal server error!' });
    }));
  });

  describe('The restoreNote() method:', () => {
    it('sends a post request', async(() => {
      const id = 'Hi! I\'m an ID';
      // For unknown reasons, we need to provide an empty subscribe block.
      // (Otherwise httpTestingController isn't happy.)
      noteService.restoreNote(id).subscribe(() => {});

      const req = httpTestingController.expectOne({ method: 'POST' });
      expect(req.request.url).toEqual(`${noteService.noteUrl}/${encodeURI(id)}`);
      req.flush({ id });
    }));

    it('returns true when the note to be deleted exists', async(() => {
      const id = 'This is totes a legit ID';
      noteService.restoreNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(true);
      });

      const req = httpTestingController.expectOne({ method: 'POST' });
      req.flush({ id });
    }));

    it('returns false when the note to be deleted doesn\'t exist', async(() => {
      const id = 'This ID is bogus, man';
      noteService.restoreNote(id).subscribe(wasAnythingDeleted => {
        expect(wasAnythingDeleted).toBe(false);
      });

      const req = httpTestingController.expectOne({ method: 'POST' });
      req.flush(null, { status: 404, statusText: 'The requested note was not found' });
    }));

    it('passes other HTTP errors through transparently', async(() => {
      const id = 'Good Evening!';
      noteService.restoreNote(id).subscribe({
        next: () => { fail('This Observable should throw.'); },
        error: error => { expect(error.status).toEqual(500); },
        complete: () => { fail('This Observable should throw.'); },
      });

      const req = httpTestingController.expectOne({ method: 'POST' });
      req.flush(null, { status: 500, statusText: 'There was an internal server error!' });
    }));
  });

  describe('The editNote() method:', () => {
    it('sends a POST request to the right endpoint', async(() => {
      const newNote = {
        body: 'We sailed on the Sloop John B / My grandfather and me'
      } as Note;

      const testId = 'testid';

      noteService.editNote(newNote, testId).subscribe(id => {
        expect(id).toEqual(testId);
      });

      const req = httpTestingController.expectOne({ method: 'POST' });

      expect(req.request.url).toEqual(`${noteService.noteUrl}/edit/${testId}`);
      expect(req.request.body).toEqual(newNote);

      req.flush({id: testId});
    }));
  });
});
