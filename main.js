import {putLine} from './js/joint-line.js';

const putLines = () => {
    putLine("#from", "#to", "svg", { orientation: 'h', strokeWidth: 1, fromNodeLevel: 2, color:'teal', });
};

document.querySelector("#container").addEventListener("click", event => {
    const ele = document.querySelector("#to");
    ele.style.left = `${event.clientX}px`;
    ele.style.top = `${event.clientY}px`;
    document.querySelector("input").value=event.clientY;
    putLines();
});

document.querySelector("input").addEventListener("input", event=>{
    if (isNaN(event.target.value)) {
        return;
    }
    document.querySelector("#to").style.top=`${event.target.value}px`;
    putLines();
});



putLines();

