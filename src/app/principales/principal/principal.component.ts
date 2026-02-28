import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-principal',
  imports: [NavbarComponent, RouterOutlet, FooterComponent],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {

}
