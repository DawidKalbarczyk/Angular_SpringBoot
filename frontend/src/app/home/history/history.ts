import { Component } from '@angular/core';
import { AuthorBar } from '../../global-components/author-bar/author-bar';
import { LoginCorner } from '../../global-components/login-corner/login-corner';
import { ReturnCorner } from '../../global-components/return-corner/return-corner';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-history',
  imports: [AuthorBar, LoginCorner, ReturnCorner, RouterOutlet, RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {}
