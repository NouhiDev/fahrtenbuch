// ------------------------------
// HAUPT-SKRIPT
// für index, info
// ------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // --- ELEMENTE ---

    // Tabelle mit den Einträgen
    const fahrtenListe = document.getElementById("fahrtenListe");

    // Hauptschaltflächen
    const neuerEintragBtn = document.getElementById("neuerEintragBtn");
    const alleEinträgeLöschenBtn = document.getElementById("alleEinträgeLöschenBtn");
    const exportierenBtn = document.getElementById("exportieren");
    const importierenBtn = document.getElementById("importieren");
    const filternBtn = document.getElementById("filtern");

    // Neuen Eintrag Erstellen Popup 
    const neuerEintragContainer = document.getElementById("neuerEintragModal");
    const eintragSpeichernBtn = document.getElementById("eintragSpeichern");
    const eintragSpeichernAbbrechenBtn = document.getElementById("eintragSpeichernAbbrechen");

    // Filtern Popup 
    const filterContainer = document.getElementById("filterModal");
    const filterBestätigenBtn = document.getElementById("filterBestätigen");

    // Alle Einträge Löschen Popup
    const modal = document.getElementById("confirmationModal")
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");

    // Eintrag editieren Popup
    const editmodal = document.getElementById("editierenEintragModal")
    const edityesButton = document.getElementById("eintragEditierenSpeichern");
    const editnoButton = document.getElementById("eintragEditiernSpeichernAbbrechen");

    // --- SCHALTFLÄCHEN FUNKTIONEN ---

    // Neuen Eintrag hinzufügen - NEUER EINTRAG
    neuerEintragBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "block";
        filterContainer.style.display = "none";
    });

    // Neuen Eintrag hinzufügen - ABBRECHEN
    eintragSpeichernAbbrechenBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "none";
        filterContainer.style.display = "none";
    });

    // Neuen Eintrag hinzufügen - SPEICHERN
    eintragSpeichernBtn.addEventListener("click", function() {
        const kilometerstand = document.getElementById("kilometerstand").value;
        const datum = document.getElementById("datum").value;
        
        const preis = document.getElementById("preis").value;
        const liter_getankt = document.getElementById("liter_getankt").value;
        let tankstelle = document.getElementById("tankstelle").value;
        if (tankstelle === "Sonstiges") tankstelle = document.getElementById("others-text").value || "-";
        const sprit = document.getElementById("sprit").value;
    
        if (kilometerstand == "") return
        if (liter_getankt == "") return
        if (preis == "") return
    
        const eintrag = erstelleEintrag("", datum, kilometerstand, preis, liter_getankt , tankstelle, sprit);
        fahrtenListe.appendChild(eintrag);
    
        // Save entry to the server
        saveEntriesToServer([{
            nummer: "",
            datum: datum,
            kilometerstand: kilometerstand,
            preis: preis,
            liter_getankt: liter_getankt,
            tankstelle: tankstelle,
            sprit: sprit
        }]);
        
        // Formular ausblenden und zurücksetzen
        neuerEintragContainer.style.display = "none";
        
        location.reload();
    });

    // Alle Einträge Filtern - EINTRÄGE FILTERN
    filternBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "none";
        filterContainer.style.display = "block";
    });

    // Alle Einträge Filtern - FILTERN
    filterBestätigenBtn.addEventListener("click", function() {
        var now = new Date().toJSON().slice(0, 10);

        const start = document.getElementById("start").value || now;
        const end = document.getElementById("end").value || now;

        document.querySelectorAll('#fahrtenListe tr').forEach(row => {
            const dateString = row.querySelector('td:nth-child(2)').textContent;
            const rowDate = new Date(dateString);
   
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (rowDate < startDate || rowDate > endDate) {
                row.classList.add('versteckt');
            }
        });

        filterContainer.style.display = "none";
    });


    // Alle Einträge löschen - ALLE EINTRÄGE LÖSCHEN
    alleEinträgeLöschenBtn.addEventListener("click", function() {
       modal.style.display = "block";
    });

    // Alle Einträge löschen - LÖSCHFUNKTION
    function deleteAllEntries() {
         while (fahrtenListe.firstChild) {
            fahrtenListe.removeChild(fahrtenListe.firstChild);
        }
        // Alle Einträge aus dem lokalen Speicher entfernen
        localStorage.removeItem("fahrtenbuchEintrag");
    }

    // Alle Einträge löschen - ALLE EINTRÄGE LÖSCHEN BESTÄTIGUNG
    yesButton.addEventListener("click", function() {
       modal.style.display = "none";
       deleteAllEntries();
    });

    // Alle Einträge löschen - ABBRECHEN
    noButton.addEventListener("click", function() {
       modal.style.display = "none";
    });

    // Ereignisdelegation für das Klicken auf den "Löschen" -Knopf für jeden Eintrag
    fahrtenListe.addEventListener("click", function(event) {
        if (event.target.classList.contains("eintragLöschenBtn")) {
            const eintragElement = event.target.parentElement.parentElement;
            eintragElement.remove();

            speichereEinträge();

		  location.reload();
        }
    });

    let editedNumber = 0

    // Ereignisdelegation für das Klicken auf den "Editieren" -Knopf für jeden Eintrag
    fahrtenListe.addEventListener("click", function(event) {
        if (event.target.classList.contains("eintragBearabeiten")) {
            const eintragElement = event.target.parentElement.parentElement;

            const form = editmodal.querySelector("div form");

            editedNumber = eintragElement.children[0].textContent

            // Kilometer setzen
            form.children[1].value = eintragElement.children[2].textContent.split(" ")[0];

            // Datum setzen
            form.children[4].value = eintragElement.children[1].textContent;

            // Preis setzen
            form.children[7].value = eintragElement.children[3].textContent.split(" ")[0];

            // Liter getankt setzen
            form.children[10].value = eintragElement.children[4].textContent.split(" ")[0];

            // Tankstelle setzen
            var tankstelle = eintragElement.children[5].textContent;

            for (var i = 0; i < form.children[13].options.length; i++) {
                if (form.children[13].options[i].textContent === tankstelle) {
                    form.children[13].selectedIndex = i
                }
            }

            // Sprit setzen
            var sprit = eintragElement.children[6].textContent;

            for (var i = 0; i < form.children[17].options.length; i++) {
                if (form.children[17].options[i].textContent === sprit) {
                    form.children[17].selectedIndex = i
                }
            }

            editmodal.style.display = "block";
        }
    });

    // Ereignisdelegation für das Klicken auf den "Editieren Speichern" -Knopf für jeden Eintrag
    edityesButton.addEventListener("click", function() {
        if (event.target.classList.contains("eintragEditierenSpeichern")) {
            var index = (Math.ceil(fahrtenListe.children.length/2) - editedNumber)
            if (index % 2 != 0) index = index + 1;
            const eintragElement = fahrtenListe.children[index]

            editmodal.style.display = "none";

            const kilometerstand = document.getElementById("kilometerstand2").value;
            const datum = document.getElementById("datum2").value;
            
            const preis = document.getElementById("preis2").value;
            const liter_getankt = document.getElementById("liter_getankt2").value;
            let tankstelle = document.getElementById("tankstelle2").value;
            if (tankstelle === "Sonstiges2") tankstelle = document.getElementById("others-text2").value || "-";
            const sprit = document.getElementById("sprit2").value;

            if (kilometerstand == "") return
            if (liter_getankt == "") return
            if (preis == "") return

            const eintrag = erstelleEintrag(editedNumber, datum, kilometerstand, preis, liter_getankt , tankstelle, sprit, "CALC");
            fahrtenListe.insertBefore(eintrag, eintragElement);

            eintragElement.remove();

            speichereEinträge();
            
            location.reload();
        }       
    });

    // Ereignisdelegation für das Klicken auf den "Editieren Abbrechen" -Knopf für jeden Eintrag
    editnoButton.addEventListener("click", function() {
       editmodal.style.display = "none";
    });

    // Exportieren der Einträge als XLSX
    exportierenBtn.addEventListener("click", function() {
        const einträge = [];
        const eintragRows = document.querySelectorAll("#fahrtenListe tr");
        eintragRows.forEach(row => {
            if (row.classList.contains("versteckt")) return;
                const eintrag = {
                    nummer: cleanUpForSaving(row.cells[0].textContent),
                    datum: cleanUpForSaving(row.cells[1].textContent),
                    kilometerstand: cleanUpForSaving(row.cells[2].textContent),
                    preis: cleanUpForSaving(row.cells[3].textContent),
                    liter_getankt: cleanUpForSaving(row.cells[4].textContent),
                    tankstelle: cleanUpForSaving(row.cells[5].textContent),
                    sprit: cleanUpForSaving(row.cells[6].textContent),
                    verbrauch: cleanUpForSaving(row.cells[7].textContent) || '-',
                    literpreis: cleanUpForSaving(row.cells[8].textContent),
            };
            if (eintrag.sprit != "") einträge.push(eintrag);
        });

        const items = einträge
        const replacer = (key, value) => value === null ? '' : value
        const header = Object.keys(items[0])
        const csv = [
        header.join(','),
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n')

        const blob = new Blob([csv], { type: 'text/csv' });

        Papa.parse(blob, {
    	   complete: function(result) {
        		const worksheet = XLSX.utils.json_to_sheet(result.data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
                XLSX.writeFile(workbook, "fahrtenbuch.xlsx");
            },
            header: true
        });
    });

    // Importieren der Einträge als CSV
    importierenBtn.addEventListener("click", function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.addEventListener('change', handleFileSelect);
        fileInput.click();
    });

    // Laden gespeicherter Einträge beim Start
    //ladeGespeicherteEinträge();
    loadEntriesFromServer();
});

