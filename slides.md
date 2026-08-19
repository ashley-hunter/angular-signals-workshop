---
theme: default
title: Signal Forms
info: Angular's newest forms API, built on signals.
canvasWidth: 1920
colorSchema: dark
highlighter: shiki
transition: slide-left
mdc: true
layout: cover
eyebrow: 'Workshop'
---

# Signal Forms

Angular's newest forms API, built on signals.

<!--
I'm assuming everyone knows Angular, has used Reactive Forms, and understands Signals. The interesting question is not how to write a form with a different API. It is how the mental model changes when the form is built around normal signal-based application data.
-->

---
layout: content
eyebrow: 'Introduction'
heading: 'A third forms API, built on signals'
---
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 52px;max-width:1550px;">Signal Forms became stable in v22 - public API, semver-protected, still growing. You keep your data in a signal, pass it to <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code>, and get a form back - no control tree to build and keep in sync.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Your own data is the form's data, and everything the form knows about a field is a signal.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT IT IS NOT</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">A migration. Reactive forms still work, and so do the controls we have already built - but new forms should use signal forms.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:20px;">WHAT CHANGES</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Static validators become reactive rules. A rule knows when it applies and which fields it depends on, so nothing is added or removed by hand.</p> </div> </div>

<!--
Orientation before we go near the API. Signal Forms became stable in v22 - public API, semver-protected, still growing. It is not a replacement - reactive forms are still supported and still fine for plenty of screens. The difference is that the form is built around ordinary signal-based data instead of a separate control tree.
-->
---
layout: section
number: '01'
transition: fade
---
## The mental model

<p class="lead" style="margin-top:40px">Three pieces of API, one diagram, and the simplest form we can write.</p>

<!--
We start with the smallest possible signal form, then the picture we keep coming back to.
-->
---
layout: content
eyebrow: 'What is a signal form?'
heading: 'Three pieces'
clicks: 4
---
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:start;"> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="display:flex;gap:24px;align-items:stretch;" v-click="1"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">1</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({ email: <span style="color:#2FD8B4;">''</span>, password: <span style="color:#2FD8B4;">''</span> });</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="2"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">2</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(loginModel);</div> </div> </div> <div style="display:flex;gap:24px;align-items:stretch;" v-click="3"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;padding-top:34px;width:28px;">3</div> <div style="flex:1;background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:28px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px;display:flex;flex-direction:column;gap:22px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;">RUNNING</div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;white-space:nowrap;">sam.taylor@example.com<span style="color:#2FD8B4;">|</span></div> </div> <div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Password</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">••••••••</div> </div> <div style="border-top:1px solid #4A5568;padding-top:20px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.55;color:#5E6B7D;"> <div>loginModel().email</div> <div style="color:#2FD8B4;">"sam.taylor@example.com"</div> </div> </div> </div>
<div style="margin-top:48px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:500;color:#E8ECF2;" v-click="4">The model is the source of truth for the editable data.</div>

<!--
Three pieces. Data lives in a normal writable signal. We pass it to form(). We bind controls with [formField]. The important point: loginModel is not a separate DTO sitting beside the form - it is the actual editable data.
-->
---
layout: content
eyebrow: 'Mental model'
heading: 'The basic mental model'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;"> <div style="display:flex;flex-direction:column;align-items:center;gap:14px;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:999px;padding:18px 42px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">Model signal</div> <div style="font-size:30px;color:#8A97A8;">↓</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">form()</div> <div style="font-size:30px;color:#8A97A8;">↓</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:999px;padding:18px 42px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">FieldTree</div> <div style="font-size:30px;color:#8A97A8;">↓</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">[formField]</div> <div style="font-size:30px;color:#8A97A8;">↓</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:999px;padding:18px 42px;font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">UI control</div> </div> <div style="display:flex;flex-direction:column;gap:36px;"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">FIELDTREE</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">Provides form-specific state and behaviour.</p> </div> <p style="font-size:28px;line-height:1.45;margin:0;color:#5E6B7D;">Model and UI stay in sync in both directions. The FieldTree is the layer between them, not a second copy.</p> </div> </div>

<!--
This is the picture I want us to keep coming back to. We haven't explained FieldTree properly yet - that's intentional. For now, think of it as the form layer around the data.
-->
---
layout: content
eyebrow: 'Side by side'
heading: 'The same form in both APIs'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1400px;">We construct a separate control tree, then bind controls from that tree into the template.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:20px 36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:22px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div><span style="color:#8577CF;">readonly</span> <span>loginForm</span> = <span style="color:#8577CF;">new</span> FormGroup({</div> <div style="padding-left:1.2em;">email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div style="padding-left:1.2em;">password: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div>});</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:22px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>loginModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">email: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">password: <span style="color:#2FD8B4;">''</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">readonly</span> <span>loginForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.loginModel);</div> </div> </div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.email"</span> /&gt;</div> <div>&lt;input [formControl]=<span style="color:#3FBFA2;">"loginForm.controls.password"</span> /&gt;</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:28px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.email"</span> /&gt;</div> <div>&lt;input [formField]=<span style="color:#2FD8B4;">"loginForm.password"</span> /&gt;</div> </div> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.4;margin:40px 0 0;max-width:1500px;">The bigger difference appears when data needs to move into and out of forms, or when fields depend on other fields.</p>
<p style="font-size:30px;color:#5E6B7D;line-height:1.4;margin:40px 0 0;">And for a form this simple, there really isn't much wrong with this.</p>

<!--
At this point the main difference is architectural rather than dramatic. If all our forms were two inputs with no real behaviour, this workshop would be very short.

Anchor against something familiar. Do not mark anything red - we are not trying to make Reactive Forms look bad. For a form this simple there really isn't much wrong with this.
-->
---
layout: section
number: '02'
transition: fade
---
## Why another<br/>forms API?

<p class="lead" style="margin-top:40px">Where reactive forms make us do the work twice.</p>

<!--
Be careful with the framing throughout - the case is that signal forms remove work, not that reactive forms were bad.
-->
---
layout: content
eyebrow: 'Framing'
heading: 'Reactive Forms are not “bad”'
---
<div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:64px;"> <div style="border:1px solid #4A5568;border-radius:999px;padding:14px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;color:#8A97A8;">Mature</div> <div style="border:1px solid #4A5568;border-radius:999px;padding:14px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;color:#8A97A8;">Powerful</div> <div style="border:1px solid #4A5568;border-radius:999px;padding:14px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;color:#8A97A8;">Still supported</div> <div style="border:1px solid #4A5568;border-radius:999px;padding:14px 34px;font-family:'JetBrains Mono',monospace;font-size:25px;color:#8A97A8;">Widely understood</div> </div>
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#2FD8B4;margin-bottom:32px;">So what changes with Signal Forms?</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:34px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:40px;color:#2FD8B4;margin-bottom:18px;">1</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">Data has one authoritative model.</p> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:34px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:40px;color:#2FD8B4;margin-bottom:18px;">2</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">Form state is signal-based.</p> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:34px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:40px;color:#2FD8B4;margin-bottom:18px;">3</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">Relationships can be declarative.</p> </div> </div>

<!--
Angular did not need to replace Reactive Forms because forms suddenly stopped working. The question is what becomes simpler when forms participate naturally in Angular's signal-based state model.
-->
---
layout: content
eyebrow: 'The edit form'
heading: 'We fetch a user and show their values'
---
<div style="display:grid;grid-template-columns:0.85fr 1.15fr;gap:64px;align-items:center;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:44px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Name</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;margin-bottom:28px;">Sam Taylor</div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;margin-bottom:36px;">sam.taylor@example.com</div> <div style="background:#2FD8B4;color:#0A0D12;border-radius:8px;padding:16px 0;text-align:center;font-size:26px;font-weight:600;">Save</div> </div> <div style="display:flex;flex-direction:column;gap:36px;"> <div style="display:flex;gap:20px;align-items:center;font-family:'JetBrains Mono',monospace;font-size:26px;"> <span style="border:1px solid #2FD8B4;border-radius:8px;padding:14px 28px;color:#2FD8B4;">GET /user</span> <span style="color:#8A97A8;">→</span> <span style="color:#8A97A8;">the form shows current values</span> </div> <div style="display:flex;gap:20px;align-items:center;font-family:'JetBrains Mono',monospace;font-size:26px;"> <span style="border:1px solid #2FD8B4;border-radius:8px;padding:14px 28px;color:#2FD8B4;">PUT /user</span> <span style="color:#8A97A8;">←</span> <span style="color:#8A97A8;">the user's edits go back</span> </div> <p style="font-size:31px;color:#C9D4E2;line-height:1.45;margin:16px 0 0;">The work is in what we write between those two calls.</p> </div> </div>

<!--
Imagine an edit screen. We fetch a user from an API and the form shows their current values. The user edits, and we save. Everything that follows is about what happens between those two API calls.
-->
---
layout: content
eyebrow: 'Reactive Forms'
heading: 'Populate, edit, extract, merge'
---
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:56px;align-items:start;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;"> <div><span style="color:#8577CF;">readonly</span> <span>userForm</span> = <span style="color:#8577CF;">new</span> FormGroup({</div> <div style="padding-left:1.2em;">name: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div style="padding-left:1.2em;">email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>),</div> <div>});</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// later</div> <div><span style="color:#8577CF;">const</span> user = <span style="color:#8577CF;">await</span> api.getUser();</div> <div><span style="color:#8577CF;">this</span>.userForm.patchValue(user);</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// later</div> <div><span style="color:#8577CF;">await</span> api.update({</div> <div style="padding-left:1.2em;">...user,</div> <div style="padding-left:1.2em;">...<span style="color:#8577CF;">this</span>.userForm.getRawValue(),</div> <div>});</div> </div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#8A97A8;">GET /user</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:8px 26px;color:#B9A9FF;">patchValue()</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#8A97A8;">FormGroup - user edits</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:8px 26px;color:#B9A9FF;">getRawValue()</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:8px 26px;color:#B9A9FF;">map / merge</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#8A97A8;">PUT /user</div> </div> </div>

<!--
With Reactive Forms we commonly have application data representing the user and a separate control tree representing the editable form. We populate the tree, the user edits it, then we take values back out, often combine them with other application state, transform them, and send them back. Do not say Reactive Forms always have two sources of truth - say that real applications often end up maintaining two representations of the same data.
-->
---
layout: content
eyebrow: 'Signal Forms'
heading: 'The model is already the editable data'
---
<div style="display:grid;grid-template-columns:0.8fr 1.2fr;gap:56px;align-items:center;"> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#8A97A8;">GET /user</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #2FD8B4;border-radius:8px;padding:8px 26px;color:#2FD8B4;">model signal</div> <div style="color:#8A97A8;padding-left:22px;">↕</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#E8ECF2;">FieldTree</div> <div style="color:#8A97A8;padding-left:22px;">↕</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#E8ECF2;">UI</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:8px 26px;color:#8A97A8;">PUT /user</div> </div> <div style="display:flex;flex-direction:column;gap:28px;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>model</span> = <span style="color:#7CC4FF;">signal</span>({ name: <span style="color:#2FD8B4;">''</span>, email: <span style="color:#2FD8B4;">''</span> });</div> <div><span style="color:#8B7CF6;">readonly</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.model);</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// later</div> <div><span style="color:#8B7CF6;">this</span>.model.<span style="color:#7CC4FF;">set</span>(<span style="color:#8B7CF6;">await</span> api.getUser());</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// later</div> <div><span style="color:#8B7CF6;">await</span> api.<span style="color:#7CC4FF;">update</span>(<span style="color:#8B7CF6;">this</span>.model());</div> </div> <p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:0;">No patchValue. No getRawValue. No merge step to keep two representations aligned.</p> </div> </div>
<div style="margin-top:36px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:500;color:#E8ECF2;">Signal Forms do not maintain another copy of the form data.</div>

<!--
With Signal Forms the model signal is already the editable data. When API data arrives, update the model. When the user edits the form, the model changes. The FieldTree doesn't become a second store for the values.
-->
---
layout: content
eyebrow: 'Reactive state'
heading: 'One reactive model, not two'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1500px;">A control's value is not reactive on its own. Reading <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">userForm.value</code> gives a snapshot, so anything that has to respond to a change has to subscribe. In a component already built on <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">signal</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">computed</code>, the form ends up a separate reactive island.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:40px 44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:28px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;margin-bottom:26px;"> <div style="color:#5E6B7D;">// a snapshot, not a live value</div> <div><span style="color:#8577CF;">const</span> current = <span style="color:#8577CF;">this</span>.form.value;</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// so anything derived must subscribe</div> <div><span style="color:#8577CF;">this</span>.form.valueChanges</div> <div style="padding-left:1.2em;">.pipe(takeUntilDestroyed())</div> <div style="padding-left:1.2em;">.subscribe((v) =&gt; <span style="color:#8577CF;">this</span>.recalculate(v));</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.7;color:#8A97A8;border-top:1px solid #4A5568;padding-top:22px;"> <div>valueChanges  statusChanges</div> </div> <p style="font-size:25px;color:#5E6B7D;margin:22px 0 0;line-height:1.4;">Observable-based form state, plus a subscription and a teardown per dependency.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:40px 44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:28px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#C9D4E2;margin-bottom:26px;"> <div style="color:#5E6B7D;">// the value is a signal</div> <div>userForm.email().value()</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// so derived state is just a computed</div> <div><span style="color:#8B7CF6;">const</span> summary = <span style="color:#7CC4FF;">computed</span>(() =&gt;</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">describe</span>(userForm.email().value()),</div> <div>);</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.7;color:#E8ECF2;border-top:1px solid #4A5568;padding-top:22px;"> <div>value()  valid()  errors()  pending()</div> </div> <p style="font-size:25px;color:#8A97A8;margin:22px 0 0;line-height:1.4;">Signal-based form state. No subscription, no teardown.</p> </div> </div>

