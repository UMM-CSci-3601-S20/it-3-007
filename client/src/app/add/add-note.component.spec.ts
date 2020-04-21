import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockNoteService } from 'src/testing/note.service.mock';
import { AddNoteComponent } from './add-note.component';
import { NotesService } from '../notes.service';
import { OwnerService } from '../owner.service';
import { MockOwnerService } from 'src/testing/owner.service.mock';
import { AuthService } from '../authentication/auth.service';
import { MockAuthService, professorJohnson } from 'src/testing/auth.service.mock';
import { MINIMUM_BODY_LENGTH, MAXIMUM_BODY_LENGTH } from '../note';

describe('AddNoteComponent:', () => {
  let addNoteComponent: AddNoteComponent;
  let addNoteForm: FormGroup;
  let fixture: ComponentFixture<AddNoteComponent>;
  const snackBar = jasmine.createSpyObj('snackBar', ['open']);
  const mockNoteService = new MockNoteService();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [AddNoteComponent],
      providers: [
        { provide: NotesService, useValue: mockNoteService },
        { provide: OwnerService, useValue: new MockOwnerService() },
        { provide: AuthService, useValue: new MockAuthService() },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNoteComponent);
    addNoteComponent = fixture.componentInstance;
    addNoteComponent.ngOnInit();
    fixture.detectChanges();
    addNoteForm = addNoteComponent.addNoteForm;
  });

  it('should create', () => {
    expect(addNoteComponent).toBeTruthy();
  });

  it('should get the x500 of the owner', () => {
    addNoteComponent.x500.subscribe(x500 => {
      expect(x500).toEqual(professorJohnson.nickname);
    })
  })

  describe('The addNoteForm:', () => {
    it('should create', () => {
      expect(addNoteForm).toBeDefined();
      expect(addNoteForm.controls).toBeDefined();
    });

    it('should be invalid when empty', () => {
      expect(addNoteForm.valid).toBeFalsy();
    });
  });

  describe('The body field:', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = addNoteComponent.addNoteForm.controls[`body`];
    });

    it('should not allow empty bodies', () => {
      bodyControl.setValue('');
      expect(bodyControl.valid).toBeFalsy();
    });

    it('should be fine with "late to office hours"', () => {
      bodyControl.setValue('late to office hours');
      expect(bodyControl.valid).toBeTruthy();
    });

    it(`should be invalid if the body is less than ${MINIMUM_BODY_LENGTH} characters`, () => {
      bodyControl.setValue('x'.repeat(MINIMUM_BODY_LENGTH - 1));
      console.log(bodyControl.value);
      expect(bodyControl.valid).toBeFalsy();
    });

    it(`should be invalid if the body is more than ${MAXIMUM_BODY_LENGTH} characters`, () => {
      bodyControl.setValue('x'.repeat(MAXIMUM_BODY_LENGTH + 1));
      expect(bodyControl.valid).toBeFalsy();
    });

    it(`should be fine if the body is exactly ${MINIMUM_BODY_LENGTH} characters`, () => {
      bodyControl.setValue('x'.repeat(MINIMUM_BODY_LENGTH));
      expect(bodyControl.valid).toBeTruthy();
    });

    it(`should be fine if the body is exactly ${MAXIMUM_BODY_LENGTH} characters`, () => {
      bodyControl.setValue('x'.repeat(MAXIMUM_BODY_LENGTH));
      expect(bodyControl.valid).toBeTruthy();
    });
  });

  describe('The submitForm() method:', () => {
    let bodyControl: AbstractControl;

    beforeEach(async(() => {
      snackBar.open.calls.reset();
      bodyControl = addNoteComponent.addNoteForm.controls[`body`];
      bodyControl.setValue('late to office hours');
      addNoteComponent.submitForm();
    }));

    it('should open the snack bar', () => {
      expect(snackBar.open).toHaveBeenCalledTimes(1);
    });

    it('should try to add a note', () => {
      expect(mockNoteService.mostRecentlyPostedNote)
        .toBeDefined();
      expect(mockNoteService.mostRecentlyPostedNote.body)
        .toEqual('late to office hours');
      expect(mockNoteService.mostRecentlyPostedNote.owner_id)
        .toEqual('rachel_id');
      expect(mockNoteService.mostRecentlyPostedNote.posted)
        .toEqual(true);
    })
  })
});
