import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NotesService } from '../notes.service';
import { MockNoteService } from 'src/testing/note.service.mock';
import { EditComponent } from './edit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'src/testing/activated-route-stub';
import { HttpParams } from '@angular/common/http';


describe('EditComponent', () => {
  let editComponent: EditComponent;
  let editNoteForm: FormGroup;
  let fixture: ComponentFixture<EditComponent>;

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
        { provide: NotesService, useValue: new MockNoteService() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub(new HttpParams().set('id', 'foo')) },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditComponent);
    editComponent = fixture.componentInstance;
    editComponent.ngOnInit();
    fixture.detectChanges();
    editNoteForm = editComponent.editNoteForm;
    expect(editNoteForm).toBeDefined();
    expect(editNoteForm.controls).toBeDefined();
  });

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

//   describe('The body field:', () => {
//     let bodyControl: AbstractControl;

//     beforeEach(() => {
//       bodyControl = editComponent.editNoteForm.controls[`body`];
//     });

//     it('should auto-populate with the body of the appropriate note', () => {
//       // This is the value provided by MockNoteService
//       expect(bodyControl.value).toEqual(MockNoteService.FAKE_BODY);
//     });

//     it('should not allow empty bodies', () => {
//       bodyControl.setValue('');
//       expect(bodyControl.valid).toBeFalsy();
//     });

//     it('should be fine with "late to office hours"', () => {
//       bodyControl.setValue('late to office hours');
//       expect(bodyControl.valid).toBeTruthy();
//     });

//     it('should fail on single character bodies', () => {
//       bodyControl.setValue('x');
//       expect(bodyControl.valid).toBeFalsy();
//       expect(bodyControl.hasError('minlength')).toBeTruthy();
//     });

//     it('should fail on really long bodies', () => {
//       bodyControl.setValue('x'.repeat(1000));
//       expect(bodyControl.valid).toBeFalsy();
//       expect(bodyControl.hasError('maxlength')).toBeTruthy();
//     });
//   });
});