<!--
RxJS is not a problem. But forms become a different reactive island. A modern component already uses signal and computed.
-->
---
layout: section
number: '03'
transition: fade
---
## The FieldTree

<p class="lead" style="margin-top:40px">The structure that <code style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;">form()</code> hands back, and the state it carries.</p>

<!--
The FieldTree: what form() returns, what a node is, and what state it carries.
-->
---
layout: content
eyebrow: 'FieldTree'
heading: 'The FieldTree mirrors the model'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1500px;">A FieldTree is what <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">form()</code> returns. Its shape follows the model: if the model contains <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">address.city</code>, the form has <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">userForm.address.city</code>.</p>
<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:44px;align-items:center;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>userModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">name: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">address: {</div> <div style="padding-left:2.4em;">city: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:2.4em;">postcode: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">},</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">const</span> <span>profileForm</span> = <span style="color:#7CC4FF;">form</span>(profileModel);</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#2FD8B4;">→</div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.8;color:#E8ECF2;"> <div>userForm<span style="color:#5E6B7D;font-size:24px;">  FieldTree&lt;User&gt;</span></div> <div><span style="color:#8A97A8;">├──</span> name<span style="color:#5E6B7D;font-size:24px;">  FieldTree&lt;string&gt;</span></div> <div><span style="color:#8A97A8;">└──</span> address<span style="color:#5E6B7D;font-size:24px;">  FieldTree&lt;Address&gt;</span></div> <div><span style="color:#8A97A8;">    ├──</span> city<span style="color:#5E6B7D;font-size:24px;">  FieldTree&lt;string&gt;</span></div> <div><span style="color:#8A97A8;">    └──</span> postcode<span style="color:#5E6B7D;font-size:24px;">  FieldTree&lt;string&gt;</span></div> </div> </div>
<div style="margin-top:52px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:500;color:#E8ECF2;line-height:1.3;">The model owns the data. The FieldTree adds form state and behaviour to it.</div>

<!--
When we call form(), Angular gives us a FieldTree. The easiest way to understand it is that it mirrors the structure of our model. If the model is nested, the FieldTree is nested. It is not another copy of those values - it is the form layer over them.
-->
---
layout: content
eyebrow: 'FieldTree'
heading: 'FieldTree and FieldState'
---
<p style="font-size:31px;color:#8A97A8;line-height:1.4;margin:0 0 44px;max-width:1550px;">A node is an object that is also a function. Call it, and you get that field's state.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:stretch;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:16px;">FIELDTREE</div> <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#E8ECF2;margin-bottom:32px;">userForm.email</div> <div style="font-size:28px;line-height:1.45;color:#C9D4E2;display:flex;flex-direction:column;gap:20px;"> <div>The position in the tree. Its children are nodes too.</div> <div>This is what you hand to <code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#8A97A8;">[formField]</code>.</div> <div style="color:#5E6B7D;">No signals of its own.</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:16px;">FIELDSTATE</div> <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#E8ECF2;margin-bottom:32px;">userForm.email<span style="color:#2FD8B4;">()</span></div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.85;color:#C9D4E2;"> <div>.value()</div> <div>.valid()  .invalid()  .errors()  .pending()</div> <div>.dirty()  .touched()</div> <div>.hidden()  .disabled()  .disabledReasons()</div> <div>.readonly()  .required()  .errorSummary()  .submitting()</div> </div> <p style="font-size:26px;color:#8A97A8;line-height:1.4;margin:22px 0 0;">Signals, except <span style="color:#C9D4E2;">value</span> and <span style="color:#C9D4E2;">controlValue</span>, which are writable. There are methods too: <span style="color:#C9D4E2;">reset</span>, <span style="color:#C9D4E2;">markAsTouched</span>, <span style="color:#C9D4E2;">focusBoundControl</span>.</p> </div> </div>

<!--
A FieldTree node, like a signal, is an object that is also a function. The object is the position in the tree - you navigate through it and pass it to the directive. Calling it returns a FieldState, and every signal lives there, not on the node. Children are FieldTrees too, so userForm.address.city is a node in the same way.
-->
---
layout: content
eyebrow: 'FieldState'
heading: 'The value is the model, not a copy of it'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:40px 48px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.7;color:#C9D4E2;"> <div>userForm.name().value()  <span style="color:#2FD8B4;">≡</span>  userModel().name</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// writing through the field</div> <div style="color:#5E6B7D;">// writes the model signal</div> <div>userForm.name().value.<span style="color:#7CC4FF;">set</span>(<span style="color:#2FD8B4;">'Sam Taylor'</span>);</div> </div> <div style="display:flex;flex-direction:column;gap:30px;"> <p style="font-size:32px;color:#C9D4E2;line-height:1.45;margin:0;">Reading goes to the model signal. Writing goes to the model signal.</p> <p style="font-size:32px;color:#C9D4E2;line-height:1.45;margin:0;">They cannot drift apart, because there is only one signal. The form adds state around it rather than copying it.</p> </div> </div>

<!--
The one thing worth pausing on. value() on a FieldState is not a separate copy - reading it reads the model signal, writing through it writes the model signal. The docs put it plainly: form uses the given model as the source of truth and does not maintain its own copy of the data.
-->
---
layout: content
eyebrow: 'FieldTree'
heading: 'State aggregates upwards'
---
<div style="display:grid;grid-template-columns:0.9fr 1.1fr;gap:56px;align-items:center;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:40px;font-family:'JetBrains Mono',monospace;font-size:28px;line-height:1.9;color:#E8ECF2;display:grid;grid-template-columns:auto auto;justify-content:start;column-gap:48px;"> <div>userForm</div><div style="color:#FF7A6B;">✗</div> <div><span style="color:#8A97A8;">└──</span> address</div><div style="color:#FF7A6B;">✗</div> <div><span style="color:#8A97A8;">    ├──</span> city</div><div style="color:#2FD8B4;">✓</div> <div><span style="color:#8A97A8;">    └──</span> postcode</div><div style="color:#FF7A6B;">✗</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;line-height:2.1;color:#C9D4E2;"> <div>userForm.address.postcode().invalid() <span style="color:#FF7A6B;">true</span></div> <div>userForm.address().invalid() <span style="color:#FF7A6B;">true</span></div> <div>userForm().invalid() <span style="color:#FF7A6B;">true</span></div> </div> </div>

<!--
The same FieldState idea applies at every level. Nested objects aren't just an organisational convenience - state aggregates upwards through the FieldTree. If postcode is invalid, the address group is invalid, and the root form is invalid.
-->
---
layout: section
number: '04'
transition: fade
---
## Validation

<p class="lead" style="margin-top:40px">Where rules live, what you get out of the box, and when they run.</p>

<!--
The heart of the workshop: where rules live, what ships built in, when they run, and the conditional example that makes the case.
-->
---
layout: content
eyebrow: 'The schema'
heading: 'Rules live in the second argument'
---
<p style="font-size:31px;color:#8A97A8;line-height:1.4;margin:0 0 44px;max-width:1550px;">Everything in this act is declared in one function you hand to <code style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#2FD8B4;">form()</code>.</p>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:40px 48px;font-family:'JetBrains Mono',monospace;font-size:30px;line-height:1.7;color:#C9D4E2;margin-bottom:44px;"> <div><span style="color:#8B7CF6;">const</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(</div> <div style="padding-left:1.2em;">userModel,<span style="color:#5E6B7D;">   // the data</span></div> <div style="padding-left:1.2em;"><span style="background:#1E3A33;color:#2FD8B4;">(path) =&gt; { … }</span><span style="color:#5E6B7D;">   // the rules</span></div> <div>);</div> </div>
<div style="background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:36px 44px;display:flex;gap:32px;align-items:flex-start;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.14em;color:#8B7CF6;padding-top:6px;white-space:nowrap;">HEADS UP</div> <p style="font-size:31px;line-height:1.45;margin:0;color:#C9D4E2;">This callback runs <strong style="color:#E8ECF2;font-weight:600;">once</strong>, while the form is being constructed. It is not reactive like an <code style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#B9A9FF;">effect</code> - it does not rerun when values change. What you declare inside it is what the form has for its lifetime.</p> </div>

<!--
Before we get into paths: rules live in a function you pass as the second argument to form(). It runs once, while the form is being built. Everything in this act - validators, conditions, disabled and hidden, async checks - is declared in there. The callback receives paths to the fields, which is the next slide.
-->
---
layout: content
eyebrow: 'SchemaPath'
heading: 'SchemaPath describes where'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 34px;max-width:1550px;">The callback runs while the form is being constructed - before any FieldTree exists. A SchemaPath therefore holds no state and no values. It is an address, nothing more.</p>
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 44px;font-family:'JetBrains Mono',monospace;font-size:28px;line-height:1.65;color:#C9D4E2;margin-bottom:36px;"> <div><span style="color:#8B7CF6;">const</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(userModel, (schemaPath) =&gt; {</div> <div style="padding-left:2.4em;"><span style="color:#7CC4FF;">required</span>(<span style="background:#1E3A33;color:#2FD8B4;">schemaPath.email</span>);</div> <div>});</div> </div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#2FD8B4;margin-bottom:16px;">schemaPath.email</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">Exists only during construction. Says where a rule belongs. Carries no value, no validity, no interaction state.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#7CC4FF;margin-bottom:16px;">userForm.email</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">Exists after the form is built. Tells us what is happening at that location, as signals.</p> </div> </div>
<div style="margin-top:34px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:500;color:#E8ECF2;">SchemaPath describes where. FieldTree exposes runtime state.</div>

<!--
Another tree-shaped concept. The callback runs while the form is being built, before any FieldTree exists - so a SchemaPath cannot hold state or values. It is only an address. A rule attached to it says where it belongs; the FieldTree tells us what is happening there at runtime.
-->
---
layout: content
eyebrow: 'Validation'
heading: 'The toolbox'
---
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 44px;font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.65;color:#C9D4E2;margin-bottom:48px;"> <div><span style="color:#8B7CF6;">const</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(userModel, (p) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">required</span>(p.email);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">email</span>(p.email);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">minLength</span>(p.password, <span style="color:#8B7CF6;">8</span>);</div> <div>});</div> </div>
<div style="display:grid;grid-template-columns:1.3fr 1fr;gap:36px;"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:22px;">BUILT-IN SYNCHRONOUS</div> <div style="display:flex;gap:14px;flex-wrap:wrap;"> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">required</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">email</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">min / max</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">minDate / maxDate</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">minLength / maxLength</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:12px 24px;">pattern</span> </div> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:22px;">CUSTOM &amp; ADVANCED</div> <div style="display:flex;gap:14px;flex-wrap:wrap;"> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#B9A9FF;background:#12171F;border:1px solid #3A3057;border-radius:8px;padding:12px 24px;">validate</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#B9A9FF;background:#12171F;border:1px solid #3A3057;border-radius:8px;padding:12px 24px;">validateTree</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#B9A9FF;background:#12171F;border:1px solid #3A3057;border-radius:8px;padding:12px 24px;">validateAsync</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#B9A9FF;background:#12171F;border:1px solid #3A3057;border-radius:8px;padding:12px 24px;">validateHttp</span> <span style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#B9A9FF;background:#12171F;border:1px solid #3A3057;border-radius:8px;padding:12px 24px;">validateStandardSchema</span> </div> </div> </div>

<!--
We're not going to memorise this list. It is here so you know the toolbox exists. We'll learn the interesting APIs through requirements.
-->
---
layout: content
eyebrow: 'Validation'
heading: 'Simple validation was already simple'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:24px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.7;color:#8A97A8;"> <div>email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>, [</div> <div style="padding-left:1.2em;">Validators.required,</div> <div style="padding-left:1.2em;">Validators.email,</div> <div>]);</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:24px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.7;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">required</span>(p.email);</div> <div><span style="color:#7CC4FF;">email</span>(p.email);</div> </div> </div> </div>
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:52px 0 0;max-width:1500px;">Simple validation was already simple in Reactive Forms. The real difference appears once the rule depends on other state.</p>

