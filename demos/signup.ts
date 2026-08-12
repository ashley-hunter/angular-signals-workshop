import { JsonPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { FormField, form, hidden, required } from '@angular/forms/signals'

@Component({
  selector: 'signup-demo',
  imports: [FormField, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-3">
      <select [formField]="f.status">
        <option value="single">Single</option>
        <option value="married">Married</option>
      </select>

      @if (!f.spouseName().hidden()) {
        <input [formField]="f.spouseName" placeholder="Spouse name" />
      }

      <button [disabled]="!f().valid()">Submit</button>

      <pre>{{ model() | json }}</pre>
    </div>
  `,
})
export class Signup {
  model = signal({ status: 'single', spouseName: '' })

  f = form(this.model, (p) => {
    required(p.spouseName)
    hidden(p.spouseName, {
      when: ({ valueOf }) => valueOf(p.status) !== 'married',
    })
  })
}