// Funktion zur Erstellung und Darstellung von Einträgen
function erstelleEintrag(nummer = '', datum = '', kilometerstand = '', preis = '', liter_getankt = '', tankstelle = '', sprit = '', verbrauch = '', literpreis = '', kmDiff = "", preisDiff = "") {
    const eintragElement = document.createElement("tr");

    var now = new Date().toJSON().slice(0, 10);

    preis = preis.replaceAll(",", ".")
    liter_getankt = liter_getankt.replaceAll(",", ".")

    // Es handelt sich um einen Zwischeneinträg, der die Kilometer-und Preisdifferenz anzeigt
    if (sprit == "") {
        eintragElement.innerHTML = `
            <td class="stat"></td>
            <td class="stat" id="statdat">${datum}</td>
            <td class="stat">${kilometerstand}</td>
            <td class="stat">${preis}</td>
    	    <td class="stat">${liter_getankt}</td>
            <td class="stat">${tankstelle}</td>
            <td class="stat">${sprit}</td>
            <td class="stat">${verbrauch}</td>
            <td class="stat">${literpreis}</td>
            <td class="stat"></td>
        `;

    } 
    // Es handelt sich um einen Haupteintrag
    else {
        eintragElement.classList.add("container-entry")
    	if (datum == "") datum = now

        if (nummer == "" || nummer != Math.ceil(fahrtenListe.childElementCount/2+1)) {
            // Es handelt sic um einen normalen Eintrag
            if (verbrauch != "CALC") {
                nummer = Math.ceil(fahrtenListe.childElementCount/2+1);
            }
            // Es handelt sich um einen Editierten Eintrag
            else {
                var index = (Math.ceil(fahrtenListe.children.length/2) - nummer)
                if (index % 2 != 0) index = index + 1;

                // Eintrag
                if (fahrtenListe.children[index]) {
                    const dieserEintrag = fahrtenListe.children[index]
                    console.log(dieserEintrag)
                }

                // Vorheriger Eintrag
                if (fahrtenListe.children[index+2]) {
                    const vorherigerEintrag = fahrtenListe.children[index+2]

                    const vorherigerKM = parseFloat(vorherigerEintrag.children[2].textContent.split(" ")[0])
                    const vorherigerPREIS = parseFloat(vorherigerEintrag.children[8].textContent.split(" ")[0])

                    verbrauch = 100*(liter_getankt/((kilometerstand-vorherigerKM)))
                    literpreis = preis/liter_getankt
                }
            }
        }

        eintragElement.innerHTML = `
            <td>${nummer}</td>
            <td>${datum}</td>
            <td>${kilometerstand} km<span class="mobile-only">${kmDiff}</span></td>
            <td>${preis} €</td>
    	    <td>${liter_getankt} l</td>
            <td>${tankstelle}</td>
            <td>${sprit}</td>
            <td>${parseFloat(verbrauch).toFixed(2)} l/100km</td>
            <td>${parseFloat(literpreis).toFixed(2)} €<span class="mobile-only">${preisDiff}</span></td>
            <td class="last"><button class="eintragLöschenBtn">✖</button> <button class="eintragBearabeiten">✎</button></td>
        `;

    }
    
    return eintragElement;
}

