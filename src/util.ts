class AssertError extends Error {}

export function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new AssertError(message);
    }
}

export function pair <A, B> (a: A, b: B): [A, B] {
    return [a, b];
}
