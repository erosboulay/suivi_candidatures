console.log("Script.js is linked correctly!");

const boxes = document.querySelectorAll('.item-box');
const right_container = document.querySelector('#right-box');
const tri_boxes = document.querySelectorAll('.tri');
const ordre_boxes = document.querySelectorAll('.ordre');

// Filters
const activeFilters = {
    "Candidature spontanée": false,
    "Statut": null,
    "Date": null,
    "Dernière MàJ": null,
    "Source": null,
    "Ville": null,
    "Entreprise": null
};

document.addEventListener('click', () => {
    console.log(activeFilters);
})

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
            right_container.querySelector('#date-postule-emphasis').textContent = `Postulé le : ${date}`;

            if (reponses.length !== 0 || entretiens.length !== 0) {
                // reponses
                console.log(reponses);
                if (reponses.length != 0) {
                    right_container.querySelector('#reponse-emphasis').textContent = "Réponses de l’entreprise: ";
                    reponses.forEach(resp => {
                        right_container.querySelector('#reponse-emphasis').innerHTML += `<br> &bull;${resp.date}: ${resp.contenu}`;
                    });
                }
                else {
                    right_container.querySelector('#reponse-emphasis').textContent = "";
                }


                //entretiens
                if (entretiens.length !== 0) {
                    console.log(entretiens);
                    right_container.querySelector('#entretien-emphasis').textContent = "Entretiens: ";
                    entretiens.forEach(entretien => {
                        right_container.querySelector('#entretien-emphasis').innerHTML += `<br> &bull;${entretien.date}: ${entretien.type}`;
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
