<script>
  export let rows = [];
  export let onEdit = (row) => {};
  export let onDelete = async (row) => {};
  let confirmId = null;

  function askDelete(row) {
    confirmId = row.id;
  }
  async function confirmDelete(row) {
    await onDelete(row);
    confirmId = null;
  }
  function cancelDelete() {
    confirmId = null;
  }
</script>

<div class="table-responsive">
  <table class="table table-sm table-striped align-middle">
    <thead>
      <tr>
        <th>ID</th>
        <th>Lang</th>
        <th>Origen</th>
        <th>Destino</th>
        <th style="width:160px;">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#if rows.length === 0}
        <tr><td colspan="5" class="text-center text-muted">Sin registros</td></tr>
      {:else}
        {#each rows as r}
          <tr>
            <td>{r.id}</td>
            <td>{r.source_lang}</td>
            <td>{r.source_text}</td>
            <td>{r.target_text}</td>
            <td>
              {#if confirmId === r.id}
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-danger" on:click={() => confirmDelete(r)}>Confirmar</button>
                  <button class="btn btn-sm btn-secondary" on:click={cancelDelete}>Cancelar</button>
                </div>
              {:else}
                <button class="btn btn-sm btn-warning me-1" on:click={() => onEdit(r)}>Editar</button>
                <button class="btn btn-sm btn-danger" on:click={() => askDelete(r)}>Eliminar</button>
              {/if}
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
