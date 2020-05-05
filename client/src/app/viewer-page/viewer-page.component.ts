import { Component, OnInit } from '@angular/core';
import { NotesService } from '../notes.service';
import { Note } from '../note';
import { Subscription } from 'rxjs';
import { OwnerService } from '../owner.service';
import { Owner } from '../owner';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-viewer-page',
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.scss']
})

export class ViewerPageComponent implements OnInit {

  public notes: Note[];
  public urlId: string;
  public urlx500: string;
  getNotesSub: Subscription;
  getOwnerSub: Subscription;
  owner: Owner;

  constructor(private notesService: NotesService, private ownerService: OwnerService,
              private router: Router, private route: ActivatedRoute) {}

  retrieveOwner(): void {
    this.getOwnerSub = this.ownerService.getOwnerByx500(this.urlx500).subscribe(returnedOwner => {
      this.owner = returnedOwner;
      this.retrieveNotes();
    }, err => {
      console.log(err);
    });
  }

  retrieveNotes(): void {
    this.getNotesSub = this.notesService.getOwnerNotes({owner_id: this.owner._id, status: 'active'}).subscribe(returnedNotes =>{
      this.notes = returnedNotes.reverse();
    }, err => {
      console.log(err);
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pmap) => {
      this.urlx500 = pmap.get('x500');
      this.retrieveOwner();
    });

  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getNotesSub) {
      this.getNotesSub.unsubscribe();
    }
    if (this.getOwnerSub) {
      this.getOwnerSub.unsubscribe();
    }
  }

}
