/**
 * Slide 38: Describe the rule, not the response
 *
 * Both versions are live side by side. Tick "Notify me" with an empty email:
 * both forms become invalid. The reactive version gets there by adding and
 * removing validators in a subscription. The signal version states the rule.
 */
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { startWith } from 'rxjs';

@Component({
  selector: 'prefs-reactive',
  imports: [ReactiveFormsModule],
  template: `
    <div class="card" [formGroup]="prefsForm">
      <h2>Reactive forms</h2>
      <div class="row">
        <label><input type="checkbox" formControlName="notify" /> Notify me</label>
      </div>
      <div class="row"><input formControlName="email" placeholder="email" /></div>
      <div [class.bad]="prefsForm.invalid" [class.good]="prefsForm.valid">
        {{ prefsForm.valid ? 'valid' : 'invalid' }}
      </div>
    </div>
  `,
})
export class PrefsReactive {
  readonly prefsForm = new FormGroup({
    notify: new FormControl(false, { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const { notify, email } = this.prefsForm.controls;

    notify.valueChanges
      .pipe(startWith(notify.value), takeUntilDestroyed())
      .subscribe((shouldNotify) => {
        if (shouldNotify) {
          email.addValidators(Validators.required);
        } else {
          email.removeValidators(Validators.required);
        }
        email.updateValueAndValidity();
      });
  }
}

@Component({
  selector: 'prefs-signal',
  imports: [FormField],
  template: `
    <div class="card">
      <h2>Signal forms</h2>
      <div class="row">
        <label><input type="checkbox" [formField]="prefsForm.notify" /> Notify me</label>
      </div>
      <div class="row"><input [formField]="prefsForm.email" placeholder="email" /></div>
      <div [class.bad]="prefsForm().invalid()" [class.good]="prefsForm().valid()">
        {{ prefsForm().valid() ? 'valid' : 'invalid' }}
      </div>
    </div>
  `,
})
export class PrefsSignal {
  readonly prefs = signal({ notify: false, email: '' });

  readonly prefsForm = form(this.prefs, (p) => {
    required(p.email, {
      when: ({ valueOf }) => valueOf(p.notify),
    });
  });
}

@Component({
  selector: 'app-root',
  imports: [PrefsReactive, PrefsSignal],
  template: `
    <h1>Conditional validation</h1>
    <p class="hint">Tick "Notify me" with an empty email in each form.</p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <prefs-reactive />
      <prefs-signal />
    </div>
  `,
})
export class App {}
