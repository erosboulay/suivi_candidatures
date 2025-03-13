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

        fetch(`/date/${id_candidature}`)
            .then(reponse => reponse.json())
            .then(resp => {
                console.log(resp);
                right_container.querySelector('#date-postule-emphasis').textContent = `Postulé le ${resp}`;
            
            });

        fetch(`/reponses/${id_candidature}`)
            .then(reponse => reponse.json())
            .then(reponses => {
                console.log(reponses);
                right_container.querySelector('#reponse-emphasis').innerHTML = '';
                reponses.forEach(resp => {
                        right_container.querySelector('#reponse-emphasis').innerHTML += resp.contenu + '<br>';
                    }
                );
            });

        fetch(`/entretiens/${id_candidature}`)
            .then(reponse => reponse.json())
            .then(entretiens => {
                console.log(entretiens);
                right_container.querySelector('#entretien-emphasis').innerHTML = '';
                entretiens.forEach(entretien => {
                        right_container.querySelector('#entretien-emphasis').innerHTML += entretien.type + '<br>';
                    }
                );
            });

    })
});