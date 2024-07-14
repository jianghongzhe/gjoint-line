const getElement = (selectorOrEle) => {
    if ('object' === typeof selectorOrEle && selectorOrEle.tagName) {
        return selectorOrEle;
    }
    if ('string' === typeof selectorOrEle) {
        return document.querySelector(selectorOrEle);
    }
    console.error("cannot get element", selectorOrEle);
    throw new Error("cannot get element");
};

const getRelativeRect = (rect, baseRect) => {
    const newRect = JSON.parse(JSON.stringify(rect));
    newRect.left -= baseRect.left;
    newRect.right -= baseRect.left;
    newRect.x -= baseRect.left;

    newRect.top -= baseRect.top;
    newRect.bottom -= baseRect.top;
    newRect.y -= baseRect.top;
    return newRect;
};

/**
 * orientation: h/v
 * shape: smooth/square
 *
 */
const putLine = (from, to, line, {orientation, strokeWidth, fromNodeLevel, shape}) => {
    orientation = (orientation ?? 'h');
    fromNodeLevel = (fromNodeLevel ?? 2);
    shape = (shape ?? 'smooth');

    const fromEle = getElement(from);
    const toEle = getElement(to);
    const lineEle = getElement(line);
    const linePathEle = lineEle.querySelector("path");

    const relativeRect = fromEle.parentNode.getBoundingClientRect();
    const fromRect = getRelativeRect(getElement(fromEle).getBoundingClientRect(), relativeRect);
    const toRect = getRelativeRect(getElement(toEle).getBoundingClientRect(), relativeRect);

    if ('h' === orientation) {
        if (fromNodeLevel >= 2) {
            if ('smooth' == shape) {
                const leftToRight = (fromRect.left < toRect.left);
                const left = (leftToRight ? fromRect.right : toRect.right)-1;
                const right = (leftToRight ? toRect.left : fromRect.left)+1;
                const fromTop = (2 === fromNodeLevel ? fromRect.top + fromRect.height / 2 - strokeWidth / 2 : fromRect.bottom - strokeWidth);
                const toTop = toRect.bottom - strokeWidth;
                const top = Math.min(fromTop, toTop);
                const bottom = Math.max(fromTop, toTop) + strokeWidth;
                const lineLeftRightTopDown = ((leftToRight && fromTop < toTop) || (!leftToRight && fromTop > toTop));

                lineEle.style.left = `${left}px`;
                lineEle.style.width = `${right - left}px`;
                lineEle.style.top = `${top}px`;
                lineEle.style.height = `${bottom - top}px`;

                let level = 75;
                let x1 = 0;
                let y1 = 0;
                let x2 = (right - left);
                let y2 = 0;
                let c1x = x1 + level;
                let c1y = 0;
                let c2x = x2 - level;
                let c2y = 0;


                if (lineLeftRightTopDown) {
                    y1 = strokeWidth / 2;
                    y2 = (bottom - top - strokeWidth / 2);
                } else {
                    y1 = (bottom - top - strokeWidth / 2);
                    y2 = strokeWidth / 2;
                }

                c1y = y1;
                c2y = y2;

                console.log("linePathEle", linePathEle);
                linePathEle.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`);
                linePathEle.style.strokeWidth=strokeWidth;
                linePathEle.style.stroke='teal';

                // let path = `<path d="M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}" style="stroke-width:${strokeWidth};stroke: teal;fill:none"></path>`;
                // lineEle.innerHTML = path;
            }
        }
    }


};

export {
    putLine
};