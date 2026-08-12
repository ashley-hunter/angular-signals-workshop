import { JsonPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { FormField, email, form, minLength, required } from '@angular/forms/signals'

@Component({
  selector: 'signup-demo',
  imports: [FormField, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-2 max-w-sm">
      <input [formField]="f.name" placeholder="Name" class="border rounded px-2 py-1" />
      @for (e of f.name().errors(); track e.kind) {
        <small class="text-red-500">{{ e.message }}</small>
      }

      <input [formField]="f.email" placeholder="Email" class="border rounded px-2 py-1" />
      @for (e of f.email().errors(); track e.kind) {
        <small class="text-red-500">{{ e.message }}</small>
      }

      <button [disabled]="f().invalid()" class="border rounded px-2 py-1">Submit</button>
      <pre class="text-xs">{{ model() | json }}</pre>
    </div>
  `,
})
export class Signup {
  model = signal({ name: '', email: '' })

  f = form(this.model, (path) => {
    required(path.name, { message: 'Name is required' })
    minLength(path.name, 3, { message: 'At least 3 characters' })
    email(path.email, { message: 'Not a valid email' })
  })
}
