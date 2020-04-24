import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NotesService } from '../notes.service';
import { MockNoteService } from 'src/testing/note.service.mock';
import { EditComponent } from './edit.component';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { HttpParams } from '@angular/common/http';
import { MINIMUM_BODY_LENGTH, MAXIMUM_BODY_LENGTH } from '../note';


describe('EditComponent', () => {
  let editComponent: EditComponent;
  let editNoteForm: FormGroup;
  let fixture: ComponentFixture<EditComponent>;
  const mockNoteService = new MockNoteService();

  beforeEach(async(() => {
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
        RouterTestingModule
      ],
      declarations: [ EditComponent ],
      providers: [
        { provide: NotesService, useValue: mockNoteService },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub({ id: 'foo' }) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditComponent);
    editComponent = fixture.componentInstance;
    editComponent.ngOnInit();
    fixture.detectChanges();
    editNoteForm = editComponent.editNoteForm;
  }));

  it('should create', () => {
    expect(editComponent).toBeTruthy();
  });

  describe('The editNoteForm:', () => {
    it('should create', () => {
      expect(editNoteForm).toBeTruthy();
    });

    it('form should auto-populate to a valid state', () => {
      expect(editNoteForm.valid).toBeTruthy();
    });
  });

  describe('The body field:', () => {
    let bodyControl: AbstractControl;

    beforeEach(() => {
      bodyControl = editComponent.editNoteForm.controls[`body`];
    });

    it('should auto-populate with the body of the appropriate note', () => {
      // This is the value provided by MockNoteService
      expect(bodyControl.value).toEqual(MockNoteService.FAKE_BODY);
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

    beforeEach(async(inject([Location], (_location: Location) => {
      bodyControl = editComponent.editNoteForm.controls[`body`];
      bodyControl.setValue('late to office hours');

      // Stub out _location.back so that we don't actually go to a
      // different page.
      // (Karma doesn't like it when we navigate places.)
      spyOn(_location, 'back');
    })));

    it('should open the snack bar', async(inject([MatSnackBar], (snackBar: MatSnackBar) => {
      spyOn(snackBar, 'open');
      editComponent.submitForm();
      // Wait for all that to happen.
      fixture.whenStable().then(() => {
        expect(snackBar.open).toHaveBeenCalledTimes(1);
      });
    })));

    it('should try to add a note', async(() => {
      spyOn(mockNoteService, 'editNote').and.callThrough();
      editComponent.submitForm();
      // Wait for all that to happen.
      fixture.whenStable().then(() => {
        expect(mockNoteService.editNote).toHaveBeenCalledTimes(1);

        const [note, id] =
          (mockNoteService.editNote as jasmine.Spy).calls.argsFor(0);
        expect(note.body).toEqual('late to office hours');
        expect(id).toEqual('foo');
      });
    }));
  });

});
