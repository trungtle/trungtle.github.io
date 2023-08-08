class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    at(t) {
        return this.origin.add(this.direction.mulScalar(t));
    }
}