// Entfernt alle rein visuellen Elemente (Einheiten und Differenzen für die mobile Ansicht)
function cleanUpForSaving(str) {
    return str.split(" ")[0];
}

// DATABASE FUNCTIONS

// Saving entries to the server
function saveEntriesToServer(entries) {
    fetch('https://ndevapi.com/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ einträge: entries })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save entries to the server.');
        }
        console.log('Entries saved successfully.');
    })
    .catch(error => {
        console.error(error.message);
    });
}

// Loading entries from the server
function loadEntriesFromServer() {
    fetch('https://ndevapi.com/fetch')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch entries from the server.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Data retrieved successfully
            const entries = data.data;
            // Process retrieved entries as needed
            entries.forEach(entry => {
                const eintragElement = erstelleEintrag(entry.nummer, entry.datum, entry.kilometerstand, entry.preis, entry.liter_getankt, entry.tankstelle, entry.sprit, entry.verbrauch, entry.literpreis);
                fahrtenListe.appendChild(eintragElement);
            });
            console.log('Entries loaded successfully:', entries);
        } else {
            throw new Error('Server returned an error:', data.message);
        }
    })
    .catch(error => {
        console.error(error.message);
    });
}

// Speichert die Einträge in absteigender Reihenfolge
function speichereEinträge() {
    const einträge = [];
    const eintragRows = document.querySelectorAll("#fahrtenListe tr");
    eintragRows.forEach(row => {
        const eintrag = {
            nummer: cleanUpForSaving(row.cells[0].textContent),
            datum: cleanUpForSaving(row.cells[1].textContent),
            kilometerstand: cleanUpForSaving(row.cells[2].textContent),
            preis: cleanUpForSaving(row.cells[3].textContent),
	        liter_getankt: cleanUpForSaving(row.cells[4].textContent),
            tankstelle: cleanUpForSaving(row.cells[5].textContent),
            sprit: cleanUpForSaving(row.cells[6].textContent),
            verbrauch: cleanUpForSaving(row.cells[7].textContent) || '-',
            literpreis: cleanUpForSaving(row.cells[8].textContent),
        };

    	if (eintrag.sprit != "") {  
            einträge.push(eintrag); 
        }

    });

    localStorage.setItem("fahrtenbuchEintrag", JSON.stringify(einträge));
}

