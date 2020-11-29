const _mod = (x, y) => Math.abs(x % y)

const _randn = () => Math.random() - 0.5

const _minmax = (m) => m.reduce((a, c) => a = [Math.min(a[0], c), Math.max(a[1], c)], [Number.MAX_VALUE, Number.MIN_VALUE])

const _rescale = (m, s, mm = _minmax(m)) => m.map(x => Math.floor(s * (x - mm[0]) / (mm[1] - mm[0])))

var grid = function (w, h, f) {
    var _m = new Array(w * h).fill(f)

    const _g = (v) => _m[_mod(v[0], w) + _mod(v[1], h) * w]

    const _s = (v, n) => _m[_mod(v[0], w) + _mod(v[1], h) * w] = n

    const _sifu = (v, n) => {
        if (_g(v) === undefined)
            _s(v, n)
    }

    const _reset = () => {
        _m = new Array(w * h).fill(f)
    }

    return {
        m: _m,

        w: w,

        h: h,

        g: _g,

        s: _s,

        sifu: _sifu,

        rescale: function (s) {
            _m = _rescale(_m, s)
        },

        reset: _reset
    }
}

const _mid = (a) => a[0] + Math.floor((a[1] - a[0]) / 2)

const _midpt = (a, b) => [_mid(a), _mid(b)]

var world = function (n = 7, s = 256, ss = 32) {

    const _pow = (x) => Math.floor(Math.pow(2, x))

    const _d = _pow(n) + 1  // 2^n + 1 x 2^n + 1 grid

    const _scale = (n) => Math.exp(-n / 1.5)

    var land = grid(_d, _d)

    function _subdivide(d, x0, y0, x1, y1) {  // TODO more elegant perhaps
        if (d > n) return
        const mx = x0 + Math.floor((x1 - x0) / 2)
        const my = y0 + Math.floor((y1 - y0) / 2)
        const avg = (land.g([x0, y0]) + land.g([x1, y0]) + land.g([x1, y1]) + land.g([x0, y1])) / 4.0
        land.s([mx, my], avg + _randn() * _scale(d))
        land.sifu([mx, y0], avg + _randn() * _scale(d))
        land.sifu([x1, my], avg + _randn() * _scale(d))
        land.sifu([mx, y1], avg + _randn() * _scale(d))
        land.sifu([x0, my], avg + _randn() * _scale(d))
        _subdivide(d + 1, x0, y0, mx, my)
        _subdivide(d + 1, mx, y0, x1, my)
        _subdivide(d + 1, x0, my, mx, y1)
        _subdivide(d + 1, mx, my, x1, y1)
    }

    function _generate() {
        land.reset()
        var d = 0
        land.s([0, 0], _randn() * _scale(d))
        land.s([_d - 1, _d - 1], _randn() * _scale(d))
        land.s([_d - 1, 0], _randn() * _scale(d))
        land.s([0, _d - 1], _randn() * _scale(d))
        _subdivide(d, 0, 0, _d, _d)
        land.rescale(s)
    }

    _generate()

    return {
        m: land.m,

        w: land.w,

        h: land.h,

        g: land.g,

        s: land.s,

        wtom: function (r) {
            return r.map(x => Math.floor(x / ss))
        },

        mtow: function (r) {
            return r.map(x => x * ss)
        },

        generate: function () {
            _generate()
        }
    }
}