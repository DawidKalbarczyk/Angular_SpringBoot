import { Component } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import { LoginCorner } from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';

@Component({
  selector: 'app-user',
  imports: [AuthorBar, LoginCorner, ReturnCorner],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User {}
