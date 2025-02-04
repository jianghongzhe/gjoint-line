import {createRectBaseOn, isRect, putLine} from './js/joint-line.js';

const putLines = (to) => {
    const lineType = document.querySelector("#lineType").value;
    const fromPosition = document.querySelector("#fromPoint").value;
    const toPosition = document.querySelector("#toPoint").value;
    const direction = document.querySelector("#lineDirection").value;



    putLine("#from", isRect(to) ? to : "#to", "#svg", {
        orientation: direction,
        strokeWidth: 1,
        color: 'teal',
        shape: lineType, // bezier/arc
        fromPosition, //:'edge',
        toPosition //:'edge',
    });
};

document.querySelector("#lineType").addEventListener("change", putLines);
document.querySelector("#fromPoint").addEventListener("change", putLines);
document.querySelector("#toPoint").addEventListener("change", putLines);
document.querySelector("#lineDirection").addEventListener("change", putLines);


document.querySelector("#container").addEventListener("click", event => {
    const ele = document.querySelector("#to");
    ele.style.left = `${event.clientX}px`;
    ele.style.top = `${event.clientY}px`;

    // force to use assigned left or top when transition not finished
    // if no transition exists, then no need to use like this
    // ele.dataset.jointLineForceX=event.clientX;
    // ele.dataset.jointLineForceY=event.clientY;

    // console.log(`style ${ele.style.left} ${ele.style.top}`);
    // console.log(`bounding ${JSON.stringify(ele.getBoundingClientRect())}`);


    document.querySelector("input").value = event.clientY;

    const targetRect = createRectBaseOn(ele.getBoundingClientRect(), event.clientX, event.clientY);
    putLines(targetRect);
    // setTimeout(()=>putLines(), 4);
});

document.querySelector("input").addEventListener("input", event => {
    if (isNaN(event.target.value)) {
        return;
    }
    document.querySelector("#to").style.top = `${event.target.value}px`;
    putLines();
});


putLines();

