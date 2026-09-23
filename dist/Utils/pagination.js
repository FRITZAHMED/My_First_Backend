export function toSkipTake(page, limit) {
    return { skip: (page - 1) * limit, take: limit };
}
export function buildMeta(page, limit, total) {
    return { page, limit, total, pages: Math.ceil(total / limit) };
}
