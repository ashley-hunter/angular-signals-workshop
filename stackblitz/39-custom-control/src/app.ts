/**
 * Slide 39: One interface, one signal, no ControlValueAccessor
 *
 * Both versions are live side by side. The same text input, written once as a
 * ControlValueAccessor for reactive forms and once as a FormValueControl for
 * signal forms. Type in each and blur it to mark it touched.
 */
import { JsonPipe } from '@angular/common';
import { Component, forwardRef, model, output, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'cva-input',
  template: `
    <input [value]="value"
           (input)="onChange($any($event.target).value)"
           (blur)="onTouched()" />
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CvaInput), multi: true }],
})
export class CvaInput implements ControlValueAccessor {
  value = '';
  protected onChange = (v: string) => {};
  onTouched = () => {};
  writeValue(v: string) { this.value = v; }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
}

@Component({
  selector: 'signal-input',
  template: `
    <input [value]="value()"
           (input)="value.set($any($event.target).value)"
           (blur)="touch.emit()" />
  `,
})
export class SignalInput implements FormValueControl<string> {
  readonly value = model('');
  readonly touch = output<void>();
}

@Component({
  selector: 'app-root',
  imports: [CvaInput, SignalInput, ReactiveFormsModule, FormField, JsonPipe],
  template: `
    <h1>Custom form controls</h1>
    <p class="hint">Type in each input, then click away.</p>
    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
      <div class="card">
        <h2>ControlValueAccessor</h2>
        <cva-input [formControl]="name" />
        <pre class="log">{{ { value: name.value, touched: name.touched } | json }}</pre>
      </div>
      <div class="card">
        <h2>FormValueControl</h2>
        <signal-input [formField]="profileForm.name" />
        <pre class="log">{{ { value: profileForm.name().value(), touched: profileForm.name().touched() } | json }}</pre>
      </div>
    </div>
  `,
})
export class App {
  readonly name = new FormControl('', { nonNullable: true });

  readonly profile = signal({ name: '' });
  readonly profileForm = form(this.profile);
}
