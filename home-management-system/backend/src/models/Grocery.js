
class Grocery {
    constructor() {
        this.items = [];
    }

    addItem(name, quantity) {
        const existingItem = this.items.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ name, quantity });
        }
    }

    subtractItem(name, quantity) {
        const existingItem = this.items.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity -= quantity;
            if (existingItem.quantity <= 0) {
                this.items = this.items.filter(item => item.name !== name);
            }
        }
    }

    getItems() {
        return this.items;
    }
}

export default new Grocery();