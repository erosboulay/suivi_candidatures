console.log("Script.js is linked correctly!");

const boxes = document.querySelectorAll('.item-box');
const right_container = document.querySelector('#right-box');
const tri_boxes = document.querySelectorAll('.tri');
const ordre_boxes = document.querySelectorAll('.ordre');


// when document is loaded, make the first candidature pressed and show it in right container
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    box = document.querySelector('.item-box');
    updateBox(box);
});

// updates the right container when the selected candidature has changed
function updateRightContainer(id_candidature) {

    Promise.all([fetch(`/reponses/${id_candidature}`), fetch(`/entretiens/${id_candidature}`)])
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then (resp => {
                date = document.querySelector(`[data-candi-id="${id_candidature}"]`).getAttribute('data-date-demande');
                reponses = resp[0];
                entretiens = resp[1];

                // date
                console.log(date);
                right_container.querySelector('#date-postule-emphasis').textContent = `Postulé le : ${date}`;

                if (reponses.length !== 0 || entretiens.length !== 0){
                    // reponses
                    console.log(reponses);
                    if (reponses.length != 0){
                        right_container.querySelector('#reponse-emphasis').textContent = "Réponses de l’entreprise: ";
                        reponses.forEach(resp => {
                                right_container.querySelector('#reponse-emphasis').innerHTML += `<br> &bull;${resp.date}: ${resp.contenu}`;
                        });
                    }
                    else{
                        right_container.querySelector('#reponse-emphasis').textContent = "";
                    }


                    //entretiens
                    if (entretiens.length !== 0){
                        console.log(entretiens);
                        right_container.querySelector('#entretien-emphasis').textContent = "Entretiens: ";
                        entretiens.forEach(entretien => {
                                right_container.querySelector('#entretien-emphasis').innerHTML += `<br> &bull;${entretien.date}: ${entretien.type}`;
                            }
                        );
                    }
                    else{
                        right_container.querySelector('#entretien-emphasis').textContent = "";
                    }

                }
                else{
                    right_container.querySelector('#reponse-emphasis').textContent = "y a quelqu'un? non? just moi... ok"; // TODO: make random fun text
                    right_container.querySelector('#entretien-emphasis').textContent = "";

                }

            });

}

// Function that makes a candidature (box) pressed and shown in right container
function updateBox(box){
    boxes.forEach(b => b.classList.remove('pressed'));
    box.classList.add('pressed');

    const new_title = box.querySelector('.nom-poste').textContent;
    right_container.querySelector('#nom-poste-emphasis').textContent= new_title;

    const new_details = box.querySelector('.details').textContent;
    right_container.querySelector('#details-emphasis').textContent= new_details;

    const new_text = box.querySelector('.status-icon').textContent;
    right_container.querySelector('.status-icon').textContent=new_text;

    const new_class = box.querySelector('.status-icon').classList.item(1);
    const old_class = right_container.querySelector('.status-icon').classList.item(1);
    right_container.querySelector('.status-icon').classList.remove(old_class);
    right_container.querySelector('.status-icon').classList.add(new_class);

    const id_candidature = parseInt(box.getAttribute('data-candi-id'));

    updateRightContainer(id_candidature);
}

// when a candidature is clicked, make it pressed and show it in right container
boxes.forEach( box => {
    box.addEventListener('click', () =>{
            updateBox(box);
        });
});

// TODO: Fully implement sorting 
tri_boxes.forEach( tri_box => {
    tri_box.addEventListener('click', () => {

        document.querySelector('.tri-actif').classList.toggle("tri-actif");
        tri_box.classList.toggle("tri-actif");

        if (document.querySelector('.tri-actif').textContent === "date de création"){
            sortByDateDemande();
        }
        else{
            sortByUpdateDate();
        }

        queryShower = document.querySelector('#query-shower');
        if (queryShower.classList.contains("croissant")) {
            updateBox(boxes.item(boxes.length-1));
        } else {
            box = document.querySelector('.item-box');
            updateBox(box);
        }
    })
})

function sortByUpdateDate(){
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

function sortByDateDemande(){
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
ordre_boxes.forEach( ordre_box => {
    ordre_box.addEventListener('click', () => {
        if (!ordre_box.classList.contains("ordre-actif")){
            document.querySelector('.ordre-actif').classList.remove("ordre-actif");
            ordre_box.classList.add("ordre-actif");

            document.querySelector("#query-shower").classList.toggle("decroissant");
            document.querySelector("#query-shower").classList.toggle("croissant");

            queryShower = document.querySelector('#query-shower');
            if (queryShower.classList.contains("croissant")) {
                updateBox(boxes.item(boxes.length-1));
            } else {
                box = document.querySelector('.item-box');
                updateBox(box);
            }
            
        }
    })
})

function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}
