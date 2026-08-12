import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

/**
 * The reactive-forms version shown on the "eighteen lines" slide, running for real, so the
 * audience can see what those lines buy: ticking the checkbox attaches the validators and
 * the form flips from valid to invalid.
 *
 * ponytail: the view state is a plain signal kept in sync from the form's own streams.
 * The demo host is zoneless, so reading the FormGroup directly in the template would not
 * re-render - which is itself a fair illustration of the two-copies problem.
 */
@Component({
  selector: 'reactive-signup-demo',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="demo-form">
      <label>
        <span>Email</span>
        <input formControlName="email" type="email" placeholder="you@example.com" />
      </label>

      <label class="check">
        <input formControlName="notify" type="checkbox" />
        <span>Notify me about updates</span>
      </label>

      @if (view().showError) {
        <small>Email is required</small>
      }

      <dl class="state">
        <dt>required</dt>
        <dd [class.on]="view().required">{{ view().required ? 'yes' : 'no' }}</dd>
        <dt>form</dt>
        <dd [class.on]="view().valid">{{ view().valid ? 'valid' : 'invalid' }}</dd>
      </dl>
    </form>
  `,
})
export class ReactiveSignup {
  private fb = inject(FormBuilder)

  form = this.fb.group({ email: [''], notify: [false] })

  protected view = signal({ required: false, valid: true, showError: false })

  constructor() {
    const email = this.form.controls.email

    this.form.controls.notify.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((notify) => {
        if (notify) {
          email.setValidators([Validators.required, Validators.email])
        } else {
          email.clearValidators()
        }
        email.updateValueAndValidity()
      })

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.sync())
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => this.sync())
    this.sync()
  }

  private sync() {
    const email = this.form.controls.email
    this.view.set({
      required: email.hasValidator(Validators.required),
      valid: this.form.valid,
      showError: email.invalid && email.value === '',
    })
  }
}
