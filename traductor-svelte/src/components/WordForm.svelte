<script>
  export let initial = { id: '', source_lang: 'es', source_text: '', target_text: '' };
  export let onSubmit = async () => {};
  export let onCancel = () => {};

  let form = { ...initial };

  $: if (initial.id !== form.id) {
    form = { ...initial };
  }

  function submit(e) {
    e.preventDefault();
    onSubmit({ ...form });
  }
</script>

<div class="card shadow-sm">
  <div class="card-body">
    <h5 class="card-title">{initial.id ? 'Editar palabra' : 'Agregar palabra'}</h5>
    <form on:submit|preventDefault={submit}>
      <div class="mb-2">
        <label class="form-label">Idioma origen</label>
        <select class="form-select" bind:value={form.source_lang} required>
          <option value="es">es (Español)</option>
          <option value="en">en (Inglés)</option>
        </select>
      </div>
      <div class="mb-2">
        <label class="form-label">Texto origen</label>
        <input class="form-control" bind:value={form.source_text} required placeholder="hola" />
      </div>
      <div class="mb-3">
        <label class="form-label">Traducción destino</label>
        <input class="form-control" bind:value={form.target_text} required placeholder="hello" />
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" type="submit">{initial.id ? 'Actualizar' : 'Guardar'}</button>
        {#if initial.id}
          <button type="button" class="btn btn-secondary" on:click={onCancel}>Cancelar</button>
        {/if}
      </div>
    </form>
  </div>
</div>
