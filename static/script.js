console.log("Script.js is linked correctly!");

const boxes = document.querySelectorAll('.item-box');
const right_container = document.querySelector('#right-box');
const tri_boxes = document.querySelectorAll('.tri');
const ordre_boxes = document.querySelectorAll('.ordre');

// Filters
let inputText = null;
const activeFilters = {
    "Candidature spontanée": false,
    "Statut": null,
    "Date": null,
    "Dernière MàJ": null,
    "Source": null,
    "Ville": null,
    "Entreprise": null
};

// when document is loaded, make the first candidature pressed and show it in right container
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    const box = document.querySelector('.item-box');
    updateBox(box);
});

// updates the right container when the selected candidature has changed
function updateRightContainer(id_candidature) {

    Promise.all([fetch(`/reponses/${id_candidature}`), fetch(`/entretiens/${id_candidature}`)])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(resp => {
            const date = document.querySelector(`[data-candi-id="${id_candidature}"]`).getAttribute('data-date-demande');
            const reponses = resp[0];
            const entretiens = resp[1];

            // date
            console.log(date);
            right_container.querySelector('#date-postule-emphasis').innerHTML = `Postulé le : ${date} <br>`;

            if (reponses.length !== 0 || entretiens.length !== 0) {
                // reponses
                console.log(reponses);
                if (reponses.length != 0) {
                    right_container.querySelector('#reponse-emphasis').textContent = "Réponses de l’entreprise";
                    reponses.forEach(resp => {
                        right_container.querySelector('#reponse-emphasis').innerHTML += 
                        `<div>
                            &bull;${resp.date}: ${resp.contenu}
                        </div>`;
                    });
                }
                else {
                    right_container.querySelector('#reponse-emphasis').textContent = "";
                }


                //entretiens
                if (entretiens.length !== 0) {
                    console.log(entretiens);
                    right_container.querySelector('#entretien-emphasis').innerHTML = "Entretiens <br>";   
                    entretiens.forEach(entretien => {
                        right_container.querySelector('#entretien-emphasis').innerHTML += 
                        `<div>
                            &bull; <span>${entretien.date}</span>: <span>${entretien.type}</span>
                        </div>`;
                    }
                    );
                }
                else {
                    right_container.querySelector('#entretien-emphasis').textContent = "";
                }

            }
            else {
                right_container.querySelector('#reponse-emphasis').textContent = "y a quelqu'un? non? just moi... ok"; // TODO: make random fun text
                right_container.querySelector('#entretien-emphasis').textContent = "";

            }

        });

}

// Function that makes a candidature (box) pressed and shown in right container
function updateBox(box) {

    if (box === null){
        console.log("No shown elements so no need to update box");
        return;
    }

    boxes.forEach(b => b.classList.remove('pressed'));
    box.classList.add('pressed');

    const new_title = box.querySelector('.nom-poste').textContent;
    right_container.querySelector('#nom-poste-emphasis').textContent = new_title;
    const url = box.getAttribute('data-poste-url');
    right_container.querySelector('#nom-poste-emphasis').href = url;

    const new_details = box.querySelector('.details').textContent;
    right_container.querySelector('#details-emphasis').textContent = new_details;

    const new_text = box.querySelector('.status-icon').textContent;
    right_container.querySelector('.status-icon').textContent = new_text;

    const new_class = box.querySelector('.status-icon').classList.item(1);
    const old_class = right_container.querySelector('.status-icon').classList.item(1);
    right_container.querySelector('.status-icon').classList.remove(old_class);
    right_container.querySelector('.status-icon').classList.add(new_class);

    const id_candidature = parseInt(box.getAttribute('data-candi-id'));

    updateRightContainer(id_candidature);
}

// May return null if everything is hidden or no div exists
function selectFirstBox() {
    const queryShower = document.querySelector('#query-shower');
    if (queryShower.classList.contains("croissant")) {
        const boxes = document.querySelectorAll('.item-box:not(.hidden)');
        const box = boxes.item(boxes.length - 1);
        return box;

    } else {
        const box = document.querySelector('.item-box:not(.hidden)');
        return box;
    }
}

// when a candidature is clicked, make it pressed and show it in right container
boxes.forEach(box => {
    box.addEventListener('click', () => {
        updateBox(box);
    });
});

