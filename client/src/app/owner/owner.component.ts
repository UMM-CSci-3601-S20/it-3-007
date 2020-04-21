import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Owner } from '../owner';
import { OwnerService } from '../owner.service';
import { Subscription } from 'rxjs';
import { NotesService } from '../notes.service';
import { Note } from '../note';
import {Location} from '@angular/common';
import { AuthService } from '../authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
// This class has access to the owner of the doorboard, and all the posts that said owner has made
export class OwnerComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, public auth: AuthService,
              private _location: Location, private notesService: NotesService,
              private ownerService: OwnerService, private snackBar: MatSnackBar) {
                console.log("Constructing Owner Component");
              }
  notes: Note[];
  owner: Owner;
  id: string;
  name: string;
  getNotesSub: Subscription;
  getOwnerSub: Subscription;
  getx500Sub: Subscription;
  x500: string;
  logins: number;


  retrieveOwner(): void {
    this.getx500Sub = this.auth.userProfile$.subscribe(returned => {
      this.x500 = returned.nickname;
    });
    this.getOwnerSub = this.ownerService.getOwnerByx500(this.x500).subscribe(returnedOwner => {
      this.owner = returnedOwner;
      this.retrieveNotes();
    }, err => {
      let errorTitle = "The requested owner was not found"
      if (err.status === 404 && err.error.title === errorTitle) {
        this.addOwner();
      }
      console.log(err);
    });
  }

  retrieveNotes(): void {
    this.getNotesSub = this.notesService.getOwnerNotes({owner_id: this.owner._id, posted: true}).subscribe(returnedNotes => {
      this.notes = returnedNotes.reverse();
    }, err => {
      console.log(err);
    });
  }

  deleteNote(id: string): void {
    this.notesService.deleteNote(id).subscribe(result => {
      // Ignore the result for now.
      this.retrieveNotes();
    }, err => {
      console.log(err);
    });
  }

  ngOnInit(): void {
    this.retrieveOwner();
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

  savePDF(): void {

    // get id of owner, and pass is as a parameter in getPDF
    this.ownerService.getPDF(this.owner.name, this.x500).save('DoorBoard');
  }

  printPDF(): void {

    // get a PDF with the owners name and x500
    const doc = this.ownerService.getPDF(this.owner.name, this.x500);
    doc.autoPrint(); // This will give us the print-Dialog when opened
    doc.output('dataurlnewwindow'); // output doc (the pdf) in a new window.
  }

  addOwner(): void {
    let newOwner: Owner;

    this.getx500Sub = this.auth.userProfile$.subscribe(returned => {
      newOwner = {
        x500: this.x500,
        email: returned.email,
        name: returned.name,
        _id: null,
        officeNumber: null,
        building: null
      };
    });

    this.ownerService.addOwner(newOwner).subscribe(newID => {
      this.snackBar.open('Successfully created a new owner', null, {
        duration: 2000,
      });
      location.reload();
    }, err => {
      this.snackBar.open('Failed to create a new owner', null, {
        duration: 2000,
      });
    });
  }
}
