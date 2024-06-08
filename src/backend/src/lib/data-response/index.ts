// export type DataResponseMeta = Record<string, unknown>;

// export interface DataResponse<T, U extends DataResponseMeta = DataResponseMeta> {
//     data: T;
//     meta: U;
// }

// export function asResponse<T>(obj: T): DataResponse<T>;
// export function asResponse<T, U extends DataResponseMeta = Record<string, unknown>>(
//     obj: T,
//     metaObj: U,
// ): DataResponse<T, U>;
// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export function asResponse(obj: unknown, metaObj?: unknown) {
//     if (metaObj) {
//         return {
//             data: obj,
//             meta: metaObj,
//         };
//     } else {
//         return {
//             data: obj,
//             meta: {},
//         };
//     }
// }