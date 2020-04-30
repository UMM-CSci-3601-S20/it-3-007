import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignComponent } from './sign.component';
import { MockOwnerService } from '../../testing/owner.service.mock';
import { environment } from 'src/environments/environment';

describe('SignComponent', () => {
  let component: SignComponent;
  let fixture: ComponentFixture<SignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    new MockOwnerService().getOwnerById('rachel_id').subscribe(owner => {
      component.owner = owner;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the getUrl() method', () => {
    it('should return the url of the owner\'s DoorBoard page', () => {
      expect(component.getUrl())
        .toEqual(`${environment.BASE_URL}/rmjohns`);
    });
  });
});
