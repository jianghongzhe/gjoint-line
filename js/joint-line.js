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

const round = (num) => parseInt(Math.round(num));

/**
 * get the relative rect with its fields rounded to integer
 * @param rect
 * @param baseRect
 * @returns {any}
 */
const getRelativeRect = (rect, baseRect) => {
    const newRect = JSON.parse(JSON.stringify(rect));
    newRect.left = round(newRect.left) - round(baseRect.left);
    newRect.right = round(newRect.right) - round(baseRect.left);
    newRect.x = round(newRect.x) - round(baseRect.left);

    newRect.top = round(newRect.top) - round(baseRect.top);
    newRect.bottom = round(newRect.bottom) - round(baseRect.top);
    newRect.y = round(newRect.y) - round(baseRect.top);
    return newRect;
};

const setProperties = (ele, props) => {
    Object.keys(props).forEach(k => ele.style.setProperty(k, props[k]));
}

/**
 *
 * @param from
 * @param to
 * @param line
 * @param orientation h/v
 * @param strokeWidth
 * @param fromNodeLevel
 * @param shape smooth/square
 * @param color
 */
const putLine = (from, to, line, {orientation, strokeWidth, fromNodeLevel, shape, color} = {}) => {
    orientation = (orientation ?? 'h');
    strokeWidth = (strokeWidth ?? 1);
    fromNodeLevel = (fromNodeLevel ?? 2);
    shape = (shape ?? 'smooth');
    color = (color ?? 'lightgrey');

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
                const padding = 10;
                const controlLevel = 75;

                const leftToRight = (fromRect.left < toRect.left);
                let left = (leftToRight ? fromRect.right : toRect.right);
                let right = (leftToRight ? toRect.left : fromRect.left);

                // joint point on from node is in the middle height when the node is second level, and in the bottom when the node level is greater than three
                const fromTop = round(2 === fromNodeLevel ? fromRect.top + fromRect.height / 2 - strokeWidth / 2 : fromRect.bottom - strokeWidth);
                const toTop = round(toRect.bottom - strokeWidth);
                const top = Math.min(fromTop, toTop);
                const bottom = Math.max(fromTop, toTop) + strokeWidth;

                // look from left to right, whether the line is up to down
                const lineLeftRightTopDown = ((leftToRight && fromTop < toTop) || (!leftToRight && fromTop > toTop));

                let x1 = padding;
                let y1 = padding + strokeWidth / 2;
                let x2 = padding + (right - left);
                let y2 = (padding + bottom - top - strokeWidth / 2);
                let c1x = x1 + controlLevel;
                let c1y = 0;
                let c2x = x2 - controlLevel;
                let c2y = 0;

                if (!lineLeftRightTopDown) {
                    [y1, y2] = [y2, y1];
                }

                c1y = y1;
                c2y = y2;

                setProperties(lineEle, {
                    left: `${left - padding}px`,
                    width: `${right - left + 2 * padding}px`,
                    top: `${top - padding}px`,
                    height: `${bottom - top + 2 * padding}px`,
                });

                linePathEle.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`);
                setProperties(linePathEle, {
                    stroke: color,
                    "stroke-width": strokeWidth,
                    fill: "none",
                })
            }
        }
    }


};

export {
    putLine
};