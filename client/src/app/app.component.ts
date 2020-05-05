import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './authentication/auth.service';
import { DOCUMENT } from '@angular/common';
import { OwnerService } from './owner.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DoorBoard';
  x500: string;
  name: string;

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private ownerService: OwnerService) { }

  ngOnInit() {
    this.auth.getUser$().subscribe(user => {
      this.x500 = user.nickname;
      this.name = user.name;
    });
  }

  getViewerLink() {
    return '/' + this.x500;
  }

  openSign(): void {
    this.openExternalLink(
      this.ownerService.getSignUrl(this.name, this.x500));
  }

  copyURL(): void {
    const val = environment.BASE_URL + '/' + this.x500;
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

  openExternalLink(url: string) {
    // We can't use window.open(url, '_blank') here, because Safari
    // doesn't like that.
    this.document.location.href = url;
  }
}
