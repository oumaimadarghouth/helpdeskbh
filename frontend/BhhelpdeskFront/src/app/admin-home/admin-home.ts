import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-home',
  imports: [CommonModule, RouterOutlet, RouterLink], 
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome {

}
