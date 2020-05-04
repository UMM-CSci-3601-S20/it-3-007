import { Component, OnInit, Inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { AuthService } from './authentication/auth.service';
import { DOCUMENT } from '@angular/common';
import { OwnerService } from './owner.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DoorBoard';

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private ownerService: OwnerService,
  ) {}

  ngOnInit() {}

  openSign(): void {
    this.auth.getUser$().pipe(
      take(1),
    ).subscribe(user => {
      const signUrl = this.ownerService.getSignUrl(user.name, user.nickname);
      this.openExternalLink(signUrl);
    });
  }

  copyURL(): void {
    this.auth.getUser$().pipe(
      take(1),
    ).subscribe(user => {
      const val = environment.BASE_URL + '/' + user.nickname;
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
    });
  }

  goToViewerPage() {
    this.auth.getUser$().pipe(
      take(1),
    ).subscribe(user => {
      this.router.navigate([`/${user.nickname}`]);
    });
  }

  openExternalLink(url: string) {
    // We can't use window.open(url, '_blank') here, because Safari
    // doesn't like that.
    this.document.location.href = url;
  }
}
