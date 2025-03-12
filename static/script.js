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


    })
});