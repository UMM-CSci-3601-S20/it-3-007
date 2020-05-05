import { TestBed, async, ComponentFixture } from "@angular/core/testing";
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TrashComponent } from './trash.component';
import { AuthService } from '../authentication/auth.service';
import { MockAuthService } from 'src/testing/auth.service.mock';
import { NotesService } from '../notes.service';
import { MockNoteService, professorJohnsonsDeletedNote } from 'src/testing/note.service.mock';
import { OwnerService } from '../owner.service';
import { MockOwnerService, professorJohnsonOwnerInfo } from 'src/testing/owner.service.mock';

describe('TrashComponent:', () => {
  let fixture: ComponentFixture<TrashComponent>;
  let trashComponent: TrashComponent;
  const mockNoteService = new MockNoteService();
  const mockOwnerService = new MockOwnerService();
  const mockAuthService = new MockAuthService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatCardModule,
      ],
      declarations: [
        TrashComponent,
      ],
      providers: [
        { provide: NotesService, useValue: mockNoteService },
        { provide: OwnerService, useValue: mockOwnerService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TrashComponent);
    trashComponent = fixture.componentInstance;
    trashComponent.ngOnInit();
  }));

  it('should create', () => {
    expect(trashComponent).toBeTruthy();
  });

  it('should get the appropriate owner and x500', () => {
    expect(trashComponent.x500).toEqual(professorJohnsonOwnerInfo.x500);
    expect(trashComponent.owner).toEqual(professorJohnsonOwnerInfo);
  });

  it('should get all of the deleted notes', () => {
    expect(trashComponent.notes).toEqual([professorJohnsonsDeletedNote]);
  });

  describe('The restoreNote() method:', () => {
    it('calls NoteService.restoreNote()', async(() => {
      spyOn(mockNoteService, 'restoreNote').and.callThrough();
      trashComponent.restoreNote(professorJohnsonsDeletedNote._id);
      fixture.whenStable().then(() => {
        expect(mockNoteService.restoreNote).toHaveBeenCalledTimes(1);
        expect(mockNoteService.restoreNote)
          .toHaveBeenCalledWith(professorJohnsonsDeletedNote._id);
      });
    }));
  });

  describe('The permanentlyDeleteNote() method:', () => {
    it('calls NoteService.permanentlyDeleteNote()', async(() => {
      spyOn(mockNoteService, 'permanentlyDeleteNote').and.callThrough();
      trashComponent.permanentlyDeleteNote(professorJohnsonsDeletedNote._id);
      fixture.whenStable().then(() => {
        expect(mockNoteService.permanentlyDeleteNote).toHaveBeenCalledTimes(1);
        expect(mockNoteService.permanentlyDeleteNote)
          .toHaveBeenCalledWith(professorJohnsonsDeletedNote._id);
      });
    }));
  });
});
