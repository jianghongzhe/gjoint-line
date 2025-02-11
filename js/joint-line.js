/**
 * get element
 * @param selectorOrEle
 * @returns {{tagName}|*|Element}
 */
const getElement = (selectorOrEle) => {
    console.log("getElement", selectorOrEle);

    if ('object' === typeof selectorOrEle && selectorOrEle.tagName) {
        return selectorOrEle;
    }
    if ('string' === typeof selectorOrEle) {
        return document.querySelector(selectorOrEle);
    }
    console.error("cannot get element", selectorOrEle);
    throw new Error("cannot get element");
};

const round = (num) => parseInt(`${Math.round(num)}`);

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
    Object.keys(props).forEach(k => {
        ele.style.setProperty(k, null === props[k] || '' === props[k] ? '' : props[k]);
    });
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

const createRectBaseOn = (rect, newX, newY) => {
    const newRect = {
        x: rect.x,
        y: rect.y,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
    };
    adjustRect(newRect, newX, newY);
    return newRect;
};

const adjustRect = (rect, newX, newY) => {
    if (['number', 'string'].includes(typeof newX)) {
        newX = parseInt(newX);
        rect.x = newX;
        rect.left = newX;
        rect.right = newX + rect.width;
    }
    if (['number', 'string'].includes(typeof newY)) {
        newY = parseInt(newY);
        rect.y = newY;
        rect.top = newY;
        rect.bottom = newY + rect.height;
    }
};

const isRect = (rect) => {
    return (
        'object' === typeof (rect) &&
        'left' in rect &&
        'top' in rect &&
        'right' in rect &&
        'bottom' in rect &&
        'width' in rect &&
        'height' in rect
    );
};

