export type Await<T> = T extends Promise<infer P> ? P : T
