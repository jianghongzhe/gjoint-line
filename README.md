## joint line

join two elements with bezier line, arc line or square line

### how to use
```js
import {putLine} from 'gjoint-line';

/**
 * from:         selector or element or rect
 * to:           selector or element or rect
 * line:         selector or element
 * orientation:  h/v
 * strokeWidth
 * color
 * shape:        bezier/arc/square, always square when orientation=v
 * fromPosition: center/edge, always center when shape=arc or orientation=v
 * toPosition:   center/edge, always center when shape=arc or orientation=v
 */
putLine("#from", "#to", "#svg", {
    orientation: 'h',
    strokeWidth: 1,
    color: 'teal',
    shape: 'bezier',
    fromPosition: 'center',
    toPosition: 'center',
});
```

line element could be an empty div or default structure
```html
<!-- empty div -->
<div></div>

<!-- default structure -->
<div>
    <svg>
        <path/>
        <ellipse/>
    </svg>
</div>
```
 
