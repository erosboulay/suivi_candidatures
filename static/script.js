console.log("Script.js is linked correctly!");

const boxes = document.querySelectorAll('.item-box');
const right_container = document.querySelector('#right-box')

boxes.forEach( box => {
    
    box.addEventListener('click', () =>{

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

        Promise.all([fetch(`/date/${id_candidature}`),fetch(`/reponses/${id_candidature}`), fetch(`/entretiens/${id_candidature}`)])
            .then(responses => Promise.all(responses.map(response => response.json())))
            .then (resp => {
                date = resp[0];
                reponses = resp[1];
                entretiens = resp[2];

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

    })
});