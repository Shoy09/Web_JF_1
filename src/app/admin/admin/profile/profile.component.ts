import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE_URL } from '../../../api.config';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // ── Perfil propio ─────────────────────────────────────────────
  usuario: Usuario | null = null;
  isLoading       = true;
  savingDatos     = false;
  savingPass      = false;
  successMessage  = '';
  errorMessage    = '';
  passError       = '';
  showNewPass     = false;
  showConfirmPass = false;

  form     = { nombres: '', apellidos: '', correo: '', cargo: '' };
  passForm = { newPassword: '', confirmPassword: '' };

  // Tabs: 'perfil' | 'password' | 'crear' | 'gestion'
  activeTab: 'perfil' | 'password' | 'crear' | 'gestion' = 'perfil';

  // Roles disponibles para asignar (select)
  readonly ROLES = ['administrador', 'editor'];

  // ── Getter de rol del usuario logueado ────────────────────────
  get esAdmin(): boolean {
    return (this.usuario?.rol || '').toLowerCase() === 'administrador';
  }

  // ── Crear cuenta (solo admin) ─────────────────────────────────
  showNewAccountPass    = false;
  showNewAccountConfirm = false;
  creatingAccount       = false;
  newAccountErrors: Record<string, string> = {};

  newUserForm = {
    nombres: '', apellidos: '', correo: '',
    codigo_dni: '', cargo: '', rol: '',
    password: '', confirmPassword: ''
  };

  // ── Gestión de cuentas (solo admin) ──────────────────────────
  listaUsuarios: Usuario[] = [];
  loadingLista             = false;
  searchTerm               = '';
  usuarioSeleccionado: (Usuario & { activo?: boolean }) | null = null;
  panelAccion: null | 'password' | 'delete' | 'rol' = null;
  nuevoRol = '';
  procesando         = false;
  showGestionPass    = false;
  showGestionConfirm = false;
  gestionPassError   = '';
  gestionPassForm    = { newPassword: '', confirmPassword: '' };

  get usuariosFiltrados(): Usuario[] {
    const t = this.searchTerm.trim().toLowerCase();
    if (!t) return this.listaUsuarios;
    return this.listaUsuarios.filter(u =>
      u.nombres.toLowerCase().includes(t)        ||
      u.apellidos.toLowerCase().includes(t)      ||
      u.codigo_dni.includes(t)                   ||
      (u.correo || '').toLowerCase().includes(t) ||
      (u.rol    || '').toLowerCase().includes(t)
    );
  }

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {}

  private get headers(): HttpHeaders {
    const token = sessionStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // ── Perfil ────────────────────────────────────────────────────
  cargarPerfil(): void {
    this.isLoading = true;
    this.http.get<Usuario>(`${API_BASE_URL}/usuarios/perfil`, { headers: this.headers })
      .subscribe({
        next: d => {
          this.usuario = d;
          this.form = {
            nombres:   d.nombres,
            apellidos: d.apellidos,
            correo:    d.correo || '',
            cargo:     d.cargo  || ''
          };
          this.isLoading = false;
          // Solo cargar lista si es admin
          if (this.esAdmin) this.cargarUsuarios();
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar el perfil.';
          this.isLoading = false;
        }
      });
  }

  resetDatos(): void {
    if (!this.usuario) return;
    this.form = {
      nombres:   this.usuario.nombres,
      apellidos: this.usuario.apellidos,
      correo:    this.usuario.correo || '',
      cargo:     this.usuario.cargo  || ''
    };
  }

  guardarDatos(): void {
    if (!this.usuario) return;
    this.savingDatos = true;
    this.successMessage = ''; this.errorMessage = '';
    this.http.put(`${API_BASE_URL}/usuarios/${this.usuario.id}`, this.form, { headers: this.headers })
      .subscribe({
        next: () => {
          this.savingDatos = false;
          this.usuario = { ...this.usuario!, ...this.form };
          this.mostrarExito('Datos actualizados correctamente');
        },
        error: () => { this.savingDatos = false; this.mostrarError('Error al actualizar los datos.'); }
      });
  }

  resetPass(): void {
    this.passForm = { newPassword: '', confirmPassword: '' };
    this.passError = '';
  }

  cambiarPassword(): void {
    this.passError = '';
    if (this.passForm.newPassword.length < 6)  { this.passError = 'Mínimo 6 caracteres.'; return; }
    if (this.passForm.newPassword !== this.passForm.confirmPassword) { this.passError = 'Las contraseñas no coinciden.'; return; }
    if (!this.usuario) return;
    this.savingPass = true;
    this.http.put(
      `${API_BASE_URL}/usuarios/${this.usuario.id}`,
      { password: this.passForm.newPassword },
      { headers: this.headers }
    ).subscribe({
      next: () => { this.savingPass = false; this.resetPass(); this.mostrarExito('Contraseña actualizada'); },
      error: () => { this.savingPass = false; this.mostrarError('Error al cambiar contraseña.'); }
    });
  }

  // ── Validaciones crear cuenta ─────────────────────────────────
  private validarNuevoUsuario(): boolean {
    const e: Record<string, string> = {};
    const f = this.newUserForm;

    if (!f.nombres.trim() || f.nombres.trim().length < 2)
      e['nombres'] = !f.nombres.trim() ? 'El nombre es obligatorio.' : 'Mínimo 2 caracteres.';

    if (!f.apellidos.trim() || f.apellidos.trim().length < 2)
      e['apellidos'] = !f.apellidos.trim() ? 'Los apellidos son obligatorios.' : 'Mínimo 2 caracteres.';

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!f.correo.trim())            e['correo'] = 'El correo es obligatorio.';
    else if (!emailRx.test(f.correo)) e['correo'] = 'Ingresa un correo válido.';

    const dniRx = /^\d{8}$/;
    if (!f.codigo_dni.trim())          e['codigo_dni'] = 'El DNI es obligatorio.';
    else if (!dniRx.test(f.codigo_dni)) e['codigo_dni'] = 'El DNI debe tener exactamente 8 dígitos.';

    if (!f.cargo.trim()) e['cargo'] = 'El cargo es obligatorio.';
    if (!f.rol)          e['rol']   = 'Selecciona un rol.';

    if (!f.password)                e['password'] = 'La contraseña es obligatoria.';
    else if (f.password.length < 6) e['password'] = 'Mínimo 6 caracteres.';

    if (!f.confirmPassword)                   e['confirmPassword'] = 'Confirma la contraseña.';
    else if (f.password !== f.confirmPassword) e['confirmPassword'] = 'Las contraseñas no coinciden.';

    this.newAccountErrors = e;
    return Object.keys(e).length === 0;
  }

  resetNewUser(): void {
    this.newUserForm = {
      nombres: '', apellidos: '', correo: '',
      codigo_dni: '', cargo: '', rol: '',
      password: '', confirmPassword: ''
    };
    this.newAccountErrors = {};
  }

  crearCuenta(): void {
    if (!this.validarNuevoUsuario()) return;
    this.creatingAccount = true;
    const { confirmPassword, ...payload } = this.newUserForm;
    this.usuarioService.crearUsuario(payload).subscribe({
      next: u => {
        this.creatingAccount = false;
        this.listaUsuarios = [...this.listaUsuarios, u];
        this.resetNewUser();
        this.mostrarExito('Cuenta creada correctamente.');
      },
      error: err => {
        this.creatingAccount = false;
        this.newAccountErrors['general'] = err?.error?.message || 'Error al crear la cuenta.';
      }
    });
  }

  // ── Gestión de cuentas ────────────────────────────────────────
  cargarUsuarios(): void {
    this.loadingLista = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next:  u  => { this.listaUsuarios = u; this.loadingLista = false; },
      error: () => { this.loadingLista = false; }
    });
  }

  seleccionarUsuario(u: Usuario): void {
    if (!u || !u.nombres || !u.apellidos) return;
    this.usuarioSeleccionado = u;
    this.panelAccion = null;
    this.nuevoRol = u.rol || '';
    this.gestionPassForm = { newPassword: '', confirmPassword: '' };
    this.gestionPassError = '';
  }

  cerrarFicha(): void {
    this.usuarioSeleccionado = null;
    this.panelAccion = null;
  }

  togglePanel(panel: 'password' | 'delete' | 'rol'): void {
    this.panelAccion = this.panelAccion === panel ? null : panel;
    this.gestionPassError = '';
    this.gestionPassForm  = { newPassword: '', confirmPassword: '' };
  }

  toggleEstado(): void {
    if (!this.usuarioSeleccionado?.id) return;
    const u = this.usuarioSeleccionado as Usuario & { activo?: boolean };
    const nuevoEstado = !u.activo;
    this.procesando = true;
    this.usuarioService.toggleEstado(this.usuarioSeleccionado.id, nuevoEstado).subscribe({
      next: updated => {
        this.procesando = false;
        const idx = this.listaUsuarios.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.listaUsuarios[idx] = updated;
        this.usuarioSeleccionado = updated;
        this.mostrarExito(`Cuenta ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`);
      },
      error: () => { this.procesando = false; this.mostrarError('Error al cambiar el estado.'); }
    });
  }

  cambiarPasswordGestion(): void {
    this.gestionPassError = '';
    if (this.gestionPassForm.newPassword.length < 6) { this.gestionPassError = 'Mínimo 6 caracteres.'; return; }
    if (this.gestionPassForm.newPassword !== this.gestionPassForm.confirmPassword) { this.gestionPassError = 'Las contraseñas no coinciden.'; return; }
    if (!this.usuarioSeleccionado?.id) return;
    this.procesando = true;
    this.usuarioService.actualizarUsuario(this.usuarioSeleccionado.id, { password: this.gestionPassForm.newPassword })
      .subscribe({
        next: () => {
          this.procesando = false;
          this.panelAccion = null;
          this.gestionPassForm = { newPassword: '', confirmPassword: '' };
          this.mostrarExito('Contraseña actualizada.');
        },
        error: () => { this.procesando = false; this.gestionPassError = 'Error al cambiar la contraseña.'; }
      });
  }

  confirmarEliminar(): void {
    if (!this.usuarioSeleccionado?.id) return;
    this.procesando = true;
    this.usuarioService.eliminarUsuario(this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.procesando = false;
        this.listaUsuarios = this.listaUsuarios.filter(u => u.id !== this.usuarioSeleccionado!.id);
        this.cerrarFicha();
        this.mostrarExito('Cuenta eliminada.');
      },
      error: () => { this.procesando = false; this.mostrarError('Error al eliminar la cuenta.'); }
    });
  }

  cambiarRol(): void {
    if (!this.nuevoRol || !this.usuarioSeleccionado?.id) return;
    this.procesando = true;
    this.usuarioService.actualizarUsuario(this.usuarioSeleccionado.id, { rol: this.nuevoRol }).subscribe({
      next: (updated) => {
        this.procesando = false;
        const idx = this.listaUsuarios.findIndex(x => x.id === updated.id);
        if (idx !== -1) this.listaUsuarios[idx] = updated;
        this.usuarioSeleccionado = updated;
        this.panelAccion = null;
        this.nuevoRol = '';
        this.mostrarExito('Rol actualizado correctamente.');
      },
      error: () => { this.procesando = false; this.mostrarError('Error al cambiar el rol.'); }
    });
  }

  soloNumerosDni(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.newUserForm.codigo_dni = input.value;
  }

  // ── Helpers ───────────────────────────────────────────────────
  private mostrarExito(msg: string): void {
    this.successMessage = msg; this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3500);
  }
  private mostrarError(msg: string): void {
    this.errorMessage = msg; this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
  }
}