// Sorting 
tri_boxes.forEach(tri_box => {
    tri_box.addEventListener('click', () => {

        document.querySelector('.tri-actif').classList.toggle("tri-actif");
        tri_box.classList.toggle("tri-actif");

        if (document.querySelector('.tri-actif').textContent === "date de création") {
            sortByDateDemande();
        }
        else {
            sortByUpdateDate();
        }
        
        const box = selectFirstBox();        
        updateBox(box);
    })
})

function sortByUpdateDate() {
    var boxes = Array.from(document.querySelectorAll(".item-box"));
    boxes.sort((a, b) => {
        const dateA = a.getAttribute('data-dernier-maj').split('/');
        const dateB = b.getAttribute('data-dernier-maj').split('/');

        const dateAFormatted = new Date(`${dateA[2]}-${dateA[1]}-${dateA[0]}`);
        const dateBFormatted = new Date(`${dateB[2]}-${dateB[1]}-${dateB[0]}`);

        return dateBFormatted - dateAFormatted;
    })

    const container = document.querySelector('#query-shower');
    container.innerHTML = '';
    boxes.forEach(box => container.appendChild(box)); // Re-ordering boxes
}

function sortByDateDemande() {
    var boxes = Array.from(document.querySelectorAll(".item-box"));
    boxes.sort((a, b) => {
        const dateA = a.getAttribute('data-date-demande').split('/');
        const dateB = b.getAttribute('data-date-demande').split('/');

        const dateAFormatted = new Date(`${dateA[2]}-${dateA[1]}-${dateA[0]}`);
        const dateBFormatted = new Date(`${dateB[2]}-${dateB[1]}-${dateB[0]}`);

        return dateBFormatted - dateAFormatted;
    })

    const container = document.querySelector('#query-shower');
    container.innerHTML = '';
    boxes.forEach(box => container.appendChild(box)); // Re-ordering boxes
}

// when the order is changed, update the css and change the pressed candidature to the first one and show it in container
ordre_boxes.forEach(ordre_box => {
    ordre_box.addEventListener('click', () => {
        if (!ordre_box.classList.contains("ordre-actif")) {
            document.querySelector('.ordre-actif').classList.remove("ordre-actif");
            ordre_box.classList.add("ordre-actif");

            document.querySelector("#query-shower").classList.toggle("decroissant");
            document.querySelector("#query-shower").classList.toggle("croissant");

            const box = selectFirstBox();        
            updateBox(box);

        }
    })
})

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Filtering UI
const dropdown_filters = document.querySelectorAll(".has-dropdown")
console.log(dropdown_filters);
dropdown_filters.forEach(filter => {
    filter.addEventListener('click', () => {
        console.log(filter.querySelector(".filter-dropdown"));
        const close_current_filter = !filter.querySelector(".filter-dropdown").classList.contains('hidden');

        dropdown_filters.forEach(filter => {
            filter.querySelector(".filter-dropdown").classList.add('hidden');
        })
        
        if (!close_current_filter && !filter.querySelector(".filter").classList.contains("filter-applied")){
            filter.querySelector(".filter-dropdown").classList.remove('hidden');
        }
    })

});

document.addEventListener('click', (event) => {
    dropdown_filters.forEach(filter => {
        if (!filter.contains(event.target)) {
            filter.querySelector(".filter-dropdown").classList.add('hidden');
        }
    });
})

// Click filter
document.querySelector(".filter-click").addEventListener('click', () => {
    dropdown_filters.forEach(filter => {
        filter.querySelector(".filter-dropdown").classList.add('hidden');
    })
    document.querySelector(".filter-click").classList.toggle('filter-applied');
    if (document.querySelector(".filter-click").classList.contains('filter-applied')) {
        filterCandidatureSpontanee();
    }
    else {
        removeFilterCandidatureSpontanee();
    }

    const box = selectFirstBox();        
    updateBox(box);
})

