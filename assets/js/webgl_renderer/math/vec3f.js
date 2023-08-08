class Vec3f {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        // TODO: Possibly we can optimize by recomputing lengthSq and length each time the value is updated
    }

    add(v) {
        var re = new Vec3f(this.x + v.x, this.y + v.y, this.z + v.z);
        return re;
    }

    addScalar(s) {
        var re = new Vec3f(this.x + s, this.y + s, this.z + s);
        return re;
    }

    mulScalar(s) {
        var re = new Vec3f(this.x * s, this.y * s, this.z * s);
        return re;
    }

    negate() {
        var re = new Vec3f(-this.x, -this.y, -this.z);
        return re;
    }

    distanceTo(v) {
        var diff = this.add(v.negate());
        return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
    }

    lengthSq() {
        return (this.x * this.x + this.y * this.y + this.z * this.z);
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    norm() {
        var len = this.length();
        var re = new Vec3f(this.x / len, this.y / len, this.z / len);
        return re;
    }

    test() {
        var vec3one = new Vec3f(10, 0, 1);
        var vec3zero = new Vec3f(0, 0, 0);
        //var addReulst = vec3one.add(new Vec3f(0, 0, 0));
        var dist = vec3one.distanceTo(vec3zero);
        console.log(dist);
    
        var normalizeVec3one = vec3one.norm();
        console.log(normalizeVec3one.length());    
    }
}