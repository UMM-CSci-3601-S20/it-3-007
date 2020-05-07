# DoorBoard

**Build Status**

[![Server Build Status](../../workflows/Server%20Java/badge.svg)](../../actions?query=workflow%3A"Server+Java")
[![Client Build Status](../../workflows/Client%20Angular/badge.svg)](../../actions?query=workflow%3A"Client+Angular")
[![End to End Build Status](../../workflows/End-to-End/badge.svg)](../../actions?query=workflow%3AEnd-to-End)

This is Team 007's iteration-three code for the DoorBoard web app,
as part of The UMM CSCI Department's "Software Design and Development" class
(Spring 2020).

 ## What is DoorBoard

DoorBoard is a virtual sticky-note board for office dwellers who need a way to
remotely and conveniently post last minute scheduling announcements (or other
information) to visitors.

## Features 

Doorboard includes:
  - Authentication using Auth0.
  - The ability to create a new note on your DoorBoard (with a 1000 character limit).
    - Notes display the date and time that they were created.
  - The ability to move notes to trash.
  - The ability to delete notes permanently from trash.
  - The ability to switch to viewer mode. (This allows an owner of a page to see what their viewers would see.)
  - The ability to create a door sign (in the form of a PDF) with the owner's name and link to their page.
  - The ability to copy a link to the viewer page to the clipboard.

## What's on your DoorBoard?

Your DoorBoard will display your name and any active notes. 

## What notes look like

Notes are created using the add button in the bottom right corner of the website.
In addition the text you write, they display the date and time that they were created.
Notes also include an edit button and a trash button.
Clicking the trash button will move a note into the discarded-notes section.

## Discarded Notes

Once a note has been sent to the trash you can find it by navigating to 
the discarded-notes page. From here, notes can be permanently deleted.
They can also be restored to your DoorBoard using the restore button.

## Navigation Menu

This menu, on the left side of the toolbar, lets you navigate to your DoorBoard or your discarded notes, and it lets you see your DoorBoard in viewer mode. It also contains a logout button. 

Viewer mode brings you to the page that your viewers are able to see.
When you're still logged in, you will still have the tool bar with the navigation and share menu.
However, if you aren't logged in, these controls won't be present.

## Share Menu (top right in toolbar)

Here is where you can copy a shareable link to your viewer page and generate your personal door sign.

## Known Issues

1. An issue sometimes occurs where the page will get stuck refreshing forever. This seems to happen most frequently on mobile browsers. The exact cause of this issue is currently unknown. 

## Deployment

Instructions for how to set up the project are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Authors

Benjamin Burgess   
Ben Goldstein   
Johannes Martinez   
Jake Peterson   
Joe Walbran   
