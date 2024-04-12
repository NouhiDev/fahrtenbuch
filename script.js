document.addEventListener("DOMContentLoaded", function() {
    const neuerEintragBtn = document.getElementById("neuerEintragBtn");
    const alleEinträgeLöschenBtn = document.getElementById("alleEinträgeLöschenBtn");
    const fahrtenListe = document.getElementById("fahrtenListe");
    const eintragFormular = document.getElementById("eintragFormular");
    const filterFormular = document.getElementById("filterFormular");
    const eintragSpeichernBtn = document.getElementById("eintragSpeichern");
    const filterBestätigenBtn = document.getElementById("filterBestätigen");
    const exportierenBtn = document.getElementById("exportieren");
    const importierenBtn = document.getElementById("importieren");
    const filternBtn = document.getElementById("filtern");
    const eintragSpeichernAbbrechenBtn = document.getElementById("eintragSpeichernAbbrechen");
    const filterContainer = document.getElementById("filterModal");
    const neuerEintragContainer = document.getElementById("neuerEintragModal");

    const modal = document.getElementById("confirmationModal")
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");

    // Neuen Eintrag hinzufügen
    neuerEintragBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "block";
        filterContainer.style.display = "none";
    });

    eintragSpeichernAbbrechenBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "none";
        filterContainer.style.display = "none";
    });

    // Filtern
    filternBtn.addEventListener("click", function() {
        neuerEintragContainer.style.display = "none";
        filterContainer.style.display = "block";
    });

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

    // Eintrag speichern
    eintragSpeichernBtn.addEventListener("click", function() {
        const kilometerstand = document.getElementById("kilometerstand").value;
        const datum = document.getElementById("datum").value;
        
        const preis = document.getElementById("preis").value;
	const liter_getankt = document.getElementById("liter_getankt").value;
        const tankstelle = document.getElementById("tankstelle").value;
        const sprit = document.getElementById("sprit").value;

        if (kilometerstand == "") return
        if (liter_getankt == "") return
        if (preis == "") return

        const eintrag = erstelleEintrag("", datum, kilometerstand, preis, liter_getankt , tankstelle, sprit);
        fahrtenListe.appendChild(eintrag);

        // Eintrag im lokalen Speicher speichern
        speichereEinträge();
        
        // Formular ausblenden und zurücksetzen
        eintragFormular.classList.remove("sichtbar");
        
        location.reload();
    });

    function deleteAllEntries() {
         while (fahrtenListe.firstChild) {
            fahrtenListe.removeChild(fahrtenListe.firstChild);
        }
        // Alle Einträge aus dem lokalen Speicher entfernen
        localStorage.removeItem("fahrtenbuchEintrag");
    }

    // Alle Einträge löschen
    alleEinträgeLöschenBtn.addEventListener("click", function() {
       modal.style.display = "block";
    });

    yesButton.addEventListener("click", function() {
       modal.style.display = "none";
       deleteAllEntries();
    });

    noButton.addEventListener("click", function() {
       modal.style.display = "none";
    });

    // Ereignisdelegation für das Klicken auf den "Löschen" -Knopf für jeden Eintrag
    fahrtenListe.addEventListener("click", function(event) {
        if (event.target.classList.contains("eintragLöschenBtn")) {
            const eintragElement = event.target.parentElement.parentElement;
            eintragElement.remove();

            // Eintrag aus dem lokalen Speicher entfernen
            speichereEinträge();

		location.reload();
        }
    });

    // Ereignisdelegation für das Klicken auf den "Editieren" -Knopf für jeden Eintrag
    fahrtenListe.addEventListener("click", function(event) {
        if (event.target.classList.contains("eintragBearabeiten")) {
            const eintragElement = event.target.parentElement.parentElement;
            console.log(eintragElement.innerHTML)
            speichereEinträge();

        location.reload();
        }
    });

    // Exportieren der Einträge als CSV
    exportierenBtn.addEventListener("click", function() {
        const einträge = [];
        const eintragRows = document.querySelectorAll("#fahrtenListe tr");
        eintragRows.forEach(row => {
            if (row.classList.contains("versteckt")) return;
            const eintrag = {
            nummer: row.cells[0].textContent,
            datum: row.cells[1].textContent,
            kilometerstand: row.cells[2].textContent,
            preis: row.cells[3].textContent,
            liter_getankt: row.cells[4].textContent,
            tankstelle: row.cells[5].textContent,
            sprit: row.cells[6].textContent,
            verbrauch: row.cells[7].textContent || '-',
            literpreis: row.cells[8].textContent,
        };
        if (eintrag.sprit != "") {         einträge.push(eintrag); }
    
        });

        const items = einträge
        const replacer = (key, value) => value === null ? '' : value
        const header = Object.keys(items[0])
        const csv = [
        header.join(','), // header row first
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

    importierenBtn.addEventListener("click", function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.addEventListener('change', handleFileSelect);
        fileInput.click();


    });

    // Laden gespeicherter Einträge beim Start
    ladeGespeicherteEinträge();
});

function erstelleEintrag(nummer = '', datum = '', kilometerstand = '', preis = '', liter_getankt = '', tankstelle = '', sprit = '', verbrauch = '', literpreis = '') {
    const eintragElement = document.createElement("tr");
     var now = new Date().toJSON().slice(0, 10);
     preis = preis.replaceAll(",", ".")
     liter_getankt = liter_getankt.replaceAll(",", ".")
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

    } else {
        	if (datum == "") datum = now

            if (nummer == "" || nummer != Math.ceil(fahrtenListe.childElementCount/2+1)) nummer = Math.ceil(fahrtenListe.childElementCount/2+1)
        eintragElement.innerHTML = `
            <td>${nummer}</td>
            <td>${datum}</td>
            <td>${kilometerstand}</td>
            <td>${preis}</td>
    	<td>${liter_getankt}</td>
            <td>${tankstelle}</td>
            <td>${sprit}</td>
            <td>${parseFloat(verbrauch).toFixed(2)}</td>
            <td>${parseFloat(literpreis).toFixed(2)}</td>
            <td class="last"><button class="eintragLöschenBtn">✖</button> <button class="eintragBearabeiten">✎</button></td>
        `;

    }

        return eintragElement;
    }

function cleanUpForSaving(str) {
    return str
}

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

let moreThanOne = false;
let lastKm = "";
let lastPreis = "";

function ladeGespeicherteEinträge() {
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
		let preisDiff = ((eintrag.preis/eintrag.liter_getankt)-lastPreis).toFixed(2)
        if (preisDiff > 0) 
        { 
            preisDiff = "<span id='rot'>↑ " + preisDiff + " € teurer</span>"
        } else if (preisDiff[0] == "-") {
            preisDiff = "<span id='green'>↓ " + preisDiff.substring(1) + " € billiger</span>"
        } else {
            preisDiff = "nahezu unverändert"
        }
		let literDiff = ""

		const eintragElement2 = erstelleEintrag("", eintrag.datum , kmDiff, "" , literDiff , "", "", "", preisDiff);
		fahrtenListe.insertBefore(eintragElement2, fahrtenListe.firstChild);


	    }
      if (moreThanOne) {
                  const eintragElement = erstelleEintrag(eintrag.nummer, eintrag.datum, eintrag.kilometerstand, eintrag.preis, eintrag.liter_getankt, eintrag.tankstelle, eintrag.sprit,  eintrag.verbrauch, eintrag.literpreis);
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

function toggleBar() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}