/**
 *
 * @param from
 * @param to
 * @param line
 * @param orientation h/v
 * @param strokeWidth
 * @param shape bezier/arc/square, always square when orientation=v
 * @param fromPosition center/edge, always center when shape=arc or orientation=v
 * @param toPosition center/edge, always center when shape=arc or orientation=v
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


    const lineWrapperEle = getElement(line);
    const svgNS = "http://www.w3.org/2000/svg";
    let lineSvgEle = lineWrapperEle.querySelector("svg") ||
        lineWrapperEle.appendChild(document.createElementNS(svgNS, "svg"));
    const linePathEle = lineSvgEle.querySelector("path") ||
        lineSvgEle.appendChild(document.createElementNS(svgNS, "path"));
    const lineEllipseEle = lineSvgEle.querySelector("ellipse") ||
        lineSvgEle.appendChild(document.createElementNS(svgNS, "ellipse"));

    let fromRect;
    if (isRect(from)) {
        fromRect = from;
    } else {
        const fromEle = getElement(from);
        const relativeRect = fromEle.parentNode.getBoundingClientRect();
        fromRect = getRelativeRect(fromEle.getBoundingClientRect(), relativeRect);
    }

    let toRect;
    if (isRect(to)) {
        toRect = to;
    } else {
        const toEle = getElement(to);
        const relativeRect = toEle.parentNode.getBoundingClientRect();
        toRect = getRelativeRect(toEle.getBoundingClientRect(), relativeRect);
    }


    const baseContext = {
        orientation,
        strokeWidth,
        fromPosition,
        toPosition,
        shape,
        color,

        // fromEle,
        // toEle,
        lineWrapperEle,
        lineSvgEle,
        linePathEle,
        lineEllipseEle,
        fromRect,
        toRect,
    };

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

        const context = {...baseContext, getJointPointTop,};

        if (ShapeEnum.bezier === shape) {
            bezierHLine(context);
            return;
        }
        if (ShapeEnum.arc === shape) {
            arcHLine(context);
            return;
        }
        if (ShapeEnum.square === shape) {
            squareHLine(context);
            return;
        }
        return;
    }

    if ('v' === orientation) {
        const getJointPointLeft = (rect, position) => {
            if (PositionEnum.center === position) {
                return round(rect.left + rect.width / 2 - strokeWidth / 2);
            }
            console.error(`unsupported joint point position: ${position}`);
            throw new Error("unsupported joint point position");
        };
        const context = {...baseContext, getJointPointLeft,};
        squareVLine(context);
    }
};


const bezierHLine = ({
                         strokeWidth,
                         fromPosition,
                         toPosition,
                         color,
                         lineWrapperEle,
                         lineSvgEle,
                         linePathEle,
                         lineEllipseEle,
                         fromRect,
                         toRect,
                         getJointPointTop,
                     }) => {

    if (lineEllipseEle) {
        setStyleProperties(lineEllipseEle, {display: 'none',});
    }

    const padding = 10;

    const leftToRight = (fromRect.left < toRect.left);
    let left = (leftToRight ? fromRect.right : toRect.right);
    let right = (leftToRight ? toRect.left : fromRect.left);

    // control point: min(xDist*3/4, 75)
    const controlLevel = Math.min(round(Math.abs(right - left) * 0.75), 75);

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
    let c1y;
    let c2x = x2 - controlLevel;
    let c2y;

    if (!lineLeftRightTopDown) {
        [y1, y2] = [y2, y1];
    }

    c1y = y1;
    c2y = y2;

    setStyleProperties(lineWrapperEle, {
        left: `${left - padding}px`,
        width: `${right - left + 2 * padding}px`,
        top: `${top - padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: "absolute",
        overflow: null,
    });

    setStyleProperties(lineSvgEle, {
        width: `${right - left + 2 * padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: null,
        bottom: null,
        right: null,
    });

    linePathEle.setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`);
    setStyleProperties(linePathEle, {
        stroke: color,
        "stroke-width": strokeWidth,
        fill: "none",
        display: "block",
    });
};

const arcHLine = ({
                      strokeWidth,
                      color,
                      lineWrapperEle,
                      lineSvgEle,
                      linePathEle,
                      lineEllipseEle,
                      fromRect,
                      toRect,
                      getJointPointTop,
                  }) => {
    if (linePathEle) {
        setStyleProperties(linePathEle, {display: 'none',});
    }

    const leftToRight = (fromRect.left < toRect.left);
    let left = round(leftToRight ? fromRect.right - fromRect.width / 2 : toRect.right);
    let right = round(leftToRight ? toRect.left : fromRect.right - fromRect.width / 2);

    const fromTop = getJointPointTop(fromRect, PositionEnum.center);
    const toTop = getJointPointTop(toRect, PositionEnum.center);
    const topToDown = (fromTop < toTop);
    const top = Math.min(fromTop, toTop);
    const bottom = Math.max(fromTop, toTop) + strokeWidth;

    setStyleProperties(lineWrapperEle, {
        left: `${left}px`,
        width: `${right - left}px`,
        top: `${top}px`,
        height: `${bottom - top}px`,
        position: "absolute",
        "background-color": "transparent",
        overflow: "hidden",
    });


    const svgStyle = {
        width: `${(right - left) * 2}px`,
        height: `${(bottom - top) * 2}px`,
        "background-color": "transparent",
        position: "absolute",
        bottom: null,
        right: null,
    };

    if (leftToRight && topToDown) {
        svgStyle.bottom = `0`;
    }
    if (leftToRight && !topToDown) {
        // nothing to do
    }
    if (!leftToRight && topToDown) {
        svgStyle.bottom = `0`;
        svgStyle.right = `0`;
    }
    if (!leftToRight && !topToDown) {
        svgStyle.right = `0`;
    }

    setStyleProperties(lineSvgEle, svgStyle);

    lineEllipseEle.setAttribute("cx", `${right - left}`);
    lineEllipseEle.setAttribute("cy", `${bottom - top}`);
    lineEllipseEle.setAttribute("rx", `${right - left - strokeWidth / 2}`);
    lineEllipseEle.setAttribute("ry", `${bottom - top - strokeWidth / 2}`);
    setStyleProperties(lineEllipseEle, {
        stroke: color,
        "stroke-width": strokeWidth,
        fill: "none",
        display: "block",
    });
};

const squareHLine = ({
                         strokeWidth,
                         fromPosition,
                         toPosition,
                         color,
                         lineWrapperEle,
                         lineSvgEle,
                         linePathEle,
                         lineEllipseEle,
                         fromRect,
                         toRect,
                         getJointPointTop,
                     }) => {
    if (lineEllipseEle) {
        setStyleProperties(lineEllipseEle, {display: 'none',});
    }

    const padding = 10;
    const controlRate = 0.4;

    const leftToRight = (fromRect.left < toRect.left);
    let left = (leftToRight ? fromRect.right : toRect.right);
    let right = (leftToRight ? toRect.left : fromRect.left);

    const fromTop = getJointPointTop(fromRect, fromPosition);
    const toTop = getJointPointTop(toRect, toPosition);
    const top = Math.min(fromTop, toTop);
    const bottom = Math.max(fromTop, toTop) + strokeWidth;

    // look from left to right, whether the line is up to down
    const lineLeftRightTopDown = ((leftToRight && fromTop < toTop) || (!leftToRight && fromTop > toTop));

    let step = round((right - left) * controlRate);
    let x1 = padding;
    let y1 = padding + strokeWidth / 2;
    let x2 = padding + (right - left);
    let y2 = (padding + bottom - top - strokeWidth / 2);


    if (!lineLeftRightTopDown) {
        [y1, y2] = [y2, y1];
    }

    let cx = (leftToRight ? x1 + step : x2 - step);

    setStyleProperties(lineWrapperEle, {
        left: `${left - padding}px`,
        width: `${right - left + 2 * padding}px`,
        top: `${top - padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: "absolute",
        overflow: null,
    });

    setStyleProperties(lineSvgEle, {
        width: `${right - left + 2 * padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: null,
        bottom: null,
        right: null,
    });

    linePathEle.setAttribute("d", `M ${x1} ${y1} L ${cx} ${y1} L ${cx} ${y2} L ${x2} ${y2}`);
    setStyleProperties(linePathEle, {
        stroke: color,
        "stroke-width": strokeWidth,
        fill: "none",
        display: "block",
    });
};

const squareVLine = ({
                         strokeWidth,
                         fromPosition,
                         toPosition,
                         color,
                         lineWrapperEle,
                         lineSvgEle,
                         linePathEle,
                         lineEllipseEle,
                         fromRect,
                         toRect,
                         getJointPointLeft,
                     }) => {

    if (lineEllipseEle) {
        setStyleProperties(lineEllipseEle, {display: 'none',});
    }

    const padding = 10;
    const controlRate = 0.4;

    const topToBottom = (fromRect.top < toRect.top);
    let top = (topToBottom ? fromRect.bottom : toRect.bottom);
    let bottom = (topToBottom ? toRect.top : fromRect.top);

    const fromLeft = getJointPointLeft(fromRect, fromPosition);
    const toLeft = getJointPointLeft(toRect, toPosition);
    const left = Math.min(fromLeft, toLeft);
    const right = Math.max(fromLeft, toLeft) + strokeWidth;

    // look from top to bottom, whether the line is left to right
    const lineTopDownLeftRight = ((topToBottom && fromLeft < toLeft) || (!topToBottom && fromLeft > toLeft));

    let step = round((bottom - top) * controlRate);
    let x1 = padding + strokeWidth / 2;
    let y1 = padding;
    let x2 = (padding + right - left - strokeWidth / 2);
    let y2 = padding + (bottom - top);

    if (!lineTopDownLeftRight) {
        [x1, x2] = [x2, x1];
    }

    let cy = (topToBottom ? y1 + step : y2 - step);

    setStyleProperties(lineWrapperEle, {
        left: `${left - padding}px`,
        width: `${right - left + 2 * padding}px`,
        top: `${top - padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: "absolute",
        overflow: null,
    });

    setStyleProperties(lineSvgEle, {
        width: `${right - left + 2 * padding}px`,
        height: `${bottom - top + 2 * padding}px`,
        "background-color": "transparent",
        position: null,
        bottom: null,
        right: null,
    });

    linePathEle.setAttribute("d", `M ${x1} ${y1} L ${x1} ${cy} L ${x2} ${cy} L ${x2} ${y2}`);
    setStyleProperties(linePathEle, {
        stroke: color,
        "stroke-width": strokeWidth,
        fill: "none",
        display: "block",
    });
};

export {
    putLine,
    createRectBaseOn,
    isRect,
};