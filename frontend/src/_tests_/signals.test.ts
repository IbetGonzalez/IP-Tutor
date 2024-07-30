import {  expect, it } from 'vitest';
import { Computed, Effect, Signal } from "@util/signal";

it("Signal creation and increment", () => {
    const testSig = new Signal(5);

    expect(testSig.value).toBe(5);

    testSig.value++;
    expect(testSig.value).toBe(6);

});

it("Computed creation and observation", () => {
    const testSig = new Signal(5);
    const testComp = new Computed(() => testSig.value * 2);
    const testComp2 = new Computed(() => testSig.value * 3);

    expect(testComp.value).toBe(10);
    expect(testComp2.value).toBe(15);

    testSig.value++; // 6
    expect(testComp.value).toBe(12);
    expect(testComp2.value).toBe(18);

    testSig.value++; // 7
    expect(testComp.value).toBe(14);
    expect(testComp2.value).toBe(21);
});
it("Effect recalculating", () => {
    const testSig = new Signal(5);
    let testVal = 0;

    const testEff = new Effect(() => {
        testVal = testSig.value * 2;
    })
    
    expect(testVal).toBe(10);

    testSig.value++;
    expect(testVal).toBe(12);
});
