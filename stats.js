// FAHRTENBUCH STATISTIK

//  <canvas id="myChart" style="width:100%;max-width:700px"></canvas>

var einträge = []

document.addEventListener("DOMContentLoaded", function() {
	const container = document.getElementsByClassName("container2")[0];
	const filternBtn = document.getElementById("filtern2");
	const filterBestätigenBtn = document.getElementById("filterBestätigen");
	const filterContainer = document.getElementById("filterModal");

	einträge = ladeGespeicherteEinträge(container);

	filternBtn.addEventListener("click", function() {
       filterContainer.style.display = "block";
    });

    filterBestätigenBtn.addEventListener("click", function() {
    	filterContainer.style.display = "none";
        var now = new Date().toJSON().slice(0, 10);

        const start = document.getElementById("start").value || now;
        const end = document.getElementById("end").value || now;

        ladeGespeicherteEinträge(container, start, end)
    });

});


function appendTextToContainer(text = "") {
	const container = document.getElementsByClassName("container2")[0];
	if (container) {
		const element = document.createElement("p");
		element.innerHTML = text;
		container.appendChild(element);
	}
}

function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function ladeGespeicherteEinträge(container, start, end) {
    const gespeicherteEinträge = JSON.parse(localStorage.getItem("fahrtenbuchEintrag"));

    container.innerHTML = ""

    if (start && end) {
    	if (gespeicherteEinträge) {
			const startDate = new Date(start);
	        const endDate = new Date(end);

	        let validEntries = []
	        let kilometer = 0
	        let letzteKilomter = 0
	        let preise = 0
	        let literpreis = 0
	        let verbrauch = 0
	        let liter_getankt = 0
	        let tankstellen = []
	        let sprit = []

	        gespeicherteEinträge.forEach(eintrag => {
	        	const rowDate = new Date(eintrag.datum);

	        	if (rowDate >= startDate && rowDate <= endDate) {
	            	validEntries.push(eintrag)
	            	if (eintrag.kilometerstand) { 
		   				if (letzteKilomter > 0) {
		   					kilometer = kilometer + parseFloat(eintrag.kilometerstand-letzteKilomter)
		   				}
		   				letzteKilomter = eintrag.kilometerstand

		   			}
		   			if (eintrag.preis) preise = preise + parseFloat(eintrag.preis)
		   			if (eintrag.literpreis && !isNaN(eintrag.literpreis)) literpreis = literpreis + parseFloat(eintrag.literpreis)
		   			if (eintrag.verbrauch && !isNaN(eintrag.verbrauch)) verbrauch = verbrauch + parseFloat(eintrag.verbrauch)
		   			if (eintrag.liter_getankt) liter_getankt = liter_getankt + parseFloat(eintrag.liter_getankt)
		   			if (eintrag.tankstelle) {
						eintrag.tankstelle = eintrag.tankstelle.replace("�", "ö");
		   				tankstellen.push(eintrag.tankstelle)
		   			}
		   			if (eintrag.sprit) {
		   				sprit.push(eintrag.sprit)
		   			}
	        	}
	        });

	        appendTextToContainer(`<b>ZEITRAUM:</b> ${start} bis ${end}`);
	        appendTextToContainer(`<b>Anzahl an Einträgen:</b> ${validEntries.length}`);
	        appendTextToContainer(`<b>Kilometer gefahren:</b> ${(kilometer).toLocaleString()} km`);
	        appendTextToContainer(`<b>Durchschnittliche Distanz gefahren:</b> ${(kilometer/validEntries.length).toFixed(2)} km`);

	   		appendTextToContainer(`<b>Tankkosten:</b> ${preise.toFixed(2)} €`);
	   		appendTextToContainer(`<b>Durchschnittlicher Tankpreis:</b> ${(preise/validEntries.length).toFixed(2)} €`);
	   		appendTextToContainer(`<b>Durchschnittlicher Literpreis:</b> ${(literpreis/validEntries.length).toFixed(2)} €`);

	   		appendTextToContainer(`<b>Insgesamt Getankt:</b> ${liter_getankt.toFixed(2)} l`);
	   		appendTextToContainer(`<b>Durchschnittliches Tankvolumen:</b> ${(liter_getankt/validEntries.length).toFixed(2)} l`);
	   		appendTextToContainer(`<b>Durchschnittlicher Verbrauch:</b> ${(verbrauch/validEntries.length).toFixed(2)} l/100km`);
	   		appendTextToContainer(`<b>Meist besuchte Tankstelle:</b> ${mode(tankstellen)}`);
	   		appendTextToContainer(`<b>Meist getankter Sprit:</b> ${mode(sprit)}`);
		       
    	}

    } else {

	//appendTextToContainer(`<hr>`);
	appendTextToContainer(`<b>ZEITRAUM:</b> Gesamte Zeit`);
    appendTextToContainer(`<b>Anzahl an Einträgen:</b> ${gespeicherteEinträge.length}`);
    appendTextToContainer(`<b>Kilometer gefahren:</b> ${(gespeicherteEinträge[gespeicherteEinträge.length-1].kilometerstand).toLocaleString()} km`);
	//appendTextToContainer(`<hr>`);

   	if (gespeicherteEinträge) {

   		let preise = 0
   		let liter_getankt = 0
   		let tankstellen = []
   		let sprit = []
   		let literpreis = 0
   		let verbrauch = 0
   		let kilometer = 0
   		let letzteKilomter = 0

   		gespeicherteEinträge.forEach(eintrag => {

   			if (eintrag.preis) preise = preise + parseFloat(eintrag.preis)
   			if (eintrag.literpreis && !isNaN(eintrag.literpreis)) literpreis = literpreis + parseFloat(eintrag.literpreis)
   			if (eintrag.verbrauch && !isNaN(eintrag.verbrauch)) verbrauch = verbrauch + parseFloat(eintrag.verbrauch)
   			if (eintrag.liter_getankt) liter_getankt = liter_getankt + parseFloat(eintrag.liter_getankt)
   			if (eintrag.tankstelle) {
				eintrag.tankstelle = eintrag.tankstelle.replace("�", "ö");
   				tankstellen.push(eintrag.tankstelle)
   			}
   			if (eintrag.sprit) {
   				sprit.push(eintrag.sprit)
   			}
   			if (eintrag.kilometerstand) { 
   				if (letzteKilomter > 0) {
   					kilometer = kilometer + parseFloat(eintrag.kilometerstand-letzteKilomter)
   				} else {
   					kilometer = kilometer + parseFloat(eintrag.kilometerstand)
   				}
   				letzteKilomter = eintrag.kilometerstand

   			}
   		})

   		appendTextToContainer(`<b>Durchschnittliche Distanz gefahren:</b> ${(kilometer/gespeicherteEinträge.length).toFixed(2)} km`);

   		appendTextToContainer(`<b>Tankkosten:</b> ${preise.toFixed(2)} €`);
   		appendTextToContainer(`<b>Durchschnittlicher Tankpreis:</b> ${(preise/gespeicherteEinträge.length).toFixed(2)} €`);
   		appendTextToContainer(`<b>Durchschnittlicher Literpreis:</b> ${(literpreis/gespeicherteEinträge.length).toFixed(2)} €`);

   		appendTextToContainer(`<b>Insgesamt Getankt:</b> ${liter_getankt.toFixed(2)} l`);
   		appendTextToContainer(`<b>Durchschnittliches Tankvolumen:</b> ${(liter_getankt/gespeicherteEinträge.length).toFixed(2)} l`);
   		appendTextToContainer(`<b>Durchschnittlicher Verbrauch:</b> ${(verbrauch/gespeicherteEinträge.length).toFixed(2)} l/100km`);
   		appendTextToContainer(`<b>Meist besuchte Tankstelle:</b> ${mode(tankstellen)}`);
   		appendTextToContainer(`<b>Meist getankter Sprit:</b> ${mode(sprit)}`);
   	}
   }
}

function toggleBar() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}