// Drop down filter
// Apply filter
document.querySelectorAll(".has-dropdown").forEach( has_dropdown => {
    Array.from(has_dropdown.lastElementChild.children).forEach(child => {
        child.addEventListener('click', () => {
            const texte = child.textContent;
            const texte_box = has_dropdown.querySelector(".filter-text");
            const texte_icon = has_dropdown.querySelector(".material-symbols-outlined");
            has_dropdown.querySelector(".filter").classList.add("filter-applied");
            texte_box.textContent = texte;
            texte_icon.textContent = "close_small";
            has_dropdown.querySelector(".filter-dropdown").classList.add('hidden');
            const filter = has_dropdown.querySelector(".filter-text").getAttribute("data-filter-name");

            activeFilters[filter] = child.textContent.trim();    
            applyFilter(filter);

        })
    })
})

// Disable filter
document.querySelectorAll(".has-dropdown").forEach( dropdown => {
    const icon = dropdown.querySelector(".material-symbols-outlined");
    console.log(icon);
    dropdown.querySelector(".filter").addEventListener('click', (event) => {
        console.log("in disable filter")
        if (icon.textContent == "close_small"){
            event.stopPropagation();
            console.log("icon is close_small")
            const text_node = dropdown.querySelector(".filter-text");
            const text = text_node.getAttribute("data-filter-name");
            text_node.textContent = text;
            dropdown.querySelector(".material-symbols-outlined").textContent = "arrow_drop_down";   
            dropdown.querySelector(".filter").classList.remove("filter-applied")

            dropdown_filters.forEach(filter => {
                filter.querySelector(".filter-dropdown").classList.add('hidden');
            })

            activeFilters[text] = null;
            removeFilter();
        }
       }
    )
});

// dropdown filter functions
// Pour quand on enlève une filtre (mettre à jour si implémenter + de filtres)
function showBox(box){
    if (inputText !== null){
        const title = normalizeText(box.querySelector('.nom-poste').textContent);
        if (!title.includes(inputText)){
            return false;
        }
    }
    if (activeFilters["Candidature spontanée"]) {
        if (box.querySelector(".nom-poste").textContent.trim() !== "Candidature spontanée") {
            return false;
        }
    }
    if (activeFilters["Statut"] !== null) {
        if (box.querySelector(".status-icon").textContent.trim() !== activeFilters["Statut"]) {
            return false;
        }
    }
    if (activeFilters["Date"] !== null) {
        const date_demande = parseDate(box.getAttribute("data-date-demande"));
        if (!isDateWithinPeriod(date_demande, "Date")){
            return false;
        }
    }
    if (activeFilters["Dernière MàJ"] !== null) {
        const date_demande = parseDate(box.getAttribute("data-dernier-maj"));
        if (!isDateWithinPeriod(date_demande, "Dernière MàJ")){
            return false;
        }
    }
    if (activeFilters["Source"] !== null){
        if (box.getAttribute("data-source") !== activeFilters["Source"]){
            return false;
        }
    }
    if (activeFilters["Ville"] !== null){
        if (box.getAttribute("data-ville") !== activeFilters["Ville"]){
            return false;
        }
    }
    if (activeFilters["Entreprise"] !== null){
        if (box.getAttribute("data-entreprise") !== activeFilters["Entreprise"]){
            return false;
        }
    }
    return true;
}

function hideBox(box, filter){
    if (filter == "Statut"){
        return box.querySelector(".status-icon").textContent.trim() !== activeFilters.Statut;
    }
    else if (filter == "Date"){
        const date_demande = parseDate(box.getAttribute("data-date-demande"));
        return !isDateWithinPeriod(date_demande, filter);
    }
    else if (filter == "Dernière MàJ"){
        const date_maj = parseDate(box.getAttribute("data-dernier-maj"));
        return !isDateWithinPeriod(date_maj, filter);
    }
    else if (filter == "Source"){
        return box.getAttribute("data-source") !== activeFilters.Source;
    }
    else if (filter == "Ville"){
        return box.getAttribute("data-ville") !==  activeFilters.Ville;
    }
    else if (filter == "Entreprise"){
        return box.getAttribute("data-entreprise") !== activeFilters.Entreprise;
    }
}

