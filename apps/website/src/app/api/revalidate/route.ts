import { revalidatePath, revalidateTag } from "next/cache"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const token = request.headers.get('authorization')
    if (token !== process.env.REVALIDATE_TOKEN) {
        return new Response('Unauthorized', { status: 401 })
    }

    revalidateTag("youtube:channels")
    revalidateTag("youtube:videos")
    revalidateTag("country-populations")
    // revalidatePath("/")

    return new Response('OK', { status: 200 })
}