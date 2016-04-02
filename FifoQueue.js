function FifoQueue(size) {
    this.size = size;
    this.elements = [];
}

FifoQueue.prototype.add = function(element) {
    this.elements.push(element);
    if (this.elements.length > this.size) {
        this.elements.shift();
    }
};

module.exports = FifoQueue;