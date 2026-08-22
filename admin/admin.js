import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://iczkhejejovoacdydnxt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SLJXCzZDVjnTtPwAs3u-6g_9xSZ2OHg";

// No session persistence: artifacts can't use browser storage, so
// signing in again each time you open this is expected.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

var state = { entities: [], cards: [] };

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function escapeHtml(s) {
  return (s == null ? "" : String(s)).replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c];
  });
}
function showGlobalErr(msg) {
  var el = document.getElementById("global-err");
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.textContent = msg;
  el.style.display = "block";
}

// ---------- AUTH ----------
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    var errEl = document.getElementById("login-err");
    var btn = document.getElementById("login-submit-btn");
    errEl.style.display = "none";
    btn.disabled = true;
    btn.textContent = "Signing in...";

    var { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    btn.disabled = false;
    btn.textContent = "Sign in";

    if (error) {
      errEl.textContent = error.message;
      errEl.style.display = "block";
      return;
    }
    enterDashboard(data.user);
  });

document
  .getElementById("signout-btn")
  .addEventListener("click", async function () {
    await supabase.auth.signOut();
    document.getElementById("dashboardApp").hidden = true;
    document.getElementById("loginScreen").hidden = false;
    document.getElementById("login-password").value = "";
  });

async function enterDashboard(user) {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("dashboardApp").hidden = false;
  document.getElementById("session-email").textContent = user.email;
  await loadData();
  renderAll();
}

// ---------- DATA (live Supabase) ----------
async function loadData() {
  showGlobalErr("");
  var [entRes, cardRes] = await Promise.all([
    supabase.from("entities").select("*"),
    supabase.from("tech_history_cards").select("*"),
  ]);
  if (entRes.error) {
    showGlobalErr("Failed to load entities: " + entRes.error.message);
    return;
  }
  if (cardRes.error) {
    showGlobalErr("Failed to load history cards: " + cardRes.error.message);
    return;
  }
  state.entities = entRes.data || [];
  state.cards = cardRes.data || [];
}

function entityById(id) {
  for (var i = 0; i < state.entities.length; i++) {
    if (state.entities[i].id === id) return state.entities[i];
  }
  return null;
}
function entityByName(name) {
  var n = (name || "").trim().toLowerCase();
  for (var i = 0; i < state.entities.length; i++) {
    if ((state.entities[i].name || "").trim().toLowerCase() === n)
      return state.entities[i];
  }
  return null;
}
function cardCountForEntity(id) {
  var n = 0;
  for (var i = 0; i < state.cards.length; i++) {
    if (state.cards[i].entity_id === id) n++;
  }
  return n;
}

function updateStats() {
  document.getElementById("stat-entities").textContent = state.entities.length;
  document.getElementById("stat-cards").textContent = state.cards.length;
  if (state.cards.length) {
    var years = state.cards
      .map(function (c) {
        return parseInt(c.year, 10);
      })
      .filter(function (y) {
        return !isNaN(y);
      });
    var lo = Math.min.apply(null, years),
      hi = Math.max.apply(null, years);
    document.getElementById("stat-range").textContent = lo + " - " + hi;
  } else {
    document.getElementById("stat-range").textContent = "-";
  }
}

function refreshDatalists() {
  var catSet = {},
    typeSet = {};
  state.cards.forEach(function (c) {
    if (c.category) catSet[c.category] = 1;
  });
  state.entities.forEach(function (e) {
    if (e.type) typeSet[e.type] = 1;
  });

  document.getElementById("category-list").innerHTML = Object.keys(catSet)
    .sort()
    .map(function (c) {
      return '<option value="' + escapeHtml(c) + '">';
    })
    .join("");

  document.getElementById("type-list").innerHTML = Object.keys(typeSet)
    .sort()
    .map(function (t) {
      return '<option value="' + escapeHtml(t) + '">';
    })
    .join("");

  var sortedEnts = state.entities.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  document.getElementById("entity-name-list").innerHTML = sortedEnts
    .map(function (e) {
      return '<option value="' + escapeHtml(e.name) + '">';
    })
    .join("");

  var catFilter = document.getElementById("h-category-filter");
  var currentVal = catFilter.value;
  catFilter.innerHTML =
    '<option value="">All categories</option>' +
    Object.keys(catSet)
      .sort()
      .map(function (c) {
        return (
          '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>"
        );
      })
      .join("");
  catFilter.value = currentVal;
}

