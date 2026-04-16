import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "../../components/navbar/navbar";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayout {
  protected readonly title = signal('cookbook-frontend');
}
