import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './authentication/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DoorBoard';
  x500: string;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.getUser$().subscribe(user => {
      this.x500 = user.nickname;
    });
  }

  getViewerLink() {
    return '/' + this.x500;
  }
}