function renderCards() {
  var grid = document.getElementById("card-grid");
  var search = document.getElementById("h-search").value.trim().toLowerCase();
  var catFilter = document.getElementById("h-category-filter").value;
  var sort = document.getElementById("h-sort").value;

  var list = state.cards.filter(function (c) {
    if (catFilter && c.category !== catFilter) return false;
    if (search) {
      var hay = (c.title + " " + c.fact).toLowerCase();
      if (hay.indexOf(search) === -1) return false;
    }
    return true;
  });

  list.sort(function (a, b) {
    if (sort === "year-asc")
      return (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0);
    if (sort === "title-asc") return a.title.localeCompare(b.title);
    return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
  });

  document.getElementById("card-empty").style.display = list.length
    ? "none"
    : "block";

  grid.innerHTML = list
    .map(function (c) {
      var ent = entityById(c.entity_id);
      var entName = ent ? ent.name : "Unlinked";
      return (
        '<div class="idx-card" data-id="' +
        c.id +
        '">' +
        '<div class="idx-top"><span class="yearBadge">' +
        escapeHtml(c.year) +
        '</span><span class="categoryChip">' +
        escapeHtml(c.category || "") +
        "</span></div>" +
        '<p class="idx-title">' +
        escapeHtml(c.title) +
        "</p>" +
        '<p class="idx-fact">' +
        escapeHtml(c.fact) +
        "</p>" +
        '<div class="idx-meta"><span class="idx-entity">' +
        escapeHtml(entName) +
        "</span>" +
        '<span class="idx-actions"><button data-act="edit">Edit</button><button data-act="del" class="del">Delete</button></span></div>' +
        "</div>"
      );
    })
    .join("");

  grid.querySelectorAll(".idx-card").forEach(function (el) {
    var id = el.getAttribute("data-id");
    el.querySelector('[data-act="edit"]').addEventListener(
      "click",
      function () {
        startEditCard(id);
      },
    );
    el.querySelector('[data-act="del"]').addEventListener("click", function () {
      deleteCard(id);
    });
  });
}

