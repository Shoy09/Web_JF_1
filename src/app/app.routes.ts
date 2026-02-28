import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Public components
import { PrincipalComponent } from '../app/principales/principal/principal.component';
import { HomeComponent } from './routes/home/home.component';
import { AcercaDeComponent } from './routes/acerca-de/acerca-de.component';
import { HistoryComponent } from './routes/history/history.component';
import { VistaProductosComponent } from './components/vista-productos/vista-productos.component';
import { ProductoGeneralComponent } from './components/producto-general/producto-general.component';
import { ContactComponent } from './routes/contact/contact.component';
import { MasInfoComponent } from './components/mas-info/mas-info.component';
import { NoticiasComponent } from './components/noticias/noticias.component';
import { LoginComponent } from './principales/login/login.component';

// Admin components
import { PrincipalAdminComponent } from '../app/principales/principal-admin/principal-admin.component';
import { AdminComponent } from './admin/admin/admin.component';
import { AboutEditorComponent } from './admin/editors/about-editor/about-editor.component';
import { HomeEditorComponent } from './admin/editors/home-editor/home-editor.component';
import { ContactEditorComponent } from './admin/editors/contact-editor/contact-editor.component';
import { ProductsEditorComponent } from './admin/editors/products-editor/products-editor.component';
import { FooterEditorComponent } from './admin/editors/footer-editor/footer-editor.component';
import { NavbarEditorComponent } from './admin/editors/navbar-editor/navbar-editor.component';
import { ProductGeneralEditorComponent } from './admin/editors/product-general-editor/product-general-editor.component';
import { MasInfoEditorComponent } from './admin/editors/mas-info-editor/mas-info-editor.component';
import { HistoryEditorComponent } from './admin/editors/history-editor/history-editor.component';
import { NoticiasEditorComponent } from './admin/editors/noticias-editor/noticias-editor.component';
import { RegistrarComponent } from './principales/registrar/registrar.component';

// Guard
import { authGuard } from '../app/principales/login/Auth.guard'; // ← ajusta la ruta si es diferente
import { ProfileComponent } from './admin/admin/profile/profile.component';

export const routes: Routes = [

  // -------------------- Public routes --------------------
  {
    path: '',
    component: PrincipalComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'acerca-de', component: AcercaDeComponent },
      { path: 'his', component: HistoryComponent },
      { path: 'productos', component: VistaProductosComponent },
      { path: 'productos/general', component: ProductoGeneralComponent },
      { path: 'mas-info', component: MasInfoComponent },
      { path: 'contactos', component: ContactComponent },
      { path: 'noticias', component: NoticiasComponent },
      { path: 'login', component: LoginComponent },
      { path: 'registrarse', component: RegistrarComponent },
    ]
  },

  // -------------------- Admin routes (protegidas) --------------------
  {

  path: 'admin',
  component: PrincipalAdminComponent,
  canActivate: [authGuard], // ← solo aquí es suficiente
  children: [
    { path: 'home', component: HomeEditorComponent }, // ← sin canActivate
    { path: 'about', component: AboutEditorComponent },
    { path: 'contact', component: ContactEditorComponent },
    { path: 'footer', component: FooterEditorComponent },
    { path: 'navbar', component: NavbarEditorComponent },
    { path: 'general-product', component: ProductGeneralEditorComponent },
    { path: 'products', component: ProductsEditorComponent },
    { path: 'mas-info', component: MasInfoEditorComponent },
    { path: 'history', component: HistoryEditorComponent },
    { path: 'noticias', component: NoticiasEditorComponent },
    { path: 'profile', component: ProfileComponent },

  ]
},

  // Redirigir cualquier ruta no encontrada a home o login
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}