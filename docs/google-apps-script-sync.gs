/**
 * Google Apps Script — synchro des utilisateurs Harvests vers Google Sheets
 * ---------------------------------------------------------------------
 * À coller dans le projet Apps Script existant (script.google.com), lié à la
 * feuille visée, en remplacement du doPost() actuel. Ce script :
 *   - ajoute une ligne pour chaque nouvelle inscription (action "create")
 *   - retrouve et met à jour la ligne existante quand un nom/e-mail/téléphone
 *     change côté Harvests (action "update"), au lieu d'ajouter un doublon
 *   - remplit Email/Téléphone sur les lignes déjà présentes avant l'ajout de
 *     ces colonnes, ponctuellement, en retrouvant la ligne par nom+date plutôt
 *     que par e-mail (action "backfill" — voir scripts/backfillSheetContacts.js)
 *
 * PRÉ-REQUIS DANS LA FEUILLE :
 * Ajouter deux colonnes d'en-tête (ligne 1, peu importe leur position) :
 *   "Email" et "Téléphone"
 * Les en-têtes déjà utilisés ("Date inscription", Commercial, Producteur,
 * Transformateur, Restaurateur, Exportateur, Transporteur, Consommateur,
 * "Total inscriptions") restent inchangés — le script les retrouve par leur
 * nom exact, pas par position. Attention à bien respecter l'intitulé complet
 * de la feuille HARVEST_DASHBOARD_DATA : "Date inscription" et "Total
 * inscriptions", pas "Date"/"Total" ni le pluriel des colonnes de rôle — des
 * versions antérieures de ce script cherchaient les mauvais noms et ne
 * trouvaient donc jamais ces colonnes (Date/Total toujours vides sur les
 * lignes créées par la synchro, rôles jamais renseignés).
 *
 * Le nom de la feuille à cibler se configure ci-dessous (SHEET_NAME).
 */

const SHEET_NAME = "HARVEST_DASHBOARD_DATA";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SHEET_NAME
      ? SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
      : SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (!sheet) {
      return respond({ status: "error", message: "Feuille introuvable" });
    }

    const headers = getHeaders(sheet);
    const emailCol = headers["Email"];
    if (!emailCol) {
      return respond({
        status: "error",
        message: 'Colonne "Email" manquante — ajoute-la en ligne 1 avant de réessayer.',
      });
    }

    if (payload.action === "update") {
      const rowIndex = findRowByEmail(sheet, emailCol, payload.lookupEmail);
      if (rowIndex) {
        updateRow(sheet, headers, rowIndex, payload);
        return respond({ status: "success", action: "updated", row: rowIndex });
      }
      // Pas trouvé (ligne antérieure à l'ajout de la colonne Email, par ex.) : on ajoute.
      appendRow(sheet, headers, payload);
      return respond({ status: "success", action: "created (fallback)" });
    }

    if (payload.action === "backfill") {
      return respond(backfillContact(sheet, headers, payload));
    }

    if (payload.action === "inspectRows") {
      return respond(inspectRows(sheet, headers, payload));
    }

    if (payload.action === "fillRowByNumber") {
      return respond(fillRowByNumber(sheet, headers, payload));
    }

    appendRow(sheet, headers, payload);
    return respond({ status: "success", action: "created" });
  } catch (err) {
    return respond({ status: "error", message: err.message });
  } finally {
    lock.releaseLock();
  }
}

/** Construit une map {NomEnTête: numéroColonne (1-based)} à partir de la ligne 1 */
function getHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  const values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  values.forEach((name, i) => {
    if (name) map[String(name).trim()] = i + 1;
  });
  return map;
}

/** Cherche la ligne (1-based) dont la colonne Email correspond, sinon null */
function findRowByEmail(sheet, emailCol, email) {
  if (!email) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const values = sheet.getRange(2, emailCol, lastRow - 1, 1).getValues();
  const target = String(email).trim().toLowerCase();

  for (let i = 0; i < values.length; i++) {
    const cell = String(values[i][0] || "").trim().toLowerCase();
    if (cell && cell === target) {
      return i + 2; // +2 : offset de la ligne d'en-tête + index 0-based
    }
  }
  return null;
}

