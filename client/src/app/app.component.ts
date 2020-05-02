import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './authentication/auth.service';
import { DOCUMENT } from '@angular/common';
import { OwnerService } from './owner.service';

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

  // openPDF(): void {
  //   this.owner.pipe(take(1)).subscribe(owner => {
  //     this.openExternalLink(
  //       this.ownerService.getSignUrl(owner.name, owner.x500));
  //   });
  // }

  copyURL(): void {
    const val = window.location.href  + this.x500;
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