<!--
A deliberately boring comparison. Simple validation was already simple. If this were the biggest improvement, it would not justify learning a new mental model. These functions are now tree shakable.
-->
---
layout: content
eyebrow: 'Execution model'
heading: 'The execution model'
---
<div style="display:grid;grid-template-columns:0.9fr 1.1fr;gap:64px;align-items:center;"> <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:25px;"> <div style="border:1px solid #4A5568;background:#0A0D12;border-radius:8px;padding:14px 28px;color:#E8ECF2;">Value changes<span style="color:#5E6B7D;">  (interactive fields)</span></div> <div style="color:#8A97A8;padding-left:24px;">↓</div> <div style="border:1px solid #4A5568;background:#0A0D12;border-radius:8px;padding:14px 28px;color:#E8ECF2;">Run synchronous rules</div> <div style="color:#8A97A8;padding-left:24px;">↓</div> <div style="border:1px solid #4A5568;background:#0A0D12;border-radius:8px;padding:14px 28px;color:#E8ECF2;">Collect <em>all</em> sync errors</div> <div style="color:#8A97A8;padding-left:24px;">↓</div> <div style="border:1px solid #8B7CF6;background:#0A0D12;border-radius:8px;padding:14px 28px;color:#B9A9FF;"><em>This field's</em> sync rules valid?</div> <div style="display:flex;gap:36px;padding-left:12px;"> <div style="color:#5E6B7D;">no → stop</div> <div style="color:#2FD8B4;">yes → async rules, pending()</div> </div> </div> <div style="display:flex;flex-direction:column;gap:32px;"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">ONE</div> <p style="font-size:31px;line-height:1.4;margin:0;color:#C9D4E2;">Synchronous validation does not stop after the first error. Multiple rules can produce errors at the same time.</p> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">TWO</div> <p style="font-size:31px;line-height:1.4;margin:0;color:#C9D4E2;">Async validation for a field only runs once that field's own synchronous rules pass. It is not a form-wide gate - a failing sibling does not hold it back.</p> </div> <p style="font-size:29px;line-height:1.4;margin:0;color:#5E6B7D;">Which leads to a useful distinction later: while async validation is pending, a field can be neither valid nor invalid.</p> </div> </div>

<!--
Two execution details. Sync validation does not stop after the first error. Async only runs once sync is passing. Don't fully explain the valid/invalid consequence yet - save it for the async footgun.
-->
---
layout: content
eyebrow: 'Validation errors'
heading: 'The message moves out of the template'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 26px;max-width:1550px;">Each error carries a <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">kind</code>, plus whatever message you gave the rule. Angular ships no default copy, so a generic loop needs every rule to supply one.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:stretch;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:24px;">BEFORE - A BRANCH PER KIND</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#8A97A8;"> <div style="color:#5E6B7D;">// component</div> <div>email: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>, [</div> <div style="padding-left:1.2em;">Validators.required,</div> <div style="padding-left:1.2em;">Validators.email,</div> <div>]);</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">&lt;!-- template --&gt;</div> <div>@if (email.hasError(<span style="color:#3FBFA2;">'required'</span>)) {</div> <div style="padding-left:1.2em;">&lt;p&gt;Email is required&lt;/p&gt;</div> <div>}</div> <div>@if (email.hasError(<span style="color:#3FBFA2;">'email'</span>)) {</div> <div style="padding-left:1.2em;">&lt;p&gt;Enter a valid email address&lt;/p&gt;</div> <div>}</div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:24px;">AFTER - THE RULE CARRIES IT</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.62;color:#C9D4E2;"> <div style="color:#5E6B7D;">// schema</div> <div><span style="color:#7CC4FF;">required</span>(p.email, {</div> <div style="padding-left:1.2em;">message: <span style="color:#2FD8B4;">'Email is required'</span>,</div> <div>});</div> <div><span style="color:#7CC4FF;">email</span>(p.email, {</div> <div style="padding-left:1.2em;">message: <span style="color:#2FD8B4;">'Enter a valid email address'</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">&lt;!-- template --&gt;</div> <div>@for (error of userForm.email().errors();</div> <div style="padding-left:1.2em;">track error) {</div> <div style="padding-left:1.2em;">&lt;p&gt;<span>{</span><span>{ error.message }</span><span>}</span>&lt;/p&gt;</div> <div>}</div> </div> </div> </div>
<div style="margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <p style="font-size:26px;color:#5E6B7D;margin:0;line-height:1.4;">The copy lives in the template, and the switch is rewritten in every form that uses the field.</p> <p style="font-size:26px;color:#8A97A8;margin:0;line-height:1.4;">One loop renders any rule - as long as every rule supplies a message, since none is provided by default.</p> </div>

<!--
Today the message usually lives in the template, one branch per error kind, repeated in every form that uses the field. In signal forms the copy moves into the rule definition, written once. Be precise: Angular ships no default messages - a rule declared without {message} produces an error whose message is undefined, and a generic loop then renders an empty element. The win is that errors are structured, not that they come pre-worded.
-->
---
layout: content
eyebrow: 'The requirement'
---
<div style="display:grid;grid-template-columns:1fr 0.8fr;gap:80px;align-items:center;"> <div> <h2 style="font-family:'Space Grotesk',sans-serif;font-size:64px;font-weight:600;letter-spacing:-0.025em;line-height:1.15;margin:0 0 40px;">If the user wants notifications, email is required.</h2> <p style="font-size:34px;color:#8A97A8;line-height:1.4;margin:0 0 56px;">If they don't, email is optional.</p> <p style="font-family:'Space Grotesk',sans-serif;font-size:42px;font-weight:500;color:#2FD8B4;margin:0;">How would we build this today?</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:44px;"> <div style="display:flex;align-items:center;gap:18px;margin-bottom:34px;"> <div style="width:30px;height:30px;border:2px solid #2FD8B4;border-radius:6px;background:#2FD8B4;display:flex;align-items:center;justify-content:center;color:#0A0D12;font-size:24px;font-weight:700;">✓</div> <div style="font-size:28px;color:#E8ECF2;">Notify me by email</div> </div> <div style="font-size:24px;color:#8A97A8;margin-bottom:12px;">Email</div> <div style="background:#0A0D12;border:1px solid #FF7A6B;border-radius:8px;padding:0 20px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;"></div> <div style="font-size:24px;color:#FF7A6B;margin-top:14px;">Email is required</div> </div> </div>

<!--
Pause here. Ask: how would we build this today?
-->
---
layout: content
eyebrow: 'Reactive Forms'
heading: 'Orchestrating the response'
---
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:start;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#8A97A8;"> <div>notify.valueChanges</div> <div style="padding-left:1.2em;">.pipe(</div> <div style="padding-left:2.4em;">startWith(notify.value),</div> <div style="padding-left:2.4em;">takeUntilDestroyed(),</div> <div style="padding-left:1.2em;">)</div> <div style="padding-left:1.2em;">.subscribe((shouldNotify) =&gt; {</div> <div style="padding-left:2.4em;"><span style="color:#8577CF;">if</span> (shouldNotify) {</div> <div style="padding-left:3.6em;">email.addValidators(Validators.required);</div> <div style="padding-left:2.4em;">} <span style="color:#8577CF;">else</span> {</div> <div style="padding-left:3.6em;">email.removeValidators(Validators.required);</div> <div style="padding-left:2.4em;">}</div> <div style="height:0.85em;"></div> <div style="padding-left:2.4em;">email.updateValueAndValidity();</div> <div style="padding-left:1.2em;">});</div> </div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;padding-top:8px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#8A97A8;">notify changed</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#8A97A8;">listen for the change</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#8A97A8;">inspect the new value</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#8A97A8;">mutate email's validators</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#8A97A8;">tell email to recalculate</div> </div> </div>

<!--
Reveal line by line. This code isn't especially difficult. But look at what we're doing conceptually. Do not over-focus on line count - the benefit is the change in mental model.
-->
---
layout: content
eyebrow: 'Signal Forms'
heading: 'Describe the rule'
clicks: 2
---
<div class="code-hero">

````md magic-move
```ts
notify.valueChanges
  .pipe(
    startWith(notify.value),
    takeUntilDestroyed(),
  )
  .subscribe((shouldNotify) => {
    if (shouldNotify) {
      email.addValidators(Validators.required);
    } else {
      email.removeValidators(Validators.required);
    }

    email.updateValueAndValidity();
  });
```

```ts
required(p.email, {
  when: ({ valueOf }) => valueOf(p.notify),
});
```
````

</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-bottom:48px;" v-click="2"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:18px;">REACTIVE FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#8A97A8;">listen → inspect → mutate → recalculate</div> </div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 36px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:18px;">SIGNAL FORMS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#E8ECF2;">describe the relationship</div> </div> </div>
<div style="border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:500;color:#E8ECF2;" v-click="2">Describe the rule instead of orchestrating the response.</div>


<!--
One of the most important scenes in the presentation. We don't subscribe. We don't add a validator. We don't remove one. We don't tell email to recalculate. We describe the rule.
-->
---
layout: content
eyebrow: 'Conditional logic'
heading: 'One rule, or a set of rules'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 40px;max-width:1550px;">All built-in validation rules take an options object for messages and conditional logic, so <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">when</code> is not special to <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">required</code>. What differs is scope.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:stretch;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:24px;">GATE A SINGLE RULE</div> <div style="font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">minLength</span>(p.promoCode, <span style="color:#8B7CF6;">6</span>, {</div> <div style="padding-left:1.2em;">when: ({ valueOf }) =&gt; valueOf(p.applyDiscount),</div> <div>});</div> </div> <p style="font-size:27px;color:#8A97A8;margin:26px 0 0;line-height:1.4;">The rule only runs when the predicate returns true.</p> </div> <div style="background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:24px;">APPLY A GROUP OF RULES</div> <div style="font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.8;color:#E8ECF2;"> <div>applyWhen(…)</div> <div>applyWhenValue(…)</div> </div> <p style="font-size:27px;color:#8A97A8;margin:26px 0 0;line-height:1.4;"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;">applyWhen</code> activates a set of rules from reactive form state, including other fields. <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">applyWhenValue</code> keys off the field's own value.</p> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:36px 0 0;max-width:1550px;">Reach for the schema-composition functions when the condition governs more than one rule - not because <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">when</code> is missing.</p>

<!--
All built-in validation rules take an options object for messages and conditional logic, so when is available on them - not just on required. The real distinction is scope: when gates a single rule, applyWhen and applyWhenValue apply a group of rules or a whole schema.
-->
---
layout: content
eyebrow: 'applyWhen'
heading: 'A whole rule set, conditionally'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 44px;max-width:1400px;">When notifications are enabled: email is required, must be valid, and must be at most 200 characters.</p>
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:start;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">applyWhen</span>(</div> <div style="padding-left:1.2em;">p.email,</div> <div style="padding-left:1.2em;">({ valueOf }) =&gt; valueOf(p.notify),</div> <div style="padding-left:1.2em;">(emailPath) =&gt; {</div> <div style="padding-left:2.4em;"><span style="color:#7CC4FF;">required</span>(emailPath);</div> <div style="padding-left:2.4em;"><span style="color:#7CC4FF;">email</span>(emailPath);</div> <div style="padding-left:2.4em;"><span style="color:#7CC4FF;">maxLength</span>(emailPath, <span style="color:#8B7CF6;">200</span>);</div> <div style="padding-left:1.2em;">},</div> <div>);</div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px;"> <div style="display:flex;align-items:center;gap:16px;margin-bottom:30px;"> <div style="width:28px;height:28px;border:2px solid #2FD8B4;border-radius:6px;background:#2FD8B4;display:flex;align-items:center;justify-content:center;color:#0A0D12;font-size:24px;font-weight:700;">✓</div> <div style="font-size:26px;color:#E8ECF2;">Notify me by email</div> </div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:24px;"></div> <div style="display:flex;gap:10px;flex-wrap:wrap;"> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;border:1px solid #2FD8B4;border-radius:999px;padding:8px 18px;">required</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;border:1px solid #2FD8B4;border-radius:999px;padding:8px 18px;">email</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;border:1px solid #2FD8B4;border-radius:999px;padding:8px 18px;">maxLength 200</span> </div> <p style="font-size:24px;color:#5E6B7D;margin:24px 0 0;line-height:1.4;">With Notify off, none of these rules apply.</p> </div> </div>

<!--
Now the condition controls an entire schema fragment. When notify toggles off, the three rule badges fade out beside the field.
-->
---
layout: content
eyebrow: 'applyWhenValue'
heading: 'Conditions on the field''s own value'
---
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:44px 52px;font-family:'JetBrains Mono',monospace;font-size:34px;line-height:1.65;color:#C9D4E2;margin-bottom:48px;"> <div><span style="color:#7CC4FF;">applyWhenValue</span>(</div> <div style="padding-left:1.2em;">p.payment,</div> <div style="padding-left:1.2em;">(payment): payment <span style="color:#8B7CF6;">is</span> CreditCardPayment =&gt;</div> <div style="padding-left:2.4em;">payment.type === <span style="color:#2FD8B4;">'credit-card'</span>,</div> <div style="padding-left:1.2em;">creditCardSchema,</div> <div>);</div> </div>
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0;max-width:1500px;">Narrowing only happens if the predicate is a type guard. A plain boolean predicate resolves to the other overload and the schema stays typed to the union.</p>

