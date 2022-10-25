import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { isAdmin } from '../../../utils/trpc'
import { TRPCError } from '@trpc/server'
import { env } from '../../../env/server.mjs'
import dayjs from 'dayjs'
import { ApodType } from '@prisma/client'

export const apodRouter = router({
    populateDb: publicProcedure
        .input(z.string().length(32))
        .mutation(async ({ ctx, input }) => {
            if (!isAdmin(input)) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message:
                        'You are not authorized to use this route. Apply the correct key for admin actions.',
                })
            }
            let today = dayjs()
            let lastYear = dayjs().subtract(1, 'year')
            const res = await await fetch(
                `https://api.nasa.gov/planetary/apod?api_key=${env.NASA_KEY}&end_date=${today}&start_date=${lastYear}`
            )
            const data = (await res.json()) as Apod[]
            data.forEach((apod) => {
                ctx.prisma.apod.create({
                    data: {
                        author: apod.copyright,
                        createdAt: apod.date,
                        description: apod.explanation,
                        title: apod.title,
                        url: apod.url,
                        type:
                            apod.media_type === 'image'
                                ? ApodType.IMAGE
                                : ApodType.VIDEO,
                        updatedAt: dayjs().toDate(),
                    },
                })
            })
            let remainingCalls = Number.parseInt(
                res.headers.get('X-RateLimit-Remaining') ?? '999'
            )
            return {
                remainingCalls: remainingCalls,
            }
        }),

    getToday: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.apod
            .findFirst({ where: { createdAt: { equals: new Date() } } })
            .then((res) => res)
    }),
    getSpecific: publicProcedure.input(z.date()).query(({ ctx, input }) => {
        return ctx.prisma.apod.findFirst({
            where: {
                createdAt: {
                    equals: input.toDateString(),
                },
            },
        })
    }),
})
export interface Apod {
    copyright: string
    date: string
    explanation: string
    media_type: 'video' | 'image'
    service_version: string
    title: string
    url: string
}
