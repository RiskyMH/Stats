import db from '@/utils/drizzle'
import schema from '@stats-compare/db'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { YouTubeHigherOrLowerLink as YouTubeHigherOrLowerLinkActual, YouTubeOptionsSelect } from './components.client'
import { cn } from '@/utils/tw'
import TooltipText from '@/components/tooltip-text'
import { InfoIcon } from 'lucide-react'

export const revalidate = 86400 // 60 * 60 * 24


export default async function Home() {
  const groups = (await db.selectDistinct({ group: schema.YouTubeChannel.group }).from(schema.YouTubeChannel).execute())
    .map((group) => group.group)
    .filter((group) => !!group) as string[]

  return (
    <div className="container lg:max-w-[750px] pt-7 flex flex-col gap-2 mb-5" >
      <h1 className='text-3xl my-1 font-bold'>Stats Compare</h1>
      <p>This website allows you compare data. Currently there is Higher or Lower games.</p>
      <p>Made by <a href="https://riskymh.dev" target="_blank" className='text-blue-500 hover:text-blue-400 hover:underline'>RiskyMH</a> and you can submit feedback <a href="https://forms.riskymh.dev/f/tv20u7sl5xjffi3p6rx6mp75" target="_blank" className='text-blue-500 hover:text-blue-400 hover:underline'>here</a>.</p>

      <div className='flex flex-col gap-3 mt-3'>
        <div className='bg-secondary rounded-lg px-3 pt-1 pb-4'>
          <h3 className="font-bold text-xl py-3">YouTube Games</h3>
          <div className='flex flex-col gap-2 text-sm'>
            <h4 className="text-lg font-bold">Choose the group:</h4>
            <Suspense fallback={<div className="h-10 w-[180px] bg-background px-3 py-2 rounded-md">Popular</div>}>
              <YouTubeOptionsSelect groups={groups} />
            </Suspense>
            <h4 className="text-lg font-bold">Higher or Lower</h4>
            <YouTubeHigherOrLowerLink type="youtube-video-views" className="font-bold">YouTube Video Views</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-video-likes">YouTube Video Likes</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-video-comments">YouTube Video Comments</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-channel-subs" className="font-bold">YouTube Channel Subscribers</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-channel-views">YouTube Channel Views</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-channel-videos">YouTube Channel Videos</YouTubeHigherOrLowerLink>
            <YouTubeHigherOrLowerLink type="youtube-random" className="font-bold">
              YouTube Random
              <TooltipText text="This includes all the types of data and you compare the numbers on either side">
                <InfoIcon size={16} className="text-white hover:text-white" />
              </TooltipText>
            </YouTubeHigherOrLowerLink>
          </div>
        </div>

        <div className='bg-secondary rounded-lg px-3 pt-1 pb-4'>
          <h3 className="font-bold text-xl py-3">Country Games</h3>
          <div className='flex flex-col gap-2 text-sm'>
            <h4 className="text-lg font-bold">Higher or Lower</h4>
            <HigherOrLowerLink type="country-population">Country Populations</HigherOrLowerLink>
            <HigherOrLowerLink type="country-area">Country Area</HigherOrLowerLink>
            <HigherOrLowerLink type="country-random">
              Country Random
              <TooltipText text="This includes all the types of data and you compare the numbers on either side">
                <InfoIcon size={16} className="text-white hover:text-white" />
              </TooltipText>
            </HigherOrLowerLink>
          </div>
        </div>

        <div className='bg-secondary rounded-lg px-3 pt-1 pb-4'>
          <h3 className="font-bold text-xl py-3">Another thing?</h3>
          <div className='text-sm'>
            Only a few stats are implemented right now. <Link href="https://forms.riskymh.dev/f/tv20u7sl5xjffi3p6rx6mp75" className='text-blue-500 hover:text-blue-400 hover:underline'>Use this form to submit feedback or suggest gamemodes</Link>.
          </div>
        </div>
      </div>

    </div>
  )
}

function HigherOrLowerLink({ type, children, className }: { type: string, children: ReactNode, className?: string }) {
  return <Link href={`/higher-or-lower?type=${type}`} className={cn('text-blue-500 hover:text-blue-400 hover:underline flex gap-2', className)}>{children}</Link>
}


function YouTubeHigherOrLowerLink({ type, children, className }: { type: string, children: ReactNode, className?: string }) {
  className = cn('text-blue-500 hover:text-blue-400 hover:underline flex gap-2', className)
  const fallback = (<Link href={`/higher-or-lower?type=${type}`} className={className}>{children}</Link>)
  
  return (
    <Suspense fallback={fallback}>
      <YouTubeHigherOrLowerLinkActual type={type} className={className}>
        {children}
      </YouTubeHigherOrLowerLinkActual>
    </Suspense>
  )
}