function renderEntities() {
  var tbody = document.getElementById("entity-tbody");
  var search = document.getElementById("e-search").value.trim().toLowerCase();

  var list = state.entities
    .filter(function (e) {
      if (!search) return true;
      return (
        ((e.name || "") + " " + (e.type || "") + " " + (e.slug || ""))
          .toLowerCase()
          .indexOf(search) !== -1
      );
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

  document.getElementById("entity-empty").style.display = list.length
    ? "none"
    : "block";

  tbody.innerHTML = list
    .map(function (e) {
      var count = cardCountForEntity(e.id);
      return (
        '<tr data-id="' +
        e.id +
        '">' +
        "<td>" +
        escapeHtml(e.name) +
        "</td>" +
        '<td class="type">' +
        escapeHtml(e.type) +
        "</td>" +
        '<td class="slug">' +
        escapeHtml(e.slug) +
        "</td>" +
        '<td class="count">' +
        count +
        "</td>" +
        '<td><div class="rowActions"><button data-act="edit">Edit</button><button data-act="del">Delete</button></div></td>' +
        "</tr>"
      );
    })
    .join("");

  tbody.querySelectorAll("tr[data-id]").forEach(function (el) {
    var id = el.getAttribute("data-id");
    el.querySelector('[data-act="edit"]').addEventListener(
      "click",
      function () {
        startEditEntity(id);
      },
    );
    el.querySelector('[data-act="del"]').addEventListener("click", function () {
      deleteEntity(id);
    });
  });
}

function renderAll() {
  updateStats();
  refreshDatalists();
  renderCards();
  renderEntities();
}

// Finds an entity by name, or inserts a new one, and returns its id.
async function resolveEntityIdByName(name) {
  name = name.trim();
  var existing = entityByName(name);
  if (existing) return { id: existing.id };

  var newEnt = {
    name: name,
    type: "unspecified",
    slug: slugify(name),
    id: crypto.randomUUID(),
  };
  var { data, error } = await supabase
    .from("entities")
    .insert(newEnt)
    .select()
    .single();
  if (error) return { error: error };
  state.entities.push(data);
  return { id: data.id };
}

function startEditCard(id) {
  var c = state.cards.find(function (x) {
    return x.id === id;
  });
  if (!c) return;
  document.getElementById("card-edit-id").value = id;
  document.getElementById("c-title").value = c.title;
  document.getElementById("c-year").value = c.year;
  document.getElementById("c-category").value = c.category;
  document.getElementById("c-fact").value = c.fact;
  document.getElementById("c-source").value = c.source || "";
  var ent = entityById(c.entity_id);
  document.getElementById("c-entity").value = ent ? ent.name : "";
  document.getElementById("card-form-heading").textContent =
    "Edit history card";
  document.getElementById("card-submit-btn").textContent = "Save changes";
  document.getElementById("card-cancel-btn").style.display = "inline-flex";
  document
    .getElementById("card-form")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}
function resetCardForm() {
  document.getElementById("card-edit-id").value = "";
  document.getElementById("card-form").reset();
  document.getElementById("card-form-heading").textContent =
    "Add a history card";
  document.getElementById("card-submit-btn").textContent = "Add card";
  document.getElementById("card-cancel-btn").style.display = "none";
  document.getElementById("card-err").style.display = "none";
}
async function deleteCard(id) {
  if (!confirm("Delete this history card?")) return;
  var { error } = await supabase
    .from("tech_history_cards")
    .delete()
    .eq("id", id);
  if (error) {
    showGlobalErr("Delete failed: " + error.message);
    return;
  }
  state.cards = state.cards.filter(function (c) {
    return c.id !== id;
  });
  renderAll();
}

function startEditEntity(id) {
  var e = entityById(id);
  if (!e) return;
  document.getElementById("e-edit-id").value = id;
  document.getElementById("e-name").value = e.name;
  document.getElementById("e-type").value = e.type;
  document.getElementById("e-slug").value = e.slug;
  document.getElementById("entity-form-heading").textContent = "Edit entity";
  document.getElementById("entity-submit-btn").textContent = "Save changes";
  document.getElementById("entity-cancel-btn").style.display = "inline-flex";
  document
    .getElementById("entity-form")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}
function resetEntityForm() {
  document.getElementById("e-edit-id").value = "";
  document.getElementById("entity-form").reset();
  document.getElementById("entity-form-heading").textContent = "Add an entity";
  document.getElementById("entity-submit-btn").textContent = "Add entity";
  document.getElementById("entity-cancel-btn").style.display = "none";
  document.getElementById("entity-err").style.display = "none";
}
async function deleteEntity(id) {
  var count = cardCountForEntity(id);
  var msg =
    count > 0
      ? "This entity has " +
        count +
        " history card(s) linked to it. Delete anyway? Linked cards will keep their entity_id pointing at a now-missing entity."
      : "Delete this entity?";
  if (!confirm(msg)) return;
  var { error } = await supabase.from("entities").delete().eq("id", id);
  if (error) {
    showGlobalErr("Delete failed: " + error.message);
    return;
  }
  state.entities = state.entities.filter(function (e) {
    return e.id !== id;
  });
  renderAll();
}

function toCsvValue(v) {
  v = v == null ? "" : String(v);
  if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}
function downloadCsv(filename, rows, headers) {
  var lines = [headers.join(",")];
  rows.forEach(function (r) {
    lines.push(
      headers
        .map(function (h) {
          return toCsvValue(r[h]);
        })
        .join(","),
    );
  });
  var blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document
  .getElementById("card-form")
  .addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var title = document.getElementById("c-title").value.trim();
    var year = document.getElementById("c-year").value.trim();
    var category = document.getElementById("c-category").value.trim();
    var fact = document.getElementById("c-fact").value.trim();
    var source = document.getElementById("c-source").value.trim();
    var entityName = document.getElementById("c-entity").value.trim();
    var errEl = document.getElementById("card-err");
    var submitBtn = document.getElementById("card-submit-btn");

    if (!title || !year || !category || !fact || !entityName) {
      errEl.textContent =
        "Title, year, category, fact, and entity are required.";
      errEl.style.display = "block";
      return;
    }
    errEl.style.display = "none";
    submitBtn.disabled = true;

    var resolved = await resolveEntityIdByName(entityName);
    if (resolved.error) {
      errEl.textContent = "Could not create entity: " + resolved.error.message;
      errEl.style.display = "block";
      submitBtn.disabled = false;
      return;
    }
    var entityId = resolved.id;
    var editId = document.getElementById("card-edit-id").value;

    if (editId) {
      var payload = {
        title: title,
        year: year,
        category: category,
        fact: fact,
        source: source,
        entity_id: entityId,
        event_type: category,
      };
      var { data, error } = await supabase
        .from("tech_history_cards")
        .update(payload)
        .eq("id", editId)
        .select()
        .single();
      if (error) {
        errEl.textContent = "Save failed: " + error.message;
        errEl.style.display = "block";
        submitBtn.disabled = false;
        return;
      }
      var idx = state.cards.findIndex(function (c) {
        return c.id === editId;
      });
      if (idx > -1) state.cards[idx] = data;
    } else {
      var newCard = {
        title: title,
        fact: fact,
        category: category,
        year: year,
        source: source,
        fingerprint: "hash_" + year + "_" + slugify(title).slice(0, 20),
        created_at: new Date().toISOString(),
        entity_id: entityId,
        id: crypto.randomUUID(),
        event_type: category,
      };
      var { data, error } = await supabase
        .from("tech_history_cards")
        .insert(newCard)
        .select()
        .single();
      if (error) {
        errEl.textContent = "Save failed: " + error.message;
        errEl.style.display = "block";
        submitBtn.disabled = false;
        return;
      }
      state.cards.push(data);
    }

    submitBtn.disabled = false;
    resetCardForm();
    renderAll();
  });
document
  .getElementById("card-cancel-btn")
  .addEventListener("click", resetCardForm);

document
  .getElementById("entity-form")
  .addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var name = document.getElementById("e-name").value.trim();
    var type = document.getElementById("e-type").value.trim();
    var slug = document.getElementById("e-slug").value.trim() || slugify(name);
    var errEl = document.getElementById("entity-err");
    var editId = document.getElementById("e-edit-id").value;
    var submitBtn = document.getElementById("entity-submit-btn");

    if (!name || !type) {
      errEl.textContent = "Name and type are required.";
      errEl.style.display = "block";
      return;
    }
    var dup = entityByName(name);
    if (dup && dup.id !== editId) {
      errEl.textContent = 'An entity named "' + name + '" already exists.';
      errEl.style.display = "block";
      return;
    }
    errEl.style.display = "none";
    submitBtn.disabled = true;

    if (editId) {
      var { data, error } = await supabase
        .from("entities")
        .update({ name: name, type: type, slug: slug })
        .eq("id", editId)
        .select()
        .single();
      if (error) {
        errEl.textContent = "Save failed: " + error.message;
        errEl.style.display = "block";
        submitBtn.disabled = false;
        return;
      }
      var idx = state.entities.findIndex(function (e) {
        return e.id === editId;
      });
      if (idx > -1) state.entities[idx] = data;
    } else {
      var newEnt = {
        name: name,
        type: type,
        slug: slug,
        id: crypto.randomUUID(),
      };
      var { data, error } = await supabase
        .from("entities")
        .insert(newEnt)
        .select()
        .single();
      if (error) {
        errEl.textContent = "Save failed: " + error.message;
        errEl.style.display = "block";
        submitBtn.disabled = false;
        return;
      }
      state.entities.push(data);
    }

    submitBtn.disabled = false;
    resetEntityForm();
    renderAll();
  });
