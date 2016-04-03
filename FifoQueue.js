'use strict';

class FifoQueue {
    constructor(size) {
        this.size = size;
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
        if (this.elements.length > this.size) {
            this.elements.shift();
        }
    };
}

module.exports = FifoQueue;