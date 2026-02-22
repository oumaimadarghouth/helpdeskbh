import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MeService } from '../core/user/me.service';
import { ProfileService } from '../core/user/profile.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  loading = false;
  saving = false;

  // ✅ on déclare seulement
  form!: FormGroup;

  // Toast
  toastMsg = '';
  toastType: 'ok' | 'err' = 'ok';
  private toastTimer?: any;

  constructor(
    private fb: FormBuilder,
    private meService: MeService,
    private profileApi: ProfileService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // ✅ on initialise ICI
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: [''],
      contract_type: [''],
    });

    this.loadAll();
  }

private showToast(type: 'ok' | 'err', msg: string) {
  // Force Angular to update UI immediately
  this.zone.run(() => {
    this.toastType = type;
    this.toastMsg = msg;
    this.cdr.detectChanges();
  });

  clearTimeout(this.toastTimer);
  this.toastTimer = setTimeout(() => {
    this.zone.run(() => {
      this.toastMsg = '';
      this.cdr.detectChanges();
    });
  }, 2800);
}


  loadAll() {
    this.loading = true;

    forkJoin({
      me: this.meService.getMe(),
      profile: this.profileApi.getMyProfile(),
    }).subscribe({
      next: ({ me, profile }) => {
        this.form.patchValue({
          first_name: me.first_name || '',
          last_name: me.last_name || '',
          email: me.email || '',
          phone: profile.phone || '',
          department: profile.department || '',
          contract_type: profile.contract_type || '',
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('err', 'Erreur chargement profil.');
      },
    });
  }

  save() {
 this.form.markAllAsTouched();
  this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });

  if (this.form.invalid) {
    this.showToast('err', 'Veuillez remplir les champs obligatoires.');
    return;
  }
    this.saving = true;
    const v = this.form.value;

    forkJoin({
      me: this.meService.updateMe({
        first_name: v.first_name!,
        last_name: v.last_name!,
        email: v.email!,
      }),
      profile: this.profileApi.updateMyProfile({
        phone: v.phone || null,
        department: v.department || null,
        contract_type: v.contract_type || null,
      }),
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showToast('ok', 'Profil mis à jour ✅');
      },
      error: () => {
        this.saving = false;
        this.showToast('err', 'Erreur mise à jour.');
      },
    });
  }
}
