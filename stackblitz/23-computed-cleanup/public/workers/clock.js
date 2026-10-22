const id = Math.random().toString(36).slice(2, 6);
setInterval(() => console.log(`[clock worker ${id}] still alive`), 2000);