// Lädt die gespeicherten Einträge in aufsteigender Reihenfolge
function ladeGespeicherteEinträge() {
    let moreThanOne = false;
    let lastKm = "";
    let lastPreis = "";

    let lastKmDiff = "";
    let lastPreisDiff = "";

    const gespeicherteEinträge = JSON.parse(localStorage.getItem("fahrtenbuchEintrag"));
    gespeicherteEinträge.sort(function(a,b) {
        return parseFloat(a.nummer) - parseFloat(b.nummer);
    });

    if (gespeicherteEinträge) {
        gespeicherteEinträge.forEach(eintrag => {
	        eintrag.tankstelle = eintrag.tankstelle.replace("�", "ö");

            if (isNaN(eintrag.verbrauch)) {
                eintrag.verbrauch = 100*(eintrag.liter_getankt/((eintrag.kilometerstand-lastKm)))
            }

            if (isNaN(eintrag.literpreis)) {
                eintrag.literpreis = eintrag.preis/eintrag.liter_getankt
            }

        	if (moreThanOne == true && eintrag.datum != "") {

                const dif = eintrag.kilometerstand-lastKm

        		const kmDiff = "<span id='green'>⇧ " + (dif.toLocaleString()).toString() + " km gefahren</span>";
        		let preisDiff = ((eintrag.preis/eintrag.liter_getankt)-lastPreis).toFixed(2);
                if (preisDiff > 0) 
                { 
                    preisDiff = "<span id='rot'>↑ " + preisDiff + " € teurer</span>";
                } else if (preisDiff[0] == "-") {
                    preisDiff = "<span id='green'>↓ " + preisDiff.substring(1) + " € billiger</span>";
                } else {
                    preisDiff = "nahezu unverändert";
                }
                if (preisDiff == "<span id='green'>↓ 0.00 € billiger</span>") preisDiff = "nahezu unverändert";
        		let literDiff = "";

                lastKmDiff = kmDiff;
                lastPreisDiff = preisDiff;

        		const eintragElement2 = erstelleEintrag("", eintrag.datum , kmDiff, "" , literDiff , "", "", "", preisDiff, "", "");
        		fahrtenListe.insertBefore(eintragElement2, fahrtenListe.firstChild);

        	}

            if (moreThanOne) {
                const eintragElement = erstelleEintrag(eintrag.nummer, eintrag.datum, eintrag.kilometerstand, eintrag.preis, eintrag.liter_getankt, eintrag.tankstelle, eintrag.sprit,  eintrag.verbrauch, eintrag.literpreis, lastKmDiff, lastPreisDiff);
                fahrtenListe.insertBefore(eintragElement, fahrtenListe.firstChild);
            } else {
                const eintragElement = erstelleEintrag(eintrag.nummer, eintrag.datum, eintrag.kilometerstand, eintrag.preis, eintrag.liter_getankt, eintrag.tankstelle, eintrag.sprit, 0, 0);
                fahrtenListe.insertBefore(eintragElement, fahrtenListe.firstChild);
            }

	   
    	    lastKm = eintrag.kilometerstand;
    	    lastPreis = eintrag.preis/eintrag.liter_getankt;
    	    moreThanOne = true;
        });
    }
}

