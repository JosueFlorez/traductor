<script>
  import WordForm from './components/WordForm.svelte';
  import WordsTable from './components/WordsTable.svelte';
  import TranslateBox from './components/TranslateBox.svelte';
  import { listWords, createWord, updateWord, deleteWord } from './api';
  import { onMount } from 'svelte';

  // ---------- Router súper simple por hash ----------
  let page = 'translate'; // default
  function setPageFromHash() {
    const h = (location.hash || '#/translate').replace('#/', '');
    page = (h === 'words' || h === 'translate') ? h : 'translate';
  }
  function go(to) {
    location.hash = `/${to}`;
  }
  onMount(() => {
    setPageFromHash();
    window.addEventListener('hashchange', setPageFromHash);
  });

  // ---------- Estado CRUD ----------
  let words = [];
  let q = '';
  let lang = '';
  let loading = true;
  let error = '';
  let editRow = null;
  let count = 0;

  async function load() {
    loading = true; error = '';
    try {
      const { data } = await listWords({ q, lang });
      words = data;
      count = words.length;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(form) {
    try {
      if (form.id) {
        await updateWord(form.id, {
          source_lang: form.source_lang,
          source_text: form.source_text,
          target_text: form.target_text
        });
      } else {
        await createWord({
          source_lang: form.source_lang,
          source_text: form.source_text,
          target_text: form.target_text
        });
      }
      editRow = null;
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(row) { editRow = { ...row }; }
  function cancelEdit() { editRow = null; }
  async function removeRow(row) {
    try { await deleteWord(row.id); await load(); }
    catch (err) { alert(err.message); }
  }

  // Cargar lista cuando estamos en la página de CRUD o cuando cambien filtros
  $: if (page === 'words') { load(); }
  $: if (page === 'words') { q, lang, load(); }
</script>

<div class="container py-4">
  <h1 class="mb-3">📚 Traductor ES ↔ EN </h1>
  <p class="text-muted">Backend: http://localhost:4000 · Usa las pestañas para cambiar de vista</p>

  <!-- Nav Tabs -->
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <a
        class="nav-link {page === 'translate' ? 'active' : ''}"
        href="#/translate"
        on:click|preventDefault={() => go('translate')}
        >Traductor</a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link {page === 'words' ? 'active' : ''}"
        href="#/words"
        on:click|preventDefault={() => go('words')}
        >Diccionario (CRUD)</a>
    </li>
  </ul>

  {#if page === 'translate'}
    <!-- --------- PÁGINA: TRADUCTOR --------- -->
    <div class="row">
      <div class="col-lg-6">
        <TranslateBox />
      </div>
      <div class="col-lg-6">
        <div class="alert alert-info">
          Aquí solo traduces. Para administrar palabras ve a <strong>Diccionario (CRUD)</strong>.
        </div>
      </div>
    </div>

  {:else if page === 'words'}
    <!-- --------- PÁGINA: CRUD --------- -->
    <div class="row g-4">
      <div class="col-lg-5">
        <WordForm
          onSubmit={handleSubmit}
          initial={editRow ?? { id: '', source_lang: 'es', source_text: '', target_text: '' }}
          onCancel={cancelEdit}
        />
      </div>

      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 mb-3">
              <div class="input-group" style="max-width: 360px;">
                <span class="input-group-text">Buscar</span>
                <input class="form-control" placeholder="Texto o traducción..." bind:value={q} />
              </div>
              <div class="input-group" style="max-width: 220px;">
                <span class="input-group-text">Idioma</span>
                <select class="form-select" bind:value={lang}>
                  <option value=''>Todos</option>
                  <option value='es'>es</option>
                  <option value='en'>en</option>
                </select>
              </div>
              <button class="btn btn-outline-primary" on:click={load}>Recargar</button>
            </div>

            {#if loading}
              <div class="text-muted">Cargando...</div>
            {:else if error}
              <div class="text-danger">Error: {error}</div>
            {:else}
              <WordsTable rows={words} onEdit={startEdit} onDelete={removeRow} />
              <p class="text-muted mt-2">{count} resultado(s)</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* marcar pestaña activa cuando Bootstrap no lo hace por hidratar */
  .nav-link.active { font-weight: 600; }
</style>
