# DoorBoard

**Build Status**

[![Server Build Status](../../workflows/Server%20Java/badge.svg)](../../actions?query=workflow%3A"Server+Java")
[![Client Build Status](../../workflows/Client%20Angular/badge.svg)](../../actions?query=workflow%3A"Client+Angular")
[![End to End Build Status](../../workflows/End-to-End/badge.svg)](../../actions?query=workflow%3AEnd-to-End)

This is Team 007's iteration-three code for the DoorBoard web app,
as part of The UMM CSCI Department's "Software Design and Development" class
(Spring 2020).

 ## What is DoorBoard

DoorBoard is a secure virtual sticky-note board for office dwellers who need a way to
remotely and conveniently post last minute scheduling announcements (or other
information) to visitors.

## Features 

Doorboard includes:
  - Authentication using Auth0
  - The ability to create a new note on your DoorBoard (1000 character limit)
    - Notes display the date and time that they were created
  - The ability to move notes to trash
  - Delete notes permanently from trash.
  - Switch to viewer mode. This allows an owner of a page to see what their viewers would see.
  - Creating a downloadable and printable PDF with the owners name and link to their page.
  - An owner has the ability to easily copy their link to their viewer page.

## Get started using DoorBoard

To get started using DoorBoard you'll simply need to sign-in or sign-up.

## What's on your DoorBoard?

Your DoorBoard will display your name and any active notes. 

## What notes look like

Notes are created using the add note button in the bottom right of the user interface.
They display the text that you add into them and the date and time that they were created.
Notes also include an edit button and a trash button. Editing a note is straight forward.
Clicking the trash button will move a note into the discarded notes section.

## Discarded Notes

Once a note has been sent to the discarded notes section it can be viewed by navigating to 
the discarded notes page. From here notes can be permanently deleted using the trash icon button.
They can also be restored to your DoorBoard using the Restore Note button.

## Navigation Menu (top left in toolbar)

This contains navigation to your DoorBoard, Discarded Notes, Viewer Mode, and also contains a logout button. 

Viewer Mode brings you to the page that your viewers are able to see.
When you're still logged in you will still have the tool bar with the navigation and share menu.
However, when not logged in these won't be visible.

## Share Menu (top right in toolbar)

Here is where you can copy a shareable link to your viewer page and generate your personal Door Sign.

## Known Issues

1. There is an issue that comes up occasionally where the page will infinitely refresh. I seems to happen on mobile
   when it does happen, and doesn't happen too often. The reason this happens is currently unknown. 

## Deployment

As always, instructions on how to crate a DigitalOcean Droplet and setup the project are in [DEPLOYMENT.md](DEPLOYMENT.md).

If you want to deploy this project on a new droplet, you will need to
change the domain name in the file
`client/src/environments/environment.prod.ts`. (Specifically, you need to
change the value of `BASE_URL`.) This value is used to generate the link on
the PDF.

## Authors

Benjamin Burgess
Ben Goldstein
Johannes Martinez
Jake Peterson
Joe Walbran
675yt