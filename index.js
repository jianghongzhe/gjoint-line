import {createRectBaseOn, isRect, putLine} from './js/joint-line.js';

const putLines = (to) => {
    const lineType = document.querySelector("#lineType").value;
    const fromPosition = document.querySelector("#fromPoint").value;
    const toPosition = document.querySelector("#toPoint").value;
    const direction = document.querySelector("#lineDirection").value;

    console.log("is rect", isRect(to));

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

    document.querySelector("input").value = event.clientY;

    const targetRect = createRectBaseOn(ele.getBoundingClientRect(), event.clientX, event.clientY);
    console.log("click rect", JSON.stringify(targetRect));
    putLines(targetRect);
});

document.querySelector("input").addEventListener("input", event => {
    if (isNaN(event.target.value)) {
        return;
    }


    const ele = document.querySelector("#to");
    ele.style.top = `${event.target.value}px`;

    const oldRect = ele.getBoundingClientRect();

    const newX = oldRect.left - ele.parentNode.getBoundingClientRect().left;
    const targetRect = createRectBaseOn(oldRect, newX, event.target.value);
    console.log("input rect", JSON.stringify(targetRect));
    putLines(targetRect);
});


const toNodeTop = window.getComputedStyle(document.querySelector("#to")).top;
document.querySelector("input").value = toNodeTop.endsWith("px") ? toNodeTop.substring(0, toNodeTop.length - 2) : toNodeTop;
putLines();