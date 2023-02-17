class Cell {
    constructor(element, color, state, heatSpreadFactor) {
        // Koks elementas (pvz.: vanduo ar smelis)
        this.element = element;

        // Elemento spalva
        this.color = color;

        // Kieta, skysta ar dujine
        this.state = state;

        // Medziagos silumos laidumas
        this.heatSpreadFactor = heatSpreadFactor;

        // Medziagos temperatura
        this.temp = 0;

        // Kaip greitai skysciai skleistusi i sonus
        this.spreadFactor = 1;

        // Cia sitas kol kas naudojamas tik degimui
        this.lifetime = -1;
        this.active = false;
    }

    copy() {
        let copy = new Cell(this.element, this.color, this.state);
        copy.spreadFactor = this.spreadFactor;
        copy.lifetime = this.lifetime;
        copy.heatSpreadFactor = this.heatSpreadFactor;
        copy.temp = this.temp;
        copy.active = this.active;

        return copy;
    }
}

function airElement() {
    return new Cell(Element.Air, color(255, 255, 255, 0), State.Gas, 4.01);
}

function sandElement() {
    return new Cell(Element.Sand, color(253, 231, 181, 255), State.Solid, 4.5);
}

function solidElement() {
    return new Cell(Element.Solid, color(180, 180, 180, 255), State.Solid, 4.1);
}

function waterElement() {
    let waterElement = new Cell(Element.Water, color(15, 6, 191, 255), State.Liquid, 4.01);
    waterElement.spreadFactor = 7;

    return waterElement;
}

function smokeElement() {
    let smokeElement = new Cell(Element.Smoke, color(42, 42, 42), State.Gas, 4.01);
    smokeElement.spreadFactor = 4;

    return smokeElement;
}

function steamElement() {
    let steamElement = new Cell(Element.steamElement, color(143, 159, 234, 255), State.Gas, 4.0);
    steamElement.spreadFactor = 4;

    return steamElement;
}

function fireElement() {
    let fireElement = new Cell(Element.Fire, color(255, 42, 42), State.Plasma, 4.0);
    fireElement.spreadFactor = 1;
    fireElement.lifetime = 50;
    fireElement.temp = 1100;

    return fireElement;
}

function coalElement() {
    let coalElement = new Cell(Element.Coal, color(30, 30, 30, 255), State.Solid, 4.08);
    coalElement.lifetime = 450;
    return coalElement;
}

function woodElement() {
    let woodElement = new Cell(Element.Wood, color(76, 57, 32, 255), State.Solid, 4.1);
    woodElement.lifetime = 350;
    return woodElement;
}

function sawDustElement() {
    let sawDustElement = new Cell(Element.SawDust, color(220, 184, 138, 255), State.Solid, 4.1);
    sawDustElement.lifetime = 350;
    return sawDustElement;
}

function coldFireElement() {
    let coldFireElement = new Cell(Element.ColdFire, color(42, 42, 255), State.Plasma, 4.0);
    coldFireElement.spreadFactor = 1;
    coldFireElement.lifetime = 50;
    coldFireElement.temp = -1100;

    return coldFireElement;
}

function iceElement() {
    let iceElement = new Cell(Element.Ice, color(117, 168, 213), State.Solid, 4.01);
    return iceElement;
}

const Element = {
    Air: 0,
    Sand: 1,
    Solid: 2,
    Water: 3,
    Smoke: 4,
    Fire: 5,
    SteamElement: 6,
    Coal: 7,
    Wood: 8,
    SawDust: 9,
    ColdFire: 10,
    Ice: 11
}

const State = {
    Gas: 0,
    Liquid: 1,
    Solid: 2,
    Plasma: 3
}