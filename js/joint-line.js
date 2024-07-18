/**
 * get element
 * @param selectorOrEle
 * @returns {{tagName}|*|Element}
 */
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

const setStyleProperties = (ele, props) => {
    Object.keys(props).forEach(k => ele.style.setProperty(k, props[k]));
}

const ShapeEnum = {
    bezier: "bezier",
    arc: "arc",
    square: "square",
};

const PositionEnum = {
    center: "center",
    edge: "edge",
};

/**
 *
 * @param from
 * @param to
 * @param line
 * @param orientation h/v
 * @param strokeWidth
 * @param shape bezier/arc/square
 * @param fromPosition center/edge, invalid when shape=arc, always use center
 * @param toPosition center/edge, invalid when shape=arc, always use center
 * @param color
 */
const putLine = (from, to, line, {
    orientation,
    strokeWidth,
    shape,
    fromPosition,
    toPosition,
    color
} = {}) => {
    orientation = (orientation ?? 'h');
    strokeWidth = (strokeWidth ?? 1);
    fromPosition = (fromPosition ?? PositionEnum.edge);
    toPosition = (toPosition ?? PositionEnum.edge);
    shape = (shape ?? ShapeEnum.bezier);
    color = (color ?? 'lightgrey');

    const fromEle = getElement(from);
    const toEle = getElement(to);
    const lineEle = getElement(line);
    const linePathEle = lineEle.querySelector(ShapeEnum.bezier === shape ? "path" : "ellipse");

    const relativeRect = fromEle.parentNode.getBoundingClientRect();
    const fromRect = getRelativeRect(getElement(fromEle).getBoundingClientRect(), relativeRect);
    const toRect = getRelativeRect(getElement(toEle).getBoundingClientRect(), relativeRect);

    if ('h' === orientation) {

        const getJointPointTop = (rect, position) => {
            if (PositionEnum.center === position) {
                return round(rect.top + rect.height / 2 - strokeWidth / 2);
            }
            if (PositionEnum.edge === position) {
                return round(rect.bottom - strokeWidth);
            }
            console.error(`unsupported joint point position: ${position}`);
            throw new Error("unsupported joint point position");
        };

        if (ShapeEnum.bezier === shape) {
            const padding = 10;
            const controlLevel = 75;

            const leftToRight = (fromRect.left < toRect.left);
            let left = (leftToRight ? fromRect.right : toRect.right);
            let right = (leftToRight ? toRect.left : fromRect.left);

            const fromTop = getJointPointTop(fromRect, fromPosition);
            const toTop = getJointPointTop(toRect, toPosition);
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

            setStyleProperties(lineEle, {
                left: `${left - padding}px`,
                width: `${right - left + 2 * padding}px`,
                top: `${top - padding}px`,
                height: `${bottom - top + 2 * padding}px`,
            });

            linePathEle.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`);
            setStyleProperties(linePathEle, {
                stroke: color,
                "stroke-width": strokeWidth,
                fill: "none",
            });
            return;
        }

        if (ShapeEnum.arc === shape) {
            const padding = 10;

            const leftToRight = (fromRect.left < toRect.left);
            let left = round(leftToRight ? fromRect.right-fromRect.width/2 : toRect.right);
            let right = (leftToRight ? toRect.left : fromRect.left);

            const fromTop = getJointPointTop(fromRect, PositionEnum.center);
            const toTop = getJointPointTop(toRect, PositionEnum.center);
            const top = Math.min(fromTop, toTop);
            const bottom = Math.max(fromTop, toTop) + strokeWidth;

            // look from left to right, whether the line is up to down
            const lineLeftRightTopDown = ((leftToRight && fromTop < toTop) || (!leftToRight && fromTop > toTop));

            let cx = padding + (right - left);
            let cy = padding + (bottom - top);
            let rx = (right - left);
            let ry = (bottom - top);

            // if (!lineLeftRightTopDown) {
            //     [y1, y2] = [y2, y1];
            // }


            setStyleProperties(lineEle, {
                left: `${left - padding}px`,
                width: `${right - left + 2 * padding}px`,
                top: `${top - padding}px`,
                height: `${bottom - top + 2 * padding}px`,
                // "background-color": "lightgrey"
            });

            linePathEle.setAttribute("cx", `${cx}`);
            linePathEle.setAttribute("cy", `${cy}`);
            linePathEle.setAttribute("rx", `${rx}`);
            linePathEle.setAttribute("ry", `${ry}`);
            setStyleProperties(linePathEle, {
                stroke: color,
                "stroke-width": strokeWidth,
                fill: "none",
            });
            return;
        }

    }


};

export {
    putLine
};