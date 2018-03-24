export function range (n) {
    const ret = [];
    for (let i = 0; i < n; i++) {
        ret[i] = i;
    }
    return ret;
}

export function mod (n, m) {
    if (n < 0 && m > 0) {
        n = n + (m * Math.ceil(Math.abs(n)/m));
    }
    return n % m;
}

export function reciprocal (n) {
    return 1 / n;
}
