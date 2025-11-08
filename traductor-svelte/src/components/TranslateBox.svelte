<script>
  import { translate } from '../api';

  let text = '';
  let from = 'es';
  let to = 'en';
  let result = '';
  let loading = false;
  let error = '';

  async function doTranslate(e) {
    e.preventDefault();
    error = '';
    result = '';
    if (from === to) {
      error = 'Los idiomas no pueden ser iguales';
      return;
    }
    try {
      loading = true;
      const res = await translate({ text, from, to });
      result = res.translation;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="card shadow-sm mt-4">
  <div class="card-body">
    <h5 class="card-title">Traducir</h5>
    <form class="row g-2" on:submit|preventDefault={doTranslate}>
      <div class="col-12">
        <input class="form-control" bind:value={text} placeholder="Texto a traducir (ej: hola)" required />
      </div>
      <div class="col-md-6">
        <label class="form-label">De</label>
        <select class="form-select" bind:value={from}>
          <option value="es">es</option>
          <option value="en">en</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label">A</label>
        <select class="form-select" bind:value={to}>
          <option value="en">en</option>
          <option value="es">es</option>
        </select>
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-success" disabled={loading}>
          {#if loading}Traduciendo...{:else}Traducir{/if}
        </button>
        <input class="form-control" value={result} placeholder="Resultado" readonly />
      </div>
      {#if error}
        <div class="text-danger small mt-1">{error}</div>
      {/if}
    </form>
  </div>
</div>
