import { Component } from '@angular/core';
import { AuthorBar } from '../global-components/author-bar/author-bar';
import {LoginCorner} from '../global-components/login-corner/login-corner';
import { ReturnCorner } from '../global-components/return-corner/return-corner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [AuthorBar, LoginCorner, ReturnCorner, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