/**
 * Ne concerne pas les nouvelles inscriptions : sert à remplir Email/Téléphone
 * sur les lignes déjà présentes dans la feuille avant l'ajout de ces colonnes
 * (import historique, ancien flux Power Automate...), où la colonne Email est
 * donc vide et le matching par e-mail de `update` est impossible.
 * Retrouve la ligne par nom exact dans la colonne de rôle concernée
 * (Producteur/Transformateur/...), avec la date en désambiguïsateur si
 * plusieurs lignes portent le même nom. Ne remplit que les cellules vides —
 * ne touche jamais une ligne dont Email/Téléphone est déjà renseigné, et ne
 * devine jamais en cas de doublon ou d'absence de correspondance : elle
 * remonte ambiguous/not_found pour traitement manuel plutôt que d'écrire au
 * mauvais endroit.
 */
function backfillContact(sheet, headers, payload) {
  const roleHeaders = [
    "Producteur",
    "Transformateur",
    "Restaurateur",
    "Exportateur",
    "Transporteur",
    "Consommateur",
  ];
  const roleKeys = {
    Producteur: "producteurs",
    Transformateur: "transformateurs",
    Restaurateur: "restaurateurs",
    Exportateur: "exportateurs",
    Transporteur: "transporteurs",
    Consommateur: "consommateurs",
  };

  let roleHeader = null;
  let name = "";
  for (let i = 0; i < roleHeaders.length; i++) {
    const value = payload[roleKeys[roleHeaders[i]]];
    if (value) {
      roleHeader = roleHeaders[i];
      name = String(value).trim();
      break;
    }
  }

  if (!roleHeader || !name) {
    return { status: "error", result: "no_name", message: "Aucun nom de rôle fourni dans le payload." };
  }

  const roleCol = headers[roleHeader];
  const dateCol = headers["Date inscription"];
  if (!roleCol) {
    return { status: "error", result: "no_role_column", message: `Colonne "${roleHeader}" introuvable.` };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { status: "success", result: "not_found", name: name };
  }

  const roleValues = sheet.getRange(2, roleCol, lastRow - 1, 1).getValues();
  const target = name.toLowerCase();
  let matches = [];
  for (let i = 0; i < roleValues.length; i++) {
    const cell = String(roleValues[i][0] || "").trim().toLowerCase();
    if (cell && cell === target) {
      matches.push(i + 2); // +2 : offset ligne d'en-tête + index 0-based
    }
  }

  if (matches.length === 0) {
    return { status: "success", result: "not_found", name: name };
  }

  if (matches.length > 1 && dateCol && payload.date) {
    const dateValues = sheet.getRange(2, dateCol, lastRow - 1, 1).getDisplayValues();
    const targetDate = String(payload.date).trim();
    const narrowed = matches.filter((rowIndex) => {
      const cell = String(dateValues[rowIndex - 2][0] || "").trim();
      return cell === targetDate;
    });
    if (narrowed.length > 0) matches = narrowed;
  }

  if (matches.length > 1) {
    return { status: "success", result: "ambiguous", name: name, rows: matches };
  }

  const rowIndex = matches[0];
  const emailCol = headers["Email"];
  const telCol = headers["Téléphone"];
  let wrote = false;

  if (emailCol && payload.email) {
    const current = sheet.getRange(rowIndex, emailCol).getValue();
    if (!current) {
      sheet.getRange(rowIndex, emailCol).setValue(payload.email);
      wrote = true;
    }
  }
  if (telCol && payload.telephone) {
    const current = sheet.getRange(rowIndex, telCol).getValue();
    if (!current) {
      sheet.getRange(rowIndex, telCol).setValue(payload.telephone);
      wrote = true;
    }
  }

  return { status: "success", result: wrote ? "filled" : "already_filled", name: name, row: rowIndex };
}

/**
 * Diagnostic en lecture seule : renvoie le contenu complet (toutes colonnes
 * d'en-tête) des numéros de ligne demandés (payload.rows, tableau de numéros
 * 1-based). N'écrit jamais rien — sert uniquement à décider, côté appelant,
 * quelle ligne garder/supprimer en cas de doublon, ou à vérifier le contenu
 * exact d'une ligne suspecte.
 */