<!--
The related API when the condition is based on the field's own value. Narrowing is the reason to reach for it, but only a type-guard predicate gets you there - written as a plain boolean it resolves to the non-narrowing overload. I wouldn't use it in every small form.
-->
---
layout: content
eyebrow: 'Rule context'
heading: 'What a rule can read'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#2FD8B4;margin-bottom:16px;">value</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">The value signal for the field this rule applies to.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#2FD8B4;margin-bottom:16px;">valueOf(path)</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">Reads another field's value and establishes a reactive dependency on it.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#2FD8B4;margin-bottom:16px;">stateOf(path)</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">A read-only view of another field's state - you cannot write through it.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:32px;color:#2FD8B4;margin-bottom:16px;">fieldTreeOf(path)</div> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">The runtime FieldTree associated with another SchemaPath.</p> </div> </div>
<div style="margin-top:44px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;"> <span style="font-size:26px;color:#5E6B7D;">Also available:</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8A97A8;border:1px solid #4A5568;border-radius:999px;padding:10px 24px;">state</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8A97A8;border:1px solid #4A5568;border-radius:999px;padding:10px 24px;">fieldTree</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8A97A8;border:1px solid #4A5568;border-radius:999px;padding:10px 24px;">pathKeys</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#B9A9FF;border:1px solid #8B7CF6;border-radius:999px;padding:10px 24px;">key - child paths only</span> <span style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#B9A9FF;border:1px solid #8B7CF6;border-radius:999px;padding:10px 24px;">index - array items only</span> </div>

<!--
Rules often need more than the field they're attached to. Four APIs to remember. key, index and pathKeys matter in advanced reusable rules but we won't make them central today.
-->
---
layout: content
eyebrow: 'Cross-field · reactive forms'
heading: 'A validator that sees more than one control'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1550px;">Confirm password must match password. A control validator only sees its own control, so the rule has to move up to the group.</p>
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:56px;align-items:center;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:38px 44px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.7;color:#8A97A8;"> <div style="color:#5E6B7D;">// a group-level validator</div> <div><span style="color:#8577CF;">const</span> passwordsMatch: ValidatorFn = (group) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">const</span> pw = group.get(<span style="color:#3FBFA2;">'password'</span>)?.value;</div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">const</span> confirm = group.get(<span style="color:#3FBFA2;">'confirmPassword'</span>)?.value;</div> <div style="height:0.85em;"></div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">return</span> pw === confirm</div> <div style="padding-left:2.4em;">? <span style="color:#8577CF;">null</span></div> <div style="padding-left:2.4em;">: { passwordMismatch: <span style="color:#8577CF;">true</span> };</div> <div>};</div> <div style="height:0.85em;"></div> <div><span style="color:#8577CF;">readonly</span> form = <span style="color:#8577CF;">new</span> FormGroup(</div> <div style="padding-left:1.2em;">{ … },</div> <div style="padding-left:1.2em;">{ validators: passwordsMatch },</div> <div>);</div> </div> <div style="display:flex;flex-direction:column;gap:34px;"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">THE RULE MOVES UP</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">The logic lives on the group, one level away from the field it is really about.</p> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">SO DOES THE ERROR</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">It lands on the group, so the template reaches up to render it beside the confirm input.</p> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">AND THE FIELD LOOKS FINE</div> <p style="font-size:30px;line-height:1.4;margin:0;color:#C9D4E2;">The confirm control itself stays valid, because nothing failed on it.</p> </div> </div> </div>

<!--
The requirement: confirm password must match password. In Reactive Forms this is a group-level validator, because a control validator only sees its own control. The error then lands on the group, not on the field the user is looking at, so the template has to reach up to the group to display it.
-->
---
layout: content
eyebrow: 'Cross-field · signal forms'
heading: 'The rule stays on the field it belongs to'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 34px;max-width:1550px;">The rule attaches to <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">confirmPassword</code> and reaches sideways for the other value, so the error lands where the user is looking.</p>
<div style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:52px;align-items:start;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">validate</span>(p.confirmPassword, ({ value, valueOf }) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">if</span> (<span style="background:#1E3A33;color:#2FD8B4;">value()</span> === <span style="background:#2A2445;color:#B9A9FF;">valueOf(p.password)</span>) {</div> <div style="padding-left:2.4em;"><span style="color:#8B7CF6;">return</span> <span style="color:#8B7CF6;">null</span>;</div> <div style="padding-left:1.2em;">}</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">return</span> {</div> <div style="padding-left:2.4em;">kind: <span style="color:#2FD8B4;">'passwordMismatch'</span>,</div> <div style="padding-left:2.4em;">message: <span style="color:#2FD8B4;">'Passwords do not match'</span>,</div> <div style="padding-left:1.2em;">};</div> <div>});</div> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:36px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Password</div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;margin-bottom:26px;">••••••••</div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Confirm password</div> <div style="background:#12171F;border:1px solid #FF7A6B;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;">•••••••x</div> <div style="font-size:24px;color:#FF7A6B;margin-top:14px;">Passwords do not match</div> </div> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:34px 0 0;max-width:1600px;"><code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">value()</code> is the field being validated. <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#B9A9FF;">valueOf(p.password)</code> reads another field and establishes a dependency on it, so editing either password reruns this rule.</p>

<!--
This is where the context API becomes concrete. value() is the field we're validating; valueOf(p.password) reads another field and establishes a dependency on it. Point out that editing the original password reruns this rule, even though confirm itself did not change. We don't subscribe to password and manually revalidate - the dependency is part of the rule.
-->
---
layout: section
number: '05'
transition: fade
---
## Availability<br/>and async

<p class="lead" style="margin-top:40px">Hidden, disabled, readonly - and validation that has to leave the browser.</p>

<!--
Hidden, disabled and readonly, then validation that has to leave the browser.
-->
---
layout: content
eyebrow: 'Availability'
heading: 'Country changes. What should happen to State?'
---
<div style="display:grid;grid-template-columns:0.62fr 1.38fr;gap:56px;align-items:center;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Country</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;margin-bottom:12px;"><span>United Kingdom</span><span style="color:#5E6B7D;">▾</span></div> <div style="font-size:24px;color:#2FD8B4;margin-bottom:26px;">was “United States”</div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">State</div> <div style="background:#0A0D12;border:1px dashed #FF7A6B;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;"><span>California</span><span style="color:#8A97A8;">▾</span></div> <div style="font-size:24px;color:#FF7A6B;margin-top:12px;">no longer applies - but what does that mean?</div> </div> <div> <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:32px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:30px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#2FD8B4;margin-bottom:16px;">hidden</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Irrelevant to the current form state.</p> </div> <div style="background:#12171F;border:1px solid #8B7CF6;border-radius:14px;padding:30px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#B9A9FF;margin-bottom:16px;">disabled</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Visible but unavailable. Its <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">when</code> can return a string - the reason, readable via <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">disabledReasons()</code>.</p> </div> <div style="background:#12171F;border:1px solid #7CC4FF;border-radius:14px;padding:30px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#7CC4FF;margin-bottom:16px;">readonly</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Visible and readable, but not editable.</p> </div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:30px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">hidden</span>(p.state, {</div> <div style="padding-left:1.2em;">when: ({ valueOf }) =&gt; valueOf(p.country) !== <span style="color:#2FD8B4;">'US'</span>,</div> <div>});</div> </div> <p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:28px 0 0;">All three are non-interactive from the form's perspective and do not contribute to parent validation while active.</p> </div> </div>

<!--
Not every conditional field should be treated the same way. The address form has Country and State. The user switches Country from United States to United Kingdom - State no longer applies. Should it disappear because it is irrelevant, stay visible but unavailable, or stay readable but not editable? These three have different semantics, and all three are non-interactive from the form's perspective.
-->
---
layout: content
eyebrow: 'Footgun'
heading: 'Why is the control still here?'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;"> <div style="background:#12171F;border:1px solid #FF7A6B;border-radius:14px;padding:40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;margin-bottom:30px;">userForm.state().hidden() <span style="color:#FF7A6B;">true</span></div> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">State</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:16px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;">California</div> <p style="font-size:25px;color:#FF7A6B;margin:24px 0 0;">… still rendered.</p> </div> <div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.65;color:#C9D4E2;"> <div>@<span style="color:#8B7CF6;">if</span> (!userForm.state().hidden()) {</div> <div style="padding-left:1.2em;">&lt;select [formField]=<span style="color:#2FD8B4;">"userForm.state"</span>&gt;&lt;/select&gt;</div> <div>}</div> </div> <p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:36px 0 0;">If a field may be hidden, your template still needs to decide whether to render it.</p> </div> </div>

<!--
Important footgun. hidden() sets form state. It does not remove the control from your template.
-->
---
layout: content
eyebrow: 'Availability'
heading: 'Hidden does not mean deleted.'
---
<div style="display:flex;gap:36px;align-items:center;margin-bottom:52px;"> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:32px 40px;font-family:'JetBrains Mono',monospace;font-size:28px;color:#5E6B7D;">State field hidden</div> <div style="font-size:36px;color:#8A97A8;">→</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 40px;font-family:'JetBrains Mono',monospace;font-size:28px;color:#E8ECF2;">model().state <span style="color:#2FD8B4;">"CA"</span></div> </div>
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0 0 36px;max-width:1600px;">If a field becomes hidden, disabled or readonly, its value stays in the model. Deciding what to send is yours to make.</p>
<div style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:44px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:30px 36px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#C9D4E2;"> <div style="color:#5E6B7D;">// from @angular/forms/signals/compat</div> <div><span style="color:#8B7CF6;">const</span> payload = <span style="color:#7CC4FF;">extractValue</span>(userForm, { enabled: <span style="color:#8B7CF6;">true</span> });</div> <div><span style="color:#8B7CF6;">const</span> patch = <span style="color:#7CC4FF;">extractValue</span>(userForm, { dirty: <span style="color:#8B7CF6;">true</span> });</div> </div> <div style="background:#12171F;border:1px solid #FF7A6B;border-radius:14px;padding:26px 34px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.14em;color:#FF7A6B;margin-bottom:14px;">BUT NOT THIS CASE</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;"><code style="font-family:'JetBrains Mono',monospace;font-size:24px;">enabled</code> means <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">!disabled()</code>. Hidden fields are not disabled, so <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">state: "CA"</code> is still included. Pair <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">hidden()</code> with <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">disabled()</code> if it must not be sent.</p> </div> </div>

<!--
Availability state does not erase the model value. The form stops considering that field for parent validation, but the data is still there. This is one reason your form model and API DTO do not always have to be the same shape.
-->
---
layout: content
eyebrow: 'Async validation'
heading: 'Username availability, today'
---
<div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:52px;align-items:center;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.7;color:#8A97A8;"> <div><span style="color:#8577CF;">const</span> usernameTaken: AsyncValidatorFn = (control) =&gt;</div> <div style="padding-left:1.2em;">control.valueChanges.pipe(</div> <div style="padding-left:2.4em;">debounceTime(<span style="color:#8577CF;">300</span>),</div> <div style="padding-left:2.4em;">distinctUntilChanged(),</div> <div style="padding-left:2.4em;">switchMap((value) =&gt; api.checkUsername(value)),</div> <div style="padding-left:2.4em;">map((res) =&gt;</div> <div style="padding-left:3.6em;">res.available ? <span style="color:#8577CF;">null</span> : { usernameTaken: <span style="color:#8577CF;">true</span> },</div> <div style="padding-left:2.4em;">),</div> <div style="padding-left:2.4em;">catchError(() =&gt; of(<span style="color:#8577CF;">null</span>)),</div> <div style="padding-left:2.4em;">first(),</div> <div style="padding-left:1.2em;">);</div> <div style="height:0.85em;"></div> <div>username: <span style="color:#8577CF;">new</span> FormControl(<span style="color:#3FBFA2;">''</span>, {</div> <div style="padding-left:1.2em;">asyncValidators: [usernameTaken],</div> <div>});</div> </div> <div style="display:flex;flex-direction:column;gap:22px;"> <div style="display:flex;flex-direction:column;gap:2px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:5px 22px;color:#8A97A8;">valueChanges</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:5px 22px;color:#8A97A8;">debounceTime</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:5px 22px;color:#8A97A8;">distinctUntilChanged</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:5px 22px;color:#8A97A8;">switchMap</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:5px 22px;color:#8A97A8;">HTTP request</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:5px 22px;color:#B9A9FF;">manage error state</div> <div style="color:#8A97A8;padding-left:22px;font-size:24px;line-height:1.1;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:5px 22px;color:#B9A9FF;">Angular tracks pending</div> </div> <p style="font-size:29px;color:#C9D4E2;line-height:1.45;margin:0;">Valid RxJS - but the debouncing and the stale-response handling are plumbing. What we are modelling is one asynchronous validation rule.</p> </div> </div>

