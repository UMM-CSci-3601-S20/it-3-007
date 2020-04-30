import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Owner } from '../owner';
import { environment } from '../../environments/environment';

/**
 * This component is the sign that the owner can print out and put on their
 * door.
 */
@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignComponent {
  @Input() owner: Owner;

  getUrl(): String {
    return `${environment.BASE_URL}/${this.owner.x500}`;
  }
}