function inspectRows(sheet, headers, payload) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const lastCol = sheet.getLastColumn();
  const headerNames = Object.keys(headers);

  const result = rows.map((rowIndex) => {
    if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
      return { row: rowIndex, error: "hors limites" };
    }
    const values = sheet.getRange(rowIndex, 1, 1, lastCol).getDisplayValues()[0];
    const data = {};
    headerNames.forEach((name) => {
      data[name] = values[headers[name] - 1];
    });
    return { row: rowIndex, data: data };
  });

  return { status: "success", rows: result };
}

/**
 * Remplit Email/Téléphone sur un numéro de ligne précis (payload.row, 1-based),
 * pour les cas de réconciliation manuelle où le nom en base ne correspond plus
 * exactement au nom déjà présent dans la feuille (ex. renommage d'entreprise
 * depuis l'import historique). Comme backfillContact, n'écrase jamais une
 * cellule déjà remplie.
 */
function fillRowByNumber(sheet, headers, payload) {
  const rowIndex = payload.row;
  if (!rowIndex || rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    return { status: "error", result: "invalid_row", message: "Numéro de ligne invalide." };
  }

  const fillableFields = [
    { header: "Email", key: "email" },
    { header: "Téléphone", key: "telephone" },
    { header: "Date inscription", key: "date" },
    { header: "Total inscriptions", key: "total" },
  ];
  let wrote = false;

  fillableFields.forEach(({ header, key }) => {
    const col = headers[header];
    const value = payload[key];
    if (col && value !== undefined && value !== "") {
      const current = sheet.getRange(rowIndex, col).getValue();
      if (!current) {
        sheet.getRange(rowIndex, col).setValue(value);
        wrote = true;
      }
    }
  });

  return { status: "success", result: wrote ? "filled" : "already_filled", row: rowIndex };
}

/** Ajoute une nouvelle ligne en fin de feuille */
function appendRow(sheet, headers, payload) {
  const lastCol = sheet.getLastColumn();
  const row = new Array(lastCol).fill("");

  setIfPresent(row, headers, "Date inscription", payload.date);
  setIfPresent(row, headers, "Commercial", payload.commercial);
  setIfPresent(row, headers, "Producteur", payload.producteurs);
  setIfPresent(row, headers, "Transformateur", payload.transformateurs);
  setIfPresent(row, headers, "Restaurateur", payload.restaurateurs);
  setIfPresent(row, headers, "Exportateur", payload.exportateurs);
  setIfPresent(row, headers, "Transporteur", payload.transporteurs);
  setIfPresent(row, headers, "Consommateur", payload.consommateurs);
  setIfPresent(row, headers, "Total inscriptions", payload.total);
  setIfPresent(row, headers, "Email", payload.email);
  setIfPresent(row, headers, "Téléphone", payload.telephone);

  sheet.appendRow(row);
}

/** Met à jour les colonnes pertinentes d'une ligne existante (ne touche pas Date/Commercial/Total) */
function updateRow(sheet, headers, rowIndex, payload) {
  const fields = [
    "Producteur",
    "Transformateur",
    "Restaurateur",
    "Exportateur",
    "Transporteur",
    "Consommateur",
    "Email",
    "Téléphone",
  ];
  const payloadKeys = {
    Producteur: "producteurs",
    Transformateur: "transformateurs",
    Restaurateur: "restaurateurs",
    Exportateur: "exportateurs",
    Transporteur: "transporteurs",
    Consommateur: "consommateurs",
    Email: "email",
    Téléphone: "telephone",
  };

  fields.forEach((header) => {
    const col = headers[header];
    const value = payload[payloadKeys[header]];
    // On n'écrase que les colonnes réellement fournies dans le payload
    if (col && value !== undefined) {
      sheet.getRange(rowIndex, col).setValue(value);
    }
  });
}

function setIfPresent(row, headers, headerName, value) {
  const col = headers[headerName];
  if (col && value !== undefined) {
    row[col - 1] = value;
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