document
  .getElementById("entity-cancel-btn")
  .addEventListener("click", resetEntityForm);
document.getElementById("e-name").addEventListener("input", function () {
  if (!document.getElementById("e-edit-id").value) {
    document.getElementById("e-slug").value = slugify(this.value);
  }
});

document.getElementById("h-search").addEventListener("input", renderCards);
document
  .getElementById("h-category-filter")
  .addEventListener("change", renderCards);
document.getElementById("h-sort").addEventListener("change", renderCards);
document.getElementById("e-search").addEventListener("input", renderEntities);

document
  .getElementById("export-cards-btn")
  .addEventListener("click", function () {
    downloadCsv("tech_history_cards.csv", state.cards, [
      "title",
      "fact",
      "category",
      "year",
      "source",
      "fingerprint",
      "created_at",
      "entity_id",
      "id",
      "event_type",
    ]);
  });
document
  .getElementById("export-entities-btn")
  .addEventListener("click", function () {
    downloadCsv("entities.csv", state.entities, ["name", "type", "slug", "id"]);
  });

var tabHistory = document.getElementById("tab-btn-history");
var tabEntities = document.getElementById("tab-btn-entities");
tabHistory.addEventListener("click", function () {
  tabHistory.classList.add("active");
  tabEntities.classList.remove("active");
  document.getElementById("view-history").style.display = "block";
  document.getElementById("view-entities").style.display = "none";
});
tabEntities.addEventListener("click", function () {
  tabEntities.classList.add("active");
  tabHistory.classList.remove("active");
  document.getElementById("view-history").style.display = "none";
  document.getElementById("view-entities").style.display = "block";
});