// Popup und lesung der CSV-Dateim zum importieren
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        parseCSVContents(contents);
    };

    reader.readAsText(file);
}

// Gliedert die importierte CSV-Datei in einen verwertbaren Syntax
function parseCSVContents(contents) {
    const lines = contents.split('\n');
    for(let i = lines.length - 1; i >= 1; i--) {
        const cells = lines[i].split(',');
        if (cells.length >= 8) {
            const cleanedCells = cells.map(cell => cell.replace(/"/g, ''));
            const eintragElement = erstelleEintrag(...cleanedCells);
            fahrtenListe.appendChild(eintragElement);
        }
    }

    speichereEinträge()
    location.reload()
}

// Togglet die Navigationsleiste
function toggleBar() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// Zuständig für das Anzeigen des extra Textfeldes bei der Auswahl "Sonstiges"
function updateTankstelleInput() {
    // Neuer Eintrag Popup
    var x = document.getElementById("tankstelle").value;
    var input = document.getElementById("others-text");
    if (x === "Sonstiges") {
        input.style.display = "inline-block";
    } else {
        input.style.display = "none";
    }

    // Eintrag editieren Popup
    var y = document.getElementById("tankstelle2").value;
    var input2 = document.getElementById("others-text2");
    if (y === "Sonstiges2") {
        input2.style.display = "inline-block";
    } else {
        input2.style.display = "none";
    }
}