'use strict';
/* global $, _*/

function MockMediator() {
    var t = this;
    t.simpleQueue = [];
    t.publish = function (event, data) {
        var evt = _.find(t.simpleQueue, function (v) {
            return v.e === event;
        });
        if (evt) {
            if (!evt.p || (evt.p && !evt.p.predicate) || (evt.p && evt.p.predicate && evt.p.predicate(data))) {
                $.proxy(evt.f, evt.c)(data);
            }
        }
    };
    t.subscribe = function (event, fn, predicate, context) {
        t.simpleQueue.push({e: event, f: fn, p: predicate, c: context});
    };
    t.dispose = function () {
        t.simpleQueue = [];
    };
    return t;
}
module.exports = MockMediator;
