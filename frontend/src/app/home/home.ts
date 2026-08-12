import { Component } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import {LoginCorner} from '../global-components/login-corner/login-corner';

@Component({
  selector: 'app-home',
  imports: [AuthorBar, LoginCorner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