// convenience functions
function isDateWithinPeriod(date_start, filter){
        const date_today = Date.now();
        const diffTime = Math.abs(date_today - date_start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        console.log(`diffDays: ${diffDays}`)

        if (activeFilters[filter] === "7 derniers jours"){
            return diffDays < 7;
        }
        else if (activeFilters[filter] === "Plus de 14 jours"){
            return diffDays > 14;
        }
        else if (activeFilters[filter] === "Plus de 30 jours"){
            return diffDays > 30;
        }
        console.log("ERROR: There is no filter match, wth is going on!!!");
        return null;
}

// onclick filter functions (Candidature Spontanée)
function filterCandidatureSpontanee() {
    var boxes = document.querySelectorAll(".item-box");
    let nb_boxes = 0;
    activeFilters["Candidature spontanée"] = true;

    boxes.forEach(box => {
        if (box.querySelector(".nom-poste").textContent.trim() !== "Candidature spontanée") {
            box.classList.add('hidden');
        }
        if (!box.classList.contains('hidden')){
            nb_boxes ++;
        }
    });

    document.querySelector("#nb-res").textContent = `${nb_boxes} résultats`
    const box = selectFirstBox();        
    updateBox(box);
}

function removeFilterCandidatureSpontanee() {
    var boxes = document.querySelectorAll(".item-box");
    let nb_boxes = 0;
    activeFilters["Candidature spontanée"] = false;

    boxes.forEach(box => {
        if (showBox(box)) {
            box.classList.remove('hidden');
        }
        if (!box.classList.contains('hidden')){
            nb_boxes ++;
        }
    });

    document.querySelector("#nb-res").textContent = `${nb_boxes} résultats`;
    const box = selectFirstBox();        
    updateBox(box);

}

// drop down filter functions (Statut)
function applyFilter(filter){
    let boxes = document.querySelectorAll(".item-box");
    let nb_boxes = 0;

    boxes.forEach(box => {
        if (hideBox(box, filter)){
            box.classList.add('hidden');
        }
        if (!box.classList.contains('hidden')){
            nb_boxes ++;
        }
    });

    console.log(`Applied ${filter} Filter`)
    const box = selectFirstBox();     
    document.querySelector("#nb-res").textContent = `${nb_boxes} résultats`
    updateBox(box);
}

function removeFilter(){
    var boxes = document.querySelectorAll(".item-box");
    let nb_boxes = 0;

    boxes.forEach(box => {
        if (showBox(box)) {
            box.classList.remove('hidden');
        }
        if (!box.classList.contains('hidden')){
            nb_boxes ++;
        }
    });

    const box = selectFirstBox();
    document.querySelector("#nb-res").textContent = `${nb_boxes} résultats`        
    updateBox(box);
}

// Search input
//filter
const search_bar = document.querySelector("input[type='search']")
search_bar.addEventListener('input', () => {
    const searchTerm = normalizeText(search_bar.value);
    console.log(`search term is :${searchTerm}`)
    const boxes = document.querySelectorAll(".item-box");
    let nb_boxes = 0;

    inputText = null;
    boxes.forEach(box => {
        if (showBox(box)) {
            box.classList.remove('hidden');
        }
        if (!box.classList.contains('hidden')){
            nb_boxes ++;
        }
    });

    if (searchTerm != ""){
        nb_boxes = 0;

        boxes.forEach(box => {
            const title = normalizeText(box.querySelector('.nom-poste').textContent);
            if (!title.includes(searchTerm)) {
                box.classList.add('hidden');
            }
            if (!box.classList.contains('hidden')){
                nb_boxes ++;
            }
        });
        inputText = searchTerm;
    }

    document.querySelector("#nb-res").textContent = `${nb_boxes} résultats`;
    const box = selectFirstBox();        
    updateBox(box);
})

//undo filter
function normalizeText(text){
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Add candidature

const add_ui = document.querySelector(".add-ui")
const inputs = document.querySelector("#add-main-block").querySelectorAll(".add-input");


document.querySelector("#add-icon").addEventListener('click', () => {


    const day = new Date();
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0'); // month 0-11 ➜ 1-12
    const date = String(day.getDate()).padStart(2, '0');       // day of month 1-31

    const today = `${year}-${month}-${date}`;

    console.log(`today: ${today}`);
    const dateInput = document.querySelector("input[type='date']");
    dateInput.value = today; // Set the default value to today's date

    add_ui.classList.add("fade-in");
    document.querySelector("body").classList.add("no-scroll");
})

document.querySelector(".cancel-button").addEventListener('click', () => {
    add_ui.classList.remove("fade-in");
    document.querySelector("body").classList.remove("no-scroll");
    add_ui.querySelector("#add-main-block").scrollTop = 0;
    inputs.forEach( input => {
        input.value = null;
    })

    document.querySelector(".add-button").classList.remove("hidden");
    document.querySelector(".edit-button").classList.add("hidden");

    const error_div = document.querySelector("#add-error")
    error_div.classList.add("hidden")
})

document.querySelector(".add-button").addEventListener('click', () => {
    let erreur = false;
    const erreurs_array = [];

    inputs.forEach( input => {
        let text = input.parentElement.firstElementChild.textContent
        if (text.includes("*")){
            if (!input.value){
                console.log("Problème input")
                erreurs_array.push(text.slice(0, -1));
                erreur = true;
            }
        }
        if (!input.value || input.value.trim() === "") {
            input.value = null;
        }
        console.log(`input value ${input.value}`);
    })


    console.log(erreurs_array);

    if (erreurs_array.length == 0){
        const data = new FormData();
        data.append("Entreprise", inputs[0].value);
        data.append("Lien candidature", inputs[1].value);
        data.append("Source", inputs[2].value);
        data.append("Date de demande", inputs[3].value);
        data.append("Poste", inputs[4].value);
        data.append("Pays", inputs[5].value);
        data.append("Ville", inputs[6].value);
        data.append("Statut", inputs[7].value);

        fetch("add_candidature", {
            "method": "POST",
            "body": data,
        }).then(() => {
            window.location.reload(); 
        })
    }
    else{
        const error_div = document.querySelector("#add-error")
        let nouv_text = `Il faut remplir: `
        erreurs_array.forEach(erreur => {
            nouv_text += ` ${erreur},`
        })
        error_div.textContent = nouv_text.slice(0, -1);
        error_div.classList.remove("hidden");
    }

    
})

document.querySelector("#crud-delete").addEventListener('click', () => {
    const data = new FormData();
    const id = document.querySelector(".pressed").getAttribute("data-candi-id");
    data.append("ID", id);

    fetch("delete_candidature", {
        "method": "POST",
        "body": data,
    }).then(() => {
        window.location.reload(); 
    })
})

document.querySelector("#crud-edit").addEventListener('click', () => {
    const box = document.querySelector(".pressed")

    inputs[0].value = box.getAttribute("data-entreprise");
    inputs[1].value = box.getAttribute("data-poste-url");
    inputs[2].value = box.getAttribute("data-source");

    const dateStr = box.getAttribute("data-date-demande");
    let [day, month, year] = dateStr.split('/').map(Number);
    year =String(year).padStart(3, '0');
    month = String(month).padStart(2, '0'); 
    day = String(day).padStart(2, '0');    
    const date = `${year}-${month}-${day}`;
    console.log(`date : ${date}`)

    inputs[3].value = date;

    const poste = box.querySelector(".nom-poste").textContent;
    if (poste == "Candidature Spontanée"){
        inputs[4].value = "";
    }
    else{
        inputs[4].value = poste.trim();
    }
    inputs[5].value = box.getAttribute("data-pays");
    inputs[6].value = box.getAttribute("data-ville");
    inputs[7].value = box.querySelector(".status-icon").textContent;

    document.querySelector(".add-button").classList.add("hidden");
    document.querySelector(".edit-button").classList.remove("hidden");
    
    add_ui.classList.add("fade-in");
    document.querySelector("body").classList.add("no-scroll");

})

document.querySelector(".edit-button").addEventListener('click', (event) => {
    event.preventDefault() 
    let erreur = false;
    const erreurs_array = [];

    inputs.forEach( input => {
        let text = input.parentElement.firstElementChild.textContent
        if (text.includes("*")){
            if (!input.value){
                console.log("Problème input")
                erreurs_array.push(text.slice(0, -1));
                erreur = true;
            }
        }
        if (!input.value || input.value.trim() === "") {
            input.value = null;
        }
        console.log(`input value ${input.value}`);
    })

    console.log(erreurs_array);

    if (erreurs_array.length == 0){
        const data = new FormData();
        data.append("Entreprise", inputs[0].value);
        data.append("Lien candidature", inputs[1].value);
        data.append("Source", inputs[2].value);
        data.append("Date de demande", inputs[3].value);
        data.append("Poste", inputs[4].value);
        data.append("Pays", inputs[5].value);
        data.append("Ville", inputs[6].value);
        data.append("Statut", inputs[7].value);

        const box = document.querySelector(".pressed")
        const id = box.getAttribute("data-candi-id");
        console.log(`id = ${id}`)
        data.append("ID", id);

        fetch("edit_candidature", {
            "method": "POST",
            "body": data,
        }).then(() => {
            window.location.reload(); 
        })
    }
    else{
        const error_div = document.querySelector("#add-error")
        let nouv_text = `Il faut remplir: `
        erreurs_array.forEach(erreur => {
            nouv_text += ` ${erreur},`
        })
        error_div.textContent = nouv_text.slice(0, -1);
        error_div.classList.remove("hidden");
    }

    
})

// For editing and updating updates
const edit_update_container = document.querySelector("#edit-update-container");
edit_update_container.querySelector("#edit-update-button").addEventListener('click', () => {
    edit_update_container.querySelectorAll(".edit-update-subbutton").forEach( button => {
        button.classList.toggle("shown")
    }

    )
})

document.querySelector(".edit-update-form-cancel-button").addEventListener('click', () => {
    close_edit_update_ui();
})

function close_edit_update_ui(){
    document.querySelector(".edit-update-form-ui").classList.remove("fade-in")
    document.querySelector("body").classList.remove("no-scroll");
}


// get entretien info from frontend to edit
document.querySelector(".edit-update-subbutton.entretien").addEventListener('click', () => {
    const inputs_entretien = document.querySelector("#entretien-emphasis").querySelectorAll("div");
    const to_fill = document.querySelector(".edit-reponses-container");
    const select_status = document.querySelector(".edit-update-form-main-statut select");
    console.log(inputs_entretien);

    // add statut
    console.log(select_status)
    const current_status = right_container.querySelector(".status-icon").textContent;
    select_status.value = current_status;

    // add entretien
    to_fill.innerHTML = "";
    inputs_entretien.forEach(entretien => {
        const dateStr = entretien.firstElementChild.textContent;
        const type = entretien.lastElementChild.textContent;

        // format date
        let [day, month, year] = dateStr.split('/').map(Number);
        year =String(year).padStart(4, '0');
        month = String(month).padStart(2, '0'); 
        day = String(day).padStart(2, '0');    
        const date = `${year}-${month}-${day}`;

        to_fill.innerHTML += 
            `<div class = "edit-reponses-item">
                <input type="date" value=${date}>
                <input type="text" value=${type}>
                <span class="material-symbols-outlined">close</span>     
            </div>`;
    })

    to_fill.innerHTML +=
        `<div class = "edit-reponses-item">
            <input type="date">
            <input type="text">
            <span class="material-symbols-outlined">close</span>     
        </div>`;
    
    // show the edit ui

    edit_update_container.querySelectorAll(".edit-update-subbutton").forEach( button => {
        button.classList.toggle("shown")
    })

    document.querySelector(".edit-update-form-ui").classList.add("fade-in")
    document.querySelector("body").classList.add("no-scroll");

})

// toggle whether to add, delete an entretien or not

document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.edit-reponses-item > span');
    
    if (deleteButton) {
        console.log('click!!!');
        deleteButton.classList.toggle("todelete");
    }
});

document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.edit-reponses-item > span');
    
    if (deleteButton) {
        console.log('click!!!');
        deleteButton.classList.toggle("todelete");
    }
});

// edit and updating updates (backend)
const confirm_edit_entretien_button = document.querySelector(".edit-update-form-add-button.entretien");
confirm_edit_entretien_button.addEventListener('click', () => {
    // récupérer tous les entretiens dans le form
    let data = new Array();
    const ls_entretiens = document.querySelectorAll(".edit-reponses-item");

    ls_entretiens.forEach(entretien => {
        const date = entretien.querySelector("input[type='date']").value;
        const type = entretien.querySelector("input[type='text']").value;

        const couple = new Array(date, type);
        data.push(couple);
    })

    data = JSON.stringify(data);
    //console.log(data)

    // obtenir id
    const box = document.querySelector(".pressed")
    const id = box.getAttribute("data-candi-id");

    //envoyer l'info dans le backend pour traiter et rafraichir la page
    fetch(`edit_entretiens/${id}`, {
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" }
    })

    // .then((() => {
    //    window.location.reload(); 
    //}))
})