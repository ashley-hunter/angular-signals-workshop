/**
 * Slide 37: Rules live in the schema, beside the data
 *
 * Type in the fields and watch the errors and the model update.
 */
import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [FormField, JsonPipe],
  template: `
    <h1>Signal forms: a schema</h1>
    <p class="hint">Type in the fields. Errors show once a field is touched.</p>
    <div class="card">
      <div class="row">
        <label>Email</label>
        <input [formField]="signupForm.email" />
      </div>
      @if (signupForm.email().touched()) {
        @for (e of signupForm.email().errors(); track e.kind) {
          <div class="bad">{{ e.message }}</div>
        }
      }
      <div class="row">
        <label>Password</label>
        <input type="password" [formField]="signupForm.password" />
      </div>
      @if (signupForm.password().touched()) {
        @for (e of signupForm.password().errors(); track e.kind) {
          <div class="bad">{{ e.message }}</div>
        }
      }
      <div class="row">
        <button [disabled]="signupForm().invalid()">Sign up</button>
      </div>
    </div>
    <pre class="card log">{{ signup() | json }}</pre>
  `,
})
export class App {
  readonly signup = signal({ email: '', password: '' });

  readonly signupForm = form(this.signup, (p) => {
    required(p.email, { message: 'Email is required' });
    email(p.email, { message: 'Enter a valid email' });
    minLength(p.password, 8, { message: '8 or more' });
  });
}
