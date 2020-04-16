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

  // describe('The deleteNote() method:', () => {
  //   it('calls DELETE on api/notes/:id', async () => {
  //     const id = 'Hi! I\'m an ID';
  //     // We need an empty `subscribe` block to make sure the delete request
  //     // is actually sent.
  //     noteService.deleteNote(id).subscribe(result => {});

  //     const req = httpTestingController.expectOne(noteService.noteUrl + '/' + encodeURI(id));
  //     expect(req.request.method).toEqual('DELETE');
  //     req.flush('deleted');
  //   });

  //   it('returns true if the server says "deleted"', () => {
  //     const id = 'This is totes a legit ID';
  //     noteService.deleteNote(id).subscribe(
  //       wasAnythingDeleted => expect(wasAnythingDeleted).toBe(true)
  //     );

  //     const req = httpTestingController.expectOne(noteService.noteUrl + '/' + encodeURI(id));
  //     req.flush('deleted');
  //   });

  //   it('returns false if the server says "nothing deleted"', () => {
  //     const id = 'This ID is bogus, man';
  //     noteService.deleteNote(id).subscribe(
  //       wasAnythingDeleted => expect(wasAnythingDeleted).toBe(false)
  //     );

  //     const req = httpTestingController.expectOne(noteService.noteUrl + '/' + encodeURI(id));
  //     req.flush('nothing deleted');
  //   });
  // });

  // describe('The editNote() method:', () => {
  //   it('calls api/notes/edit/:id', () => {
  //     const newNote = {
  //       body: 'We sailed on the Sloop John B / My grandfather and me'
  //     } as Note;

  //     noteService.editNote(newNote, 'testid').subscribe(
  //       id => expect(id).toBe('testid')
  //     );

  //     const req = httpTestingController.expectOne(noteService.noteUrl + '/edit/testid');

  //     expect(req.request.method).toEqual('POST');
  //     expect(req.request.body).toEqual(newNote);

  //     req.flush({id: 'testid'});
  //   });
  // });
});