<!--
Check whether a username is available. That is valid RxJS and it does work - Angular subscribes before valueChanges emits, so four rapid keystrokes produce one request. Do not claim it never fires. What is true: distinctUntilChanged and switchMap cancellation are dead code here, since first() completes the observable after one emission; and Angular manages pending for an AsyncValidatorFn, we do not. The real trap is that any update made with emitEvent false strands the control in PENDING forever - which is exactly the edit-form load pattern from earlier.
-->
---
layout: content
eyebrow: 'validateHttp'
heading: 'Async validation as a rule'
---
<div style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:52px;align-items:start;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">validateHttp</span>(p.username, {</div> <div style="padding-left:1.2em;">debounce: <span style="color:#8B7CF6;">300</span>,</div> <div style="padding-left:1.2em;">request: ({ value }) =&gt; ({</div> <div style="padding-left:2.4em;">url: <span style="color:#2FD8B4;">`/api/users/${value()}/available`</span>,</div> <div style="padding-left:1.2em;">}),</div> <div style="padding-left:1.2em;">onSuccess: (result: { available: <span style="color:#8B7CF6;">boolean</span> }) =&gt;</div> <div style="padding-left:2.4em;">result.available</div> <div style="padding-left:3.6em;">? <span style="color:#8B7CF6;">null</span></div> <div style="padding-left:3.6em;">: {</div> <div style="padding-left:4.8em;">kind: <span style="color:#2FD8B4;">'usernameTaken'</span>,</div> <div style="padding-left:4.8em;">message: <span style="color:#2FD8B4;">'Username is already taken'</span>,</div> <div style="padding-left:3.6em;">},</div> <div style="padding-left:1.2em;">onError: () =&gt; <span style="color:#8B7CF6;">null</span>,</div> <div>});</div> </div> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:30px 32px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Username</div> <div style="background:#0A0D12;border:1px solid #8B7CF6;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;">samt_</div> <div style="font-size:24px;color:#B9A9FF;margin-top:12px;">Checking…</div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:30px 32px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Username</div> <div style="background:#0A0D12;border:1px solid #FF7A6B;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;">samtaylor</div> <div style="font-size:24px;color:#FF7A6B;margin-top:12px;">Username is already taken</div> </div> </div> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:36px 0 0;max-width:1550px;">While it runs, the field exposes <code style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#2FD8B4;">pending()</code>. Stale work is handled by the resource-based validation mechanism, and async validation only starts once synchronous validation is passing.</p>

<!--
onError is required, not optional - an HTTP or network failure has to be turned into a validation outcome explicitly, so the field cannot sit in limbo when the check itself fails. onSuccess receives the response, so annotate it or pass type arguments; TResult defaults to unknown.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">FOOTGUN</div> <div style="flex:1;height:1px;background:#3A2A28;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">VALID VS INVALID</div> </div>
<p style="font-size:34px;color:#8A97A8;line-height:1.4;margin:0 0 48px;">Async validation is currently running. No validator has failed yet.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:52px;"> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:40px;text-align:center;"> <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#C9D4E2;margin-bottom:20px;">valid()</div> <div style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#5E6B7D;">false</div> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:40px;text-align:center;"> <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#C9D4E2;margin-bottom:20px;">invalid()</div> <div style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#5E6B7D;">false</div> </div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:40px;text-align:center;"> <div style="font-family:'JetBrains Mono',monospace;font-size:34px;color:#C9D4E2;margin-bottom:20px;">pending()</div> <div style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#2FD8B4;">true</div> </div> </div>
<div style="border-left:4px solid #FF7A6B;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:500;color:#E8ECF2;">Do not assume <code style="font-family:'JetBrains Mono',monospace;font-size:36px;">invalid() === !valid()</code>.</div>

<!--
Pose the three questions, pause a beat, then reveal.
-->
---
layout: content
eyebrow: 'Debounce'
heading: 'Two different kinds of debounce'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8A97A8;margin-bottom:28px;">FIELD DEBOUNCE</div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;margin-bottom:30px;"> <div style="color:#C9D4E2;">UI control value</div> <div style="color:#8A97A8;">↓</div> <div style="color:#8B7CF6;">300 ms</div> <div style="color:#8A97A8;">↓</div> <div style="color:#C9D4E2;">model value</div> <div style="color:#8A97A8;">↓</div> <div style="color:#C9D4E2;">everything downstream</div> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:20px 24px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;"><span style="color:#7CC4FF;">debounce</span>(p.username, <span style="color:#8B7CF6;">300</span>);</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:28px;">VALIDATOR DEBOUNCE</div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;margin-bottom:30px;"> <div style="color:#C9D4E2;">model updates immediately</div> <div style="color:#8A97A8;">↓</div> <div style="color:#C9D4E2;">sync validation immediately</div> <div style="color:#8A97A8;">↓</div> <div style="color:#8B7CF6;">300 ms</div> <div style="color:#8A97A8;">↓</div> <div style="color:#C9D4E2;">HTTP validation</div> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:20px 24px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;"><span style="color:#7CC4FF;">validateHttp</span>(p.username, { debounce: <span style="color:#8B7CF6;">300</span>, request, onSuccess, onError });</div> </div> </div>
<p style="font-size:29px;color:#8A97A8;line-height:1.45;margin:40px 0 0;max-width:1550px;">Immediate required and min-length feedback, without a server request on every keystroke: debounce the validator, not the whole field.</p>

<!--
If you want required and min-length feedback immediately while avoiding a server request on every keystroke, debounce the validator, not the whole field.
-->
---
layout: section
number: '06'
transition: fade
---
## Structure

<p class="lead" style="margin-top:40px">Nested objects, reusable schemas, dynamic arrays, and what reset actually means.</p>

