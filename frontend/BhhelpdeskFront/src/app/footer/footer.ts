import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  year = new Date().getFullYear();

  // optionnel si tu veux suivre le thème (sinon supprime)
  theme: 'light' | 'dark' = 'light';
}