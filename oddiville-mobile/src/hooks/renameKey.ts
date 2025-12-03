type RenameKey<T, K extends keyof T, NK extends PropertyKey> =
    Omit<T, K> & { [P in NK]: T[K] };

export const renameKey = <
    T extends object,
    K extends keyof T,
    NK extends PropertyKey
>(
    obj: T,
    oldKey: K,
    newKey: NK extends K ? never : NK,
    mutate?: boolean
): RenameKey<T, K, NK> | (T & { [P in NK]: T[K] }) => {
    if (mutate) {
        if (oldKey in obj) {
            (obj as any)[newKey] = obj[oldKey];
            delete obj[oldKey];
        }
        return obj as any;
    } else {
        const { [oldKey]: old, ...rest } = obj;
        return {
            [newKey]: old,
            ...rest
        } as any;
    }
};



// let user1 = { username: 'bob', age: 20 };

// Immutable rename
// const newUser = renameKey(user1, 'username', 'name');
// { name: 'bob', age: 20 }
// { username: 'bob', age: 20 } - unchanged

// Mutable rename
// let user2 = { username: 'alice', age: 25 };
// renameKey(user2, 'username', 'name', true);
// { name: 'alice', age: 25 } - changed in-place