<!--
Nesting, reusable schemas, Zod interop, arrays and reset.
-->
---
layout: content
eyebrow: 'Nested data'
heading: 'Nested objects are just nested data'
---
<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:44px;align-items:center;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>profileModel</span> = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">name: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">address: {</div> <div style="padding-left:2.4em;">line1: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:2.4em;">city: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:2.4em;">postcode: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">},</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">const</span> <span>profileForm</span> = <span style="color:#7CC4FF;">form</span>(profileModel);</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#2FD8B4;">→</div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.8;color:#E8ECF2;"> <div>profileForm</div> <div><span style="color:#8A97A8;">├──</span> name</div> <div><span style="color:#8A97A8;">└──</span> address</div> <div><span style="color:#8A97A8;">    ├──</span> line1</div> <div><span style="color:#8A97A8;">    ├──</span> city</div> <div><span style="color:#8A97A8;">    └──</span> postcode</div> </div> </div>
<p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:48px 0 0;max-width:1500px;">We don't separately construct a nested <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">FormGroup</code> hierarchy.</p>

<!--
Nested Signal Forms are not a separate feature. The data structure already defines the hierarchy.
-->
---
layout: content
eyebrow: 'Reusable schemas'
heading: 'Define behaviour once, apply it where needed'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">const</span> <span>addressSchema</span> = <span style="color:#7CC4FF;">schema</span>&lt;Address&gt;((p) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">required</span>(p.line1);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">required</span>(p.city);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">required</span>(p.postcode);</div> <div>});</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">form</span>(model, (p) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">apply</span>(p.billingAddress, addressSchema);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">apply</span>(p.shippingAddress, addressSchema);</div> <div>});</div> </div> </div>
<div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin:52px 0 22px;">COMPOSITION PRIMITIVES</div>
<div style="display:flex;gap:14px;flex-wrap:wrap;"> <span style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:14px 28px;">schema()</span> <span style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:14px 28px;">apply()</span> <span style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:14px 28px;">applyEach()</span> <span style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:14px 28px;">applyWhen()</span> <span style="font-family:'JetBrains Mono',monospace;font-size:26px;color:#C9D4E2;background:#12171F;border:1px solid #4A5568;border-radius:8px;padding:14px 28px;">applyWhenValue()</span> </div>

<!--
We don't want every form to become one enormous schema callback. Think of these as composition primitives, not a list to memorise.
-->
---
layout: content
eyebrow: 'Standard Schema'
heading: 'Bring a Zod schema you already have'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Signal Forms supports libraries conforming to <a href="https://standardschema.dev/">Standard Schema</a> - Zod, Valibot - through <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">validateStandardSchema</code>.</p>
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:center;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">import</span> * <span style="color:#8B7CF6;">as</span> z <span style="color:#8B7CF6;">from</span> <span style="color:#2FD8B4;">'zod'</span>;</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">const</span> <span>zodUserSchema</span> = z.<span style="color:#7CC4FF;">object</span>({</div> <div style="padding-left:1.2em;">email: z.<span style="color:#7CC4FF;">email</span>(),</div> <div style="padding-left:1.2em;">password: z.<span style="color:#7CC4FF;">string</span>().<span style="color:#7CC4FF;">min</span>(<span style="color:#8B7CF6;">8</span>),</div> <div>});</div> <div style="height:0.85em;"></div> <div><span style="color:#8B7CF6;">const</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(model, (p) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">validateStandardSchema</span>(p, zodUserSchema);</div> <div>});</div> </div> <div style="display:flex;flex-direction:column;gap:30px;"> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">ONE DEFINITION</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">The schema that already validates the API payload can drive the form too.</p> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">APPLIES AT ANY PATH</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Pass the root path or a subtree, exactly like the built-in rules.</p> </div> <div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:12px;">CAN BE DYNAMIC</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#C9D4E2;">Pass a function of the field context instead of a static schema. A zero-argument signal satisfies it, which is why <span style="color:#8A97A8;">() =&gt; this.schema()</span> works.</p> </div> </div> </div>

<!--
Signal Forms has built-in support for libraries that conform to Standard Schema, like Zod and Valibot, through validateStandardSchema. If a team already has Zod schemas for API payloads, they can drive form validation from the same definition. The second argument is a schema or a function of the field context - not a Signal type. A zero-argument signal is structurally assignable, which is why passing one works, but there is no Signal overload to look for.
-->
---
layout: content
eyebrow: 'Arrays'
heading: 'Where did <code style="font-family:''JetBrains Mono'',monospace;font-size:50px;color:#8A97A8;">FormArray</code> go?'
---
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:52px;align-items:start;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.62;color:#C9D4E2;"> <div>contactModel.<span style="color:#7CC4FF;">update</span>((value) =&gt; ({</div> <div style="padding-left:1.2em;">...value,</div> <div style="padding-left:1.2em;">contacts: [</div> <div style="padding-left:2.4em;">...value.contacts,</div> <div style="padding-left:2.4em;">{ name: <span style="color:#2FD8B4;">''</span>, email: <span style="color:#2FD8B4;">''</span> },</div> <div style="padding-left:1.2em;">],</div> <div>}));</div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:20px;">CONTACT 1</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:12px;">Name</div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:26px;">Email</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;margin-bottom:20px;">CONTACT 2</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:12px;">Name</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;margin-bottom:24px;">Email</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 18px;text-align:center;font-size:24px;color:#8A97A8;">+ Add contact</div> </div> </div>
<div style="margin-top:44px;border-left:4px solid #2FD8B4;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:34px;font-weight:500;color:#E8ECF2;">There is no second array-shaped control structure to synchronise.</div>

<!--
One of my favourite examples of the model-driven approach. There is no separate FormArray to grow. The array in the model is the array.
-->
---
layout: content
eyebrow: 'applyEach'
heading: 'One schema for every item'
---
<div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:48px 56px;font-family:'JetBrains Mono',monospace;font-size:36px;line-height:1.6;color:#E8ECF2;margin-bottom:52px;"> <div><span style="color:#7CC4FF;">applyEach</span>(p.contacts, (contact) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">required</span>(contact.name);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">email</span>(contact.email);</div> <div>});</div> </div>
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:0;max-width:1500px;">That also applies to items added later. Press Add, and the new item already has its rules.</p>

<!--
applyEach describes the schema for every item, including items added later. We don't create new controls and attach validators every time the user presses Add.
-->
---
layout: content
eyebrow: 'Array identity'
heading: 'Array item identity'
---
<div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:start;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:34px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin-bottom:24px;">BEFORE REORDER</div> <div style="font-family:'JetBrains Mono',monospace;font-size:25px;line-height:2;color:#C9D4E2;"> <div>0  Alice   dirty <span style="color:#2FD8B4;">✓</span>  touched <span style="color:#2FD8B4;">✓</span></div> <div>1  Bob     dirty <span style="color:#5E6B7D;">✗</span>  touched <span style="color:#5E6B7D;">✗</span></div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#5E6B7D;margin:34px 0 24px;">AFTER REORDER</div> <div style="font-family:'JetBrains Mono',monospace;font-size:25px;line-height:2;color:#C9D4E2;"> <div>0  Bob     dirty <span style="color:#5E6B7D;">✗</span>  touched <span style="color:#5E6B7D;">✗</span></div> <div>1  Alice   dirty <span style="color:#2FD8B4;">✓</span>  touched <span style="color:#2FD8B4;">✓</span></div> </div> <p style="font-size:26px;color:#8A97A8;margin:30px 0 0;line-height:1.4;">Alice's state moves with Alice.</p> </div> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:30px 34px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;text-decoration:line-through;"> <div>@for (contact of contactForm.contacts; track $index) {</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:30px 34px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#E8ECF2;"> <div>@for (contact of contactForm.contacts; <span style="background:#1E3A33;color:#2FD8B4;">track contact</span>) {</div> <div style="padding-left:1.2em;">&lt;input [formField]=<span style="color:#2FD8B4;">"contact.name"</span> /&gt;</div> <div>}</div> </div> <p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:8px 0 0;">Form state follows the item either way - it is keyed by a hidden symbol on the model object. What <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">track</code> governs is DOM reuse: with <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">$index</code> you re-bind Bob's existing input to Alice, losing focus and anything held inside a custom control.</p> </div> </div>

<!--
Be careful with the reason here. Touched, dirty and validation follow the item however you write @for - they are keyed by a hidden symbol stamped on the model object, not by the track expression. Tracking the field makes the DOM element follow it too, so you do not re-bind Bob's input to Alice and lose focus or custom-control state. Two caveats: only object items get identity, so for string[] or number[] track item behaves exactly like track $index; and the symbol is an enumerable own property, so spread-duplicating an item copies it and both rows resolve to the same node - typing in row two edits row one.
-->
---
layout: content
eyebrow: 'Reset'
heading: 'Reset clears state, not data'
---
<p style="font-size:31px;color:#8A97A8;line-height:1.45;margin:0 0 48px;max-width:1600px;">“Reset” is an ambiguous word, so it is worth being precise. <code style="font-family:'JetBrains Mono',monospace;font-size:28px;color:#C9D4E2;">reset()</code> resets interaction state - touched and dirty - for the field and its descendants. It does not clear the values and it does not restore the ones the form loaded with, unless you explicitly pass a value to reset to.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 42px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#E8ECF2;margin-bottom:28px;">form().reset()</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;line-height:2;color:#C9D4E2;"> <div>touched → <span style="color:#2FD8B4;">reset</span></div> <div>dirty   → <span style="color:#2FD8B4;">reset</span></div> <div>model   → <span style="color:#8A97A8;">unchanged</span></div> </div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 42px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:29px;color:#E8ECF2;margin-bottom:28px;">form().reset(initialValue)</div> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;line-height:2;color:#C9D4E2;"> <div>touched → <span style="color:#2FD8B4;">reset</span></div> <div>dirty   → <span style="color:#2FD8B4;">reset</span></div> <div>model   → <span style="color:#2FD8B4;">initialValue</span></div> </div> </div> </div>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:44px 0 0;max-width:1600px;">So restoring the original API response is a product decision you make explicitly, not something the form can infer for you.</p>

<!--
The word reset is ambiguous. In Signal Forms it resets interaction state - touched and dirty - for the field and its descendants. It does not clear or restore any values unless you pass one. Restoring the original API data is a product decision, not something the form can infer for you.
-->
---
layout: section
number: '07'
transition: fade
---
## Submission

<p class="lead" style="margin-top:40px">The lifecycle we usually write ourselves, as form state.</p>

<!--
The submission lifecycle we usually hand-roll, as form state.
-->
---
layout: content
eyebrow: 'Submission'
heading: 'The lifecycle we write by hand'
---
<div style="display:grid;grid-template-columns:1.15fr 0.85fr;gap:52px;align-items:center;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.62;color:#8A97A8;"> <div><span style="color:#8577CF;">if</span> (userForm.invalid) {</div> <div style="padding-left:1.2em;">userForm.markAllAsTouched();</div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">return</span>;</div> <div>}</div> <div style="height:0.85em;"></div> <div>saving = <span style="color:#8577CF;">true</span>;</div> <div style="height:0.85em;"></div> <div><span style="color:#8577CF;">try</span> {</div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">await</span> api.save(userForm.getRawValue());</div> <div>} <span style="color:#8577CF;">finally</span> {</div> <div style="padding-left:1.2em;">saving = <span style="color:#8577CF;">false</span>;</div> <div>}</div> </div> <div style="display:flex;flex-direction:column;gap:16px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Mark things touched</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Check validity</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Prevent duplicate saves</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Manage saving state</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Extract values</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:16px 26px;font-size:27px;color:#8A97A8;">Handle server errors</div> </div> </div>

<!--
Mark things touched. Check validity. Prevent duplicate saves. Manage saving state. Extract values. Handle server errors. Signal Forms have a form-level API for this.
-->
---
layout: content
eyebrow: 'FormRoot'
heading: 'FormRoot'
---
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:52px;align-items:start;"> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div>&lt;form [formRoot]=<span style="color:#2FD8B4;">"userForm"</span>&gt;</div> <div style="padding-left:1.2em;">&lt;input [formField]=<span style="color:#2FD8B4;">"userForm.email"</span> /&gt;</div> <div style="padding-left:1.2em;">&lt;button type=<span style="color:#2FD8B4;">"submit"</span>&gt;Save&lt;/button&gt;</div> <div>&lt;/form&gt;</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#8B7CF6;">readonly</span> <span>userForm</span> = <span style="color:#7CC4FF;">form</span>(<span style="color:#8B7CF6;">this</span>.userModel, userFormSchema, {</div> <div style="padding-left:1.2em;">submission: {</div> <div style="padding-left:2.4em;">action: <span style="color:#8B7CF6;">async</span> (field) =&gt; {</div> <div style="padding-left:3.6em;"><span style="color:#8B7CF6;">await</span> api.save(field().value());</div> <div style="padding-left:2.4em;">},</div> <div style="padding-left:1.2em;">},</div> <div>});</div> </div> </div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:24px;"> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#E8ECF2;">submit</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#E8ECF2;">mark interactive fields touched</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #8B7CF6;border-radius:8px;padding:14px 26px;color:#B9A9FF;">validation gate</div> <div style="font-size:24px;color:#FF7A6B;padding-left:22px;max-width:420px;line-height:1.35;">pending async validators do not block it - <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">ignoreValidators</code> defaults to <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">'pending'</code></div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #2FD8B4;border-radius:8px;padding:14px 26px;color:#2FD8B4;">submitting()</div> <div style="color:#8A97A8;padding-left:22px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 26px;color:#E8ECF2;">action</div> </div> </div>

<!--
FormRoot binds the FieldTree to a real form element. It sets novalidate, prevents default navigation and calls the submission flow. Important default: ignoreValidators is 'pending', so submit() fires while an async validator is still in flight - a uniqueness check can be mid-request and the form submits anyway. Pass 'none' to require valid() and block on pending; 'all' always submits.
-->
---
layout: content
eyebrow: 'Submission state'
heading: 'Submission state is form state'
---
<div style="display:grid;grid-template-columns:1.3fr 0.7fr;gap:52px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.62;color:#C9D4E2;"> <div>&lt;button type=<span style="color:#2FD8B4;">"submit"</span> [disabled]=<span style="color:#2FD8B4;">"userForm().submitting()"</span>&gt;</div> <div style="padding-left:1.2em;">@<span style="color:#8B7CF6;">if</span> (userForm().submitting()) {</div> <div style="padding-left:2.4em;">Saving…</div> <div style="padding-left:1.2em;">} @<span style="color:#8B7CF6;">else</span> {</div> <div style="padding-left:2.4em;">Save</div> <div style="padding-left:1.2em;">}</div> <div>&lt;/button&gt;</div> </div> <div style="display:flex;flex-direction:column;gap:24px;align-items:flex-start;"> <div style="background:#2FD8B4;color:#0A0D12;border-radius:8px;padding:18px 44px;font-size:28px;font-weight:600;">Save</div> <div style="font-size:30px;color:#8A97A8;">↓</div> <div style="background:#0A0D12;border:1px solid #4A5568;color:#5E6B7D;border-radius:8px;padding:18px 44px;font-size:28px;font-weight:600;">Saving…</div> </div> </div>
<p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:52px 0 0;max-width:1500px;">No separate <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">saving</code> boolean. The submission API also guards concurrent submission.</p>

<!--
We do not need a separate saving boolean just to represent the form's submission lifecycle. The submission API also guards concurrent submission.
-->
---
layout: content
eyebrow: 'Invalid submission'
heading: 'Invalid submission, and where focus goes'
---
<div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:40px 48px;font-family:'JetBrains Mono',monospace;font-size:30px;line-height:1.62;color:#C9D4E2;margin-bottom:48px;"> <div>onInvalid: (field) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">const</span> <span>firstError</span> = field().<span style="color:#7CC4FF;">errorSummary</span>()[<span style="color:#8B7CF6;">0</span>];</div> <div style="padding-left:1.2em;">firstError?.fieldTree().<span style="color:#7CC4FF;">focusBoundControl</span>();</div> <div>},</div> </div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">All interactive fields are already marked touched, so errors can be shown.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;"><code style="font-family:'JetBrains Mono',monospace;font-size:25px;color:#2FD8B4;">errorSummary()</code> aggregates errors through the tree.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 36px;"> <p style="font-size:28px;line-height:1.4;margin:0;color:#C9D4E2;">Errors know their FieldTree, so we can focus the bound control.</p> </div> </div>

<!--
A good place to implement consistent keyboard and accessibility behaviour rather than scattering focus logic through individual controls.
-->
---
layout: content
eyebrow: 'Server errors'
heading: 'Not every rule can run in the browser'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 34px;max-width:1600px;">The submission action returns errors rather than throwing them. Each one names the field it belongs to.</p>
<div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:52px;align-items:center;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.65;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">submit</span>(<span style="color:#8B7CF6;">this</span>.userForm, {</div> <div style="padding-left:1.2em;">action: <span style="color:#8B7CF6;">async</span> (form) =&gt; {</div> <div style="padding-left:2.4em;"><span style="color:#8B7CF6;">const</span> res = <span style="color:#8B7CF6;">await</span> api.save(form().value());</div> <div style="height:0.85em;"></div> <div style="padding-left:2.4em;"><span style="color:#8B7CF6;">if</span> (res.emailTaken) {</div> <div style="padding-left:3.6em;"><span style="color:#8B7CF6;">return</span> {</div> <div style="padding-left:4.8em;">fieldTree: <span style="background:#1E3A33;color:#2FD8B4;">userForm.email</span>,</div> <div style="padding-left:4.8em;">kind: <span style="color:#2FD8B4;">'emailExists'</span>,</div> <div style="padding-left:4.8em;">message: <span style="color:#2FD8B4;">'This email is already registered'</span>,</div> <div style="padding-left:3.6em;">};</div> <div style="padding-left:2.4em;">}</div> <div style="height:0.85em;"></div> <div style="padding-left:2.4em;"><span style="color:#8B7CF6;">return</span> <span style="color:#8B7CF6;">null</span>;</div> <div style="padding-left:1.2em;">},</div> <div>});</div> </div> <div style="display:flex;flex-direction:column;gap:26px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px;"> <div style="font-size:24px;color:#8A97A8;margin-bottom:10px;">Email</div> <div style="background:#0A0D12;border:1px solid #FF7A6B;border-radius:8px;padding:0 18px;height:60px;display:flex;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px;color:#E8ECF2;">sam.taylor@example.com</div> <div style="font-size:24px;color:#FF7A6B;margin-top:14px;">This email is already registered</div> </div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#5E6B7D;"> <div>userForm.email().errors()</div> <div style="color:#2FD8B4;">  → [{ kind: 'emailExists', … }]</div> </div> <p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:0;">It joins the same field error state the template already renders. No separate path for API errors.</p> </div> </div>

<!--
Not every validation rule can run in the browser. The submission action returns errors instead of throwing, and each error names the FieldTree it belongs to - so it lands in that field's errors() and renders through the same template code as any client-side rule. Verify the exact submission-error type against the workshop codebase before delivery.
-->
---
layout: content
eyebrow: 'Interop'
heading: 'Our existing controls keep working'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 44px;max-width:1600px;">Signal Forms support <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">ControlValueAccessor</code> controls, so the components we already have bind to <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">[formField]</code> with no rewrite.</p>
<div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:56px;align-items:center;"> <div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:32px 40px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#C9D4E2;margin-bottom:36px;"> <div style="color:#5E6B7D;">&lt;!-- an existing CVA control, unchanged --&gt;</div> <div>&lt;my-input [formField]=<span style="color:#2FD8B4;">"userForm.email"</span> /&gt;</div> </div> <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'JetBrains Mono',monospace;font-size:25px;"> <div style="border:1px solid #2FD8B4;border-radius:8px;padding:14px 28px;color:#2FD8B4;">Signal Forms</div> <div style="color:#8A97A8;padding-left:24px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 28px;color:#E8ECF2;">FormField</div> <div style="color:#8A97A8;padding-left:24px;">↓</div> <div style="border:1px solid #4A5568;border-radius:8px;padding:14px 28px;color:#8A97A8;">existing CVA control</div> </div> </div> <div style="display:flex;flex-direction:column;gap:32px;"> <p style="font-size:31px;line-height:1.45;margin:0;color:#C9D4E2;">This is what makes adoption incremental: no component-library migration has to land before the first signal form ships.</p> <p style="font-size:29px;line-height:1.45;margin:0;color:#8A97A8;">Angular also provides newer signal-native control contracts. That is a component-library design decision, not a prerequisite for using Signal Forms.</p> <div style="border-left:4px solid #2FD8B4;padding-left:26px;font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:500;color:#E8ECF2;line-height:1.3;">The form owns business rules. The control library owns presentation, accessibility and control behaviour.</div> </div> </div>

<!--
Custom-control authoring is not the focus here. Our component library controls already implement ControlValueAccessor, and Signal Forms support CVA controls for interoperability - so they work with [formField] without rewriting the library first. Angular also provides newer signal-native control contracts, but that is a component-library design topic rather than something we need in order to use Signal Forms.
-->
---
layout: content
eyebrow: 'Custom controls · before'
heading: 'The ControlValueAccessor handshake'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">A provider registration, four interface methods, and a private copy of the value with callbacks to store and invoke.</p>
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#8A97A8;"> <div>@Component({</div> <div style="padding-left:1.2em;">providers: [{</div> <div style="padding-left:2.4em;">provide: NG_VALUE_ACCESSOR,</div> <div style="padding-left:2.4em;">useExisting: forwardRef(() =&gt; CustomInput),</div> <div style="padding-left:2.4em;">multi: <span style="color:#8577CF;">true</span>,</div> <div style="padding-left:1.2em;">}],</div> <div>})</div> <div><span style="color:#8577CF;">export class</span> CustomInput <span style="color:#8577CF;">implements</span> ControlValueAccessor {</div> <div style="padding-left:1.2em;">value = <span style="color:#3FBFA2;">''</span>;</div> <div style="padding-left:1.2em;"><span style="color:#8577CF;">private</span> <span>onChange</span> = (v: string) =&gt; {};</div> <div style="padding-left:1.2em;"><span>onTouched</span> = () =&gt; {};</div> <div style="height:0.85em;"></div> <div style="padding-left:1.2em;">writeValue(v: string) { <span style="color:#8577CF;">this</span>.value = v; }</div> <div style="padding-left:1.2em;">registerOnChange(fn: (v: string) =&gt; <span style="color:#8577CF;">void</span>) { <span style="color:#8577CF;">this</span>.onChange = fn; }</div> <div style="padding-left:1.2em;">registerOnTouched(fn: () =&gt; <span style="color:#8577CF;">void</span>) { <span style="color:#8577CF;">this</span>.onTouched = fn; }</div> <div style="padding-left:1.2em;">setDisabledState(d: boolean) { … }</div> <div>}</div> </div> <div style="display:flex;flex-direction:column;gap:26px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">REGISTRATION</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">A multi-provider and a <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">forwardRef</code> pointing at the class being defined.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">FOUR METHODS</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Write, change, touch and disable - none of which describe the control itself.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">A SECOND COPY</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">The control holds the value locally and pushes changes back through a stored callback.</p> </div> </div> </div>

<!--
Writing a control today: a provider registration with forwardRef, four ControlValueAccessor methods, and a private copy of the value plus callbacks the component has to store and invoke. None of this is about what the control looks like or how it behaves - it is the handshake with the forms system.
-->
---
layout: content
eyebrow: 'Custom controls · after'
heading: 'Implement an interface, declare a signal'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;max-width:1600px;">The <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#2FD8B4;">[formField]</code> directive detects the interface and binds the field's value to your <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">value</code> model. No provider, no callbacks.</p>
<div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:&#x27;JetBrains Mono&#x27;,monospace;font-size:24px;line-height:1.65;color:#C9D4E2;"> <div>@Component({</div> <div style="padding-left:1.2em;">selector: <span style="color:#2FD8B4;">'app-custom-input'</span>,</div> <div style="padding-left:1.2em;">template: <span style="color:#2FD8B4;">`</span></div> <div style="padding-left:2.4em;">&lt;input [value]=<span style="color:#2FD8B4;">"value()"</span></div> <div style="padding-left:3.6em;">(input)=<span style="color:#2FD8B4;">"value.set($event.target.value)"</span></div> <div style="padding-left:3.6em;">(blur)=<span style="color:#2FD8B4;">"touch.emit()"</span> /&gt;</div> <div style="padding-left:1.2em;"><span style="color:#2FD8B4;">`</span>,</div> <div>})</div> <div><span style="color:#8B7CF6;">export class</span> <span style="color:#7CC4FF;">CustomInput</span> <span style="color:#8B7CF6;">implements</span> FormValueControl&lt;string&gt; {</div> <div style="padding-left:1.2em;">value = <span style="color:#7CC4FF;">model</span>(<span style="color:#2FD8B4;">''</span>);</div> <div style="padding-left:1.2em;">touch = <span style="color:#7CC4FF;">output</span>&lt;<span style="color:#8B7CF6;">void</span>&gt;();</div> <div>}</div> </div> <div style="display:flex;flex-direction:column;gap:24px;"> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#2FD8B4;margin-bottom:10px;">REQUIRED SURFACE</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">A <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">value</code> model signal. Checkbox-style controls implement <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">FormCheckboxControl</code> with <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">checked</code> instead - never both.</p> </div> <div style="background:#0A0D12;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#8B7CF6;margin-bottom:10px;">OPTIONAL STATE INPUTS</div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;color:#C9D4E2;"> <div>errors  invalid  pending</div> <div>disabled  disabledReasons  readonly  hidden</div> <div>touched  dirty  name</div> <div>required  min  max  minLength  maxLength  pattern</div> </div> <p style="font-size:25px;line-height:1.4;margin:14px 0 0;color:#8A97A8;">Declare only the ones the control uses. There is also <span style="color:#C9D4E2;">focus()</span> and <span style="color:#C9D4E2;">reset()</span> - no <span style="color:#FF7A6B;">valid</span>, so declaring one silently never updates.</p> </div> <p style="font-size:27px;line-height:1.4;margin:0;color:#8A97A8;">The schema validates. The control displays the result.</p> </div> </div>

<!--
The same control against Signal Forms: implement FormValueControl and declare a value model signal. That is the required surface. The formField directive detects the interface and binds the field's value to it. Add a touch output if you want blur tracking, and any of the optional state inputs the control actually uses. Two rules: a FormValueControl must not have a checked property, and a FormCheckboxControl must not have a value property. Note there is no valid input - TypeScript lets you declare one because extra members are permitted when implementing an interface, and it then never updates. And do not put validation logic in the control - the schema validates, the control displays.
-->
---
layout: section
number: '08'
transition: fade
---
## Footguns

<p class="lead" style="margin-top:40px">Fast round. Pause before the answer appears.</p>

<!--
This section should feel fast. Pause briefly before each answer appears.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">SCHEMA CALLBACK</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 36px;">A plain <code style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#FF7A6B;">if</code> in the schema</h2>
<div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:36px 48px;font-family:'JetBrains Mono',monospace;font-size:32px;line-height:1.55;color:#C9D4E2;margin-bottom:36px;"> <div><span style="color:#7CC4FF;">form</span>(model, (p) =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">if</span> (model().notify) {</div> <div style="padding-left:2.4em;"><span style="color:#7CC4FF;">required</span>(p.email);</div> <div style="padding-left:1.2em;">}</div> <div>});</div> </div>
<div style="display:grid;grid-template-columns:0.45fr 0.55fr;gap:44px;align-items:center;"> <div> <div style="font-family:'Space Grotesk',sans-serif;font-size:64px;font-weight:600;color:#FF7A6B;margin-bottom:20px;">No.</div> <p style="font-size:29px;line-height:1.4;margin:0;color:#8A97A8;">The schema callback constructs the form rules. It does not rerun like an effect when <code style="font-family:'JetBrains Mono',monospace;font-size:26px;">notify</code> changes.</p> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">required</span>(p.email, {</div> <div style="padding-left:1.2em;">when: ({ valueOf }) =&gt; valueOf(p.notify),</div> <div>});</div> </div> </div>

<!--
This looks completely reasonable if we think of the schema callback as reactive code. But the callback constructs the form rules - it does not rerun like an effect.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">MODEL VALUES</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 40px;">Optional properties and <code style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#FF7A6B;">undefined</code></h2>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.62;color:#8A97A8;"> <div style="font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:22px;">AVOID</div> <div><span style="color:#8577CF;">interface</span> UserFormModel {</div> <div style="padding-left:1.2em;">name: string;</div> <div style="padding-left:1.2em;">email?: string;</div> <div>}</div> <div style="height:0.85em;"></div> <div><span style="color:#8577CF;">const</span> model = signal({</div> <div style="padding-left:1.2em;">name: <span style="color:#3FBFA2;">''</span>,</div> <div style="padding-left:1.2em;color:#5E6B7D;">// email omitted entirely</div> <div>});</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:34px 40px;font-family:'JetBrains Mono',monospace;font-size:27px;line-height:1.62;color:#C9D4E2;"> <div style="font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:22px;">PREFER</div> <div><span style="color:#8B7CF6;">const</span> model = <span style="color:#7CC4FF;">signal</span>({</div> <div style="padding-left:1.2em;">name: <span style="color:#2FD8B4;">''</span>,</div> <div style="padding-left:1.2em;">email: <span style="color:#2FD8B4;">''</span>,</div> <div>});</div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// null suits a select or date control</div> <div>phoneNumber: <span style="color:#8B7CF6;">null</span></div> <div style="height:0.85em;"></div> <div style="color:#5E6B7D;">// for text inputs and textareas</div> <div style="color:#5E6B7D;">// Angular recommends '' over null</div> </div> </div>
<p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:44px 0 0;max-width:1550px;">With <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">{ email: undefined }</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">required(p.email)</code> in the schema, TypeScript accepts the rule, the rule silently never runs, and the form reports <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#FF7A6B;">valid() === true</code>. Initialise every field you want in the tree.</p>

<!--
A big one. In Signal Forms, undefined can mean the field is not present in the form structure. When a field conceptually exists, initialise it with a meaningful empty value for the control.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">OBJECT SHAPE</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 40px;">Swapping one object shape for another</h2>
<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:36px;align-items:center;margin-bottom:44px;"> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#8A97A8;"> <div>{</div> <div style="padding-left:1.2em;">type: <span style="color:#3FBFA2;">'person'</span>,</div> <div style="padding-left:1.2em;">firstName: <span style="color:#3FBFA2;">''</span>,</div> <div style="padding-left:1.2em;">lastName: <span style="color:#3FBFA2;">''</span>,</div> <div>}</div> </div> <div style="font-size:40px;color:#FF7A6B;">⇄</div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#8A97A8;"> <div>{</div> <div style="padding-left:1.2em;">type: <span style="color:#3FBFA2;">'company'</span>,</div> <div style="padding-left:1.2em;">companyName: <span style="color:#3FBFA2;">''</span>,</div> <div>}</div> </div> </div>
<p style="font-size:31px;color:#C9D4E2;line-height:1.45;margin:0 0 24px;max-width:1550px;">Prefer a stable shape and use hidden, disabled or conditional schemas to determine what is active.</p>
<p style="font-size:29px;color:#5E6B7D;line-height:1.45;margin:0;max-width:1550px;">Arrays are the major exception - adding and removing list items is genuinely part of the form model.</p>

<!--
Because the FieldTree follows the model structure, casually replacing object shapes can destroy form structure and state. Arrays are the major exception.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">ARRAYS</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 16px;"><code style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#FF7A6B;">required()</code> on an array</h2>
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 32px;">The requirement: the user must select at least one permission.</p>
<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:36px;align-items:center;margin-bottom:48px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:36px 44px;font-family:'JetBrains Mono',monospace;font-size:34px;color:#8A97A8;text-decoration:line-through;">required(p.permissions);</div> <div style="font-size:40px;color:#8A97A8;">→</div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:36px 44px;font-family:'JetBrains Mono',monospace;font-size:34px;color:#E8ECF2;"><span style="color:#7CC4FF;">minLength</span>(p.permissions, <span style="color:#8B7CF6;">1</span>);</div> </div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <p style="font-size:30px;color:#C9D4E2;line-height:1.45;margin:0;"><code style="font-family:'JetBrains Mono',monospace;font-size:27px;">required</code> treats an empty array as present. For “at least one item”, use a length constraint.</p> <p style="font-size:30px;color:#8A97A8;line-height:1.45;margin:0;">It treats <code style="font-family:'JetBrains Mono',monospace;font-size:27px;">false</code> as missing, which is what you want for a required checkbox. But a whitespace-only string passes - nothing is trimmed anywhere.</p> </div>

<!--
required treats an empty array as present. Also note: required treats false as missing, which is what you want for a required checkbox such as accepting terms.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">STRUCTURAL TYPES</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 16px;">Classes, <code style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#FF7A6B;">Map</code> and <code style="font-family:'JetBrains Mono',monospace;font-size:44px;color:#FF7A6B;">Set</code> in the model</h2>
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">TypeScript accepts them and Signal Forms does not check the shape at runtime, so nothing throws at the point you write it. Each one fails differently later.</p>
<div style="display:grid;grid-template-columns:0.78fr 1.22fr;gap:44px;align-items:center;"> <div style="display:flex;flex-direction:column;gap:20px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:26px 32px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.7;color:#8A97A8;"> <div style="font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:14px;">AVOID</div> <div><span style="color:#8577CF;">new</span> Address(…)</div> <div><span style="color:#8577CF;">new</span> Map()</div> <div><span style="color:#8577CF;">new</span> Set()</div> </div> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:26px 32px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.7;color:#C9D4E2;"> <div style="font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:14px;">PREFER</div> <div>{ street: <span style="color:#2FD8B4;">''</span>, city: <span style="color:#2FD8B4;">''</span> }</div> <div>[]</div> </div> </div> <div style="display:flex;flex-direction:column;gap:22px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#B9A9FF;margin-bottom:10px;">CLASS INSTANCES</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Lose their prototype on the first write to them <em>or any descendant</em> - every object on the path from root to the written leaf is copied. Methods, getters and <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">instanceof</code> are gone afterwards.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#B9A9FF;margin-bottom:10px;">MAP AND SET</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Produce empty field trees, because children are enumerated with <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">Object.keys</code>. <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">required()</code> on an empty one reports nothing.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#B9A9FF;margin-bottom:10px;">FROZEN OBJECT ITEMS</div> <p style="font-size:27px;line-height:1.4;margin:0;color:#C9D4E2;">Only as <em>object items of an array</em>, and not at <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">form()</code> - lazily, when children are first materialised. A raw <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">TypeError</code>, because a tracking symbol cannot be added.</p> </div> </div> </div>
<p style="font-size:28px;color:#5E6B7D;line-height:1.45;margin:32px 0 0;max-width:1600px;">This applies to the structural layer the form walks through. Leaf values can still be richer where the bound control treats them atomically - and if we model the domain with classes, translate at the form boundary.</p>

<!--
Signal Forms walks the structural layer to build the field tree and does not validate the shape at runtime, so these are accepted and then misbehave. Class instances lose their prototype on the first write to them or any descendant - every object on the path from root to the written leaf is copied. Map and Set produce empty field trees because children are enumerated with Object.keys, and required() on an empty Map or Set reports no error at all, though minLength does work. Frozen objects throw only as object items of an array, and lazily - form() succeeds and the raw TypeError fires when children are first materialised, so it points at the wrong line. Object.seal and preventExtensions fail the same way. If we model the domain with classes, translate at the form boundary.
-->
---
layout: content
---
<div style="display:flex;align-items:center;gap:28px;margin-bottom:44px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.2em;color:#FF7A6B;">SHIP IT?</div> <div style="flex:1;height:1px;background:#4A5568;"></div> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#5E6B7D;">BROWSER &amp; CSS</div> </div>
<h2 style="font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:600;letter-spacing:-0.02em;line-height:1.15;margin:0 0 16px;">Trusting native validity and old CSS hooks</h2>
<p style="font-size:30px;color:#8A97A8;line-height:1.4;margin:0 0 36px;max-width:1600px;">Validation runs entirely in Angular, so the browser's own view of the field is not the authority - and neither are the class names we styled against before.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:28px;line-height:1.6;color:#C9D4E2;margin-bottom:28px;"> <div>Signal Forms validation state</div> <div style="color:#FF7A6B;font-size:34px;">≠</div> <div>browser :valid / :invalid</div> </div> <p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:0;">Some constraints are mirrored to native attributes for behaviour and accessibility - <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">required</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">min</code>/<code style="font-family:'JetBrains Mono',monospace;font-size:25px;">max</code>, <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">minlength</code>/<code style="font-family:'JetBrains Mono',monospace;font-size:25px;">maxlength</code>, but not <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">pattern</code>. Never treat <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">validity</code> as authoritative. Read from the field.</p> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:36px 40px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#8A97A8;margin-bottom:28px;"> <div>.ng-invalid.ng-touched { … }</div> </div> <p style="font-size:28px;color:#C9D4E2;line-height:1.45;margin:0 0 22px;">Signal Forms does not add these classes to your controls.</p> <p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:0 0 18px;">Any styling that relies on them stops applying.</p> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.5;color:#C9D4E2;">provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })</div> <p style="font-size:26px;color:#5E6B7D;line-height:1.4;margin:14px 0 0;">Seven classes, opt-in, spanning two entry points. There is no <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">ng-submitted</code>.</p> </div> </div>

<!--
Some built-in constraints are mirrored to native attributes for behaviour and accessibility, but read validation from the FieldTree. And Signal Forms does not add the ng-* status classes by default, so CSS keyed on them silently stops applying. They are opt-in: provideSignalFormsConfig({ classes: NG_STATUS_CLASSES }), with the token from the compat entry point. Seven classes - touched, untouched, dirty, pristine, valid, invalid, pending - and no ng-submitted, so anything keyed on that is gone for good. And because ng-valid/ng-invalid follow signal-forms semantics, an element gets neither while an async validator is pending.
-->
---
layout: content
eyebrow: 'Deprecations'
heading: 'Be careful with older examples online'
---
<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:36px;align-items:center;margin-bottom:48px;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.9;color:#8A97A8;text-decoration:line-through;"> <div>hidden(p.field, condition)</div> <div>disabled(p.field, condition)</div> <div>readonly(p.field, condition)</div> </div> <div style="font-size:40px;color:#8A97A8;">→</div> <div style="background:#0A0D12;border:1px solid #2FD8B4;border-radius:14px;padding:32px 38px;font-family:'JetBrains Mono',monospace;font-size:26px;line-height:1.6;color:#C9D4E2;"> <div><span style="color:#7CC4FF;">hidden</span>(p.field, { when: condition });</div> <div><span style="color:#7CC4FF;">disabled</span>(p.field, { when: condition });</div> <div><span style="color:#7CC4FF;">readonly</span>(p.field, { when: condition });</div> </div> </div>
<div style="border-left:4px solid #8B7CF6;padding-left:28px;font-family:'Space Grotesk',sans-serif;font-size:36px;font-weight:500;color:#E8ECF2;line-height:1.3;">The <code style="font-family:'JetBrains Mono',monospace;font-size:30px;">{when}</code> change still compiles, so it fails quietly. The renames below do not compile at all.</div>
<div style="margin-top:32px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.6;"> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:12px;padding:22px 28px;color:#8A97A8;"> <div style="font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:12px;">WON'T BIND</div> <div>[field] → [formField]</div> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:12px;padding:22px 28px;color:#8A97A8;"> <div style="font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:12px;">COMPILE ERROR</div> <div>ctx.field → ctx.fieldTree</div> </div> <div style="background:#0F131A;border:1px solid #FF7A6B;border-radius:12px;padding:22px 28px;color:#8A97A8;"> <div style="font-size:24px;letter-spacing:0.12em;color:#FF7A6B;margin-bottom:12px;">REMOVED IN 22</div> <div>WithField, customError(),</div> <div>FIELD, *MetadataKey</div> </div> </div>
<p style="font-size:26px;color:#5E6B7D;line-height:1.45;margin:24px 0 0;">Every pre-v22 article uses the deprecated form: <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">{when}</code> did not exist before 22.0, and <code style="font-family:'JetBrains Mono',monospace;font-size:24px;">[field]</code> was renamed within v21.</p>

<!--
Signal Forms evolved quickly while the API was experimental. Conference talks and articles written before the Angular 22 stable API may contain syntax that still compiles but is already deprecated.
-->
---
layout: content
eyebrow: 'Testing'
heading: 'Most form logic needs no DOM'
---
<p style="font-size:30px;color:#8A97A8;line-height:1.35;margin:0 0 16px;max-width:1600px;">One setup detail: Signal Forms needs an injection context when the form is created. Call <code style="font-family:'JetBrains Mono',monospace;font-size:27px;color:#C9D4E2;">form()</code> without one and the test throws before it can assert anything.</p>
<div style="display:grid;grid-template-columns:1.35fr 0.65fr;gap:44px;align-items:start;"> <div style="display:flex;flex-direction:column;gap:16px;"> <div style="background:#12171F;border:1px solid #2FD8B4;border-radius:14px;padding:24px 32px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.55;color:#C9D4E2;"> <div style="color:#5E6B7D;">// pass the injector when the test builds the form</div> <div><span style="color:#8B7CF6;">const</span> <span>profileForm</span> = <span style="color:#7CC4FF;">form</span>(</div> <div style="padding-left:1.2em;">model,</div> <div style="padding-left:1.2em;">(path) =&gt; { <span style="color:#7CC4FF;">required</span>(path.name); },</div> <div style="padding-left:1.2em;">{ injector: TestBed.<span style="color:#7CC4FF;">inject</span>(Injector) },</div> <div>);</div> <div style="height:0.85em;"></div> <div><span style="color:#7CC4FF;">expect</span>(profileForm.name().errors()).<span style="color:#7CC4FF;">toEqual</span>([</div> <div style="padding-left:1.2em;">expect.<span style="color:#7CC4FF;">objectContaining</span>({ kind: <span style="color:#2FD8B4;">'required'</span> }),</div> <div>]);</div> </div> <div style="background:#0F131A;border:1px solid #4A5568;border-radius:14px;padding:24px 32px;font-family:'JetBrains Mono',monospace;font-size:24px;line-height:1.55;color:#8A97A8;"> <div style="color:#5E6B7D;">// or wrap the call in an injection context</div> <div>TestBed.<span style="color:#7CC4FF;">runInInjectionContext</span>(() =&gt; {</div> <div style="padding-left:1.2em;"><span style="color:#8B7CF6;">const</span> <span>profileForm</span> = <span style="color:#7CC4FF;">form</span>(model, profileSchema);</div> <div style="padding-left:1.2em;"><span style="color:#7CC4FF;">expect</span>(profileForm.name().valid()).<span style="color:#7CC4FF;">toBe</span>(<span style="color:#8B7CF6;">false</span>);</div> <div>});</div> </div> </div> <div style="display:flex;flex-direction:column;gap:22px;"> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:26px 30px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#2FD8B4;margin-bottom:18px;">ISOLATED</div> <div style="font-size:25px;line-height:1.65;color:#C9D4E2;"> <div>validation and errors</div> <div>disabled, required, readonly</div> <div>cross-field dependencies</div> <div>conditional schemas</div> </div> </div> <div style="background:#12171F;border:1px solid #4A5568;border-radius:14px;padding:26px 30px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:0.12em;color:#8B7CF6;margin-bottom:18px;">COMPONENT-BOUND</div> <div style="font-size:25px;line-height:1.65;color:#C9D4E2;"> <div>values rendering in the DOM</div> <div>typing updating the model</div> <div>custom controls</div> <div>focus and accessibility</div> </div> </div> </div> </div>
<p style="font-size:28px;color:#8A97A8;line-height:1.45;margin:12px 0 0;max-width:1600px;">Prefer <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">errors()</code> over <code style="font-family:'JetBrains Mono',monospace;font-size:25px;">valid()</code> in assertions - it tells you which rule failed. Full guide: <a href="https://angular.dev/guide/forms/signals/testing">angular.dev/guide/forms/signals/testing</a></p>

<!--
A lot of form logic can be tested without rendering a component, because the logic lives in the schema and schemas do not need a template to run. The one setup detail: Signal Forms needs an injection context during form creation - call form() without one in a test and it throws before you can assert anything. Pass {injector: TestBed.inject(Injector)} when the test creates the form itself; use TestBed.runInInjectionContext() when the code under test calls form() internally. errors() is usually the most useful assertion, because it shows which rule failed. Render a component only when the behaviour crosses into the DOM.
-->
---
layout: content
eyebrow: 'Closing'
---
<div style="display:flex;flex-direction:column;gap:36px;"> <div style="display:flex;gap:36px;align-items:baseline;border-bottom:1px solid #4A5568;padding-bottom:32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:600;color:#2FD8B4;line-height:1;">1</div> <div style="font-family:'Space Grotesk',sans-serif;font-size:52px;font-weight:500;letter-spacing:-0.02em;color:#E8ECF2;">The model owns the data.</div> </div> <div style="display:flex;gap:36px;align-items:baseline;border-bottom:1px solid #4A5568;padding-bottom:32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:600;color:#2FD8B4;line-height:1;">2</div> <div style="font-family:'Space Grotesk',sans-serif;font-size:52px;font-weight:500;letter-spacing:-0.02em;color:#E8ECF2;">The FieldTree adds form state and behaviour.</div> </div> <div style="display:flex;gap:36px;align-items:baseline;border-bottom:1px solid #4A5568;padding-bottom:32px;"> <div style="font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:600;color:#2FD8B4;line-height:1;">3</div> <div style="font-family:'Space Grotesk',sans-serif;font-size:52px;font-weight:500;letter-spacing:-0.02em;color:#E8ECF2;">Describe relationships instead of orchestrating changes.</div> </div> <div style="display:flex;gap:36px;align-items:baseline;"> <div style="font-family:'JetBrains Mono',monospace;font-size:52px;font-weight:600;color:#2FD8B4;line-height:1;">4</div> <div style="font-family:'Space Grotesk',sans-serif;font-size:52px;font-weight:500;letter-spacing:-0.02em;color:#E8ECF2;">Good form modelling still matters.</div> </div> </div>

<!--
If you forget most of the individual API names tomorrow, that's fine. Remember these four things. If those ideas are clear, the rest of the API is much easier to discover and reason about.
-->
---
layout: content
---

<div style="width:120px;height:5px;background:#2FD8B4;margin-bottom:56px;"></div>
<h2 style="font-family:&#x27;Space Grotesk&#x27;,sans-serif;font-size:150px;font-weight:600;letter-spacing:-0.035em;line-height:1;margin:0;">Questions?</h2>
<p style="font-size:32px;color:#8A97A8;line-height:1.45;margin:64px 0 0;max-width:1500px;">Reactive Forms model a control tree and often require us to coordinate it. Signal Forms start with our data and let us describe form behaviour around it.</p>
<div style="display:flex;gap:56px;margin-top:72px;font-family:&#x27;JetBrains Mono&#x27;,monospace;font-size:25px;color:#5E6B7D;"> <span>angular.dev/guide/forms/signals</span> </div>

<!--
Close on the thesis, then open the floor. The goal is not to convince anyone that Reactive Forms were bad - it is that Signal Forms make the difficult parts of forms easier to reason about.